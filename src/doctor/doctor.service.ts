import {Injectable, InternalServerErrorException, NotFoundException, BadRequestException} from '@nestjs/common';
import {CreateDoctorDto} from "./dto/CreateDoctorDto";
import {InjectRepository} from "@nestjs/typeorm";
import {ILike, In, Repository} from "typeorm";
import {Doctor} from "./entity/doctor.entity";
import {Favor} from "../favor/entity/favor.entity";

interface DeleteResponse {
    message: string;
}

interface RemoveFavorResponse {
    message: string;
    updatedDoctor: Doctor;
}

@Injectable()
export class DoctorService {
    constructor(
        @InjectRepository(Doctor)
        private readonly doctorRepo: Repository<Doctor>,
        
        @InjectRepository(Favor)
        private readonly favorRepo: Repository<Favor>
    ) {
    }
    
    async createDoctor(dto: CreateDoctorDto): Promise<Doctor> {
        try {
            const existingByEmail = await this.doctorRepo.findOneBy({ email: dto.email });
            if (existingByEmail) {
                throw new BadRequestException('Doctor with this email already exists');
            }
            
            const existingByPhone = await this.doctorRepo.findOneBy({ phoneNumber: dto.phoneNumber });
            if (existingByPhone) {
                throw new BadRequestException('Doctor with this phone number already exists');
            }
            
            const doctor = this.doctorRepo.create(dto);
            return await this.doctorRepo.save(doctor);
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to create doctor');
        }
    }

    async findDoctors(
        firstName?: string,
        lastName?: string,
        phoneNumber?: string,
        email?: string,
        sortBy: 'firstName' | 'lastName' = 'firstName',
        sortOrder: 'asc' | 'desc' = 'asc'
    ): Promise<Doctor[]> {
        try {
            const where: any = {};

            if (firstName) where.firstName = ILike(`%${firstName}%`);
            if (lastName) where.lastName = ILike(`%${lastName}%`);
            if (phoneNumber) where.phoneNumber = ILike(`%${phoneNumber}%`);
            if (email) where.email = ILike(`%${email}%`);

            const doctors = await this.doctorRepo.find({
                where,
                order: {
                    [sortBy]: sortOrder
                },
                relations: {
                    favors: true,
                    clinics: true
                }
            });

            return doctors;
        } catch (error) {
            throw new InternalServerErrorException('Failed to fetch doctors');
        }
    }

    async getDoctorById(id: number): Promise<Doctor> {
        try {
            const doctor = await this.doctorRepo.findOne({
                where: { id },
                relations: {
                    favors: true,
                    clinics: true
                }
            });

            if (!doctor) {
                throw new NotFoundException(`Doctor with ID ${id} not found`);
            }

            return doctor;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to fetch doctor');
        }
    }

    async updateDoctor(id: number, body: { firstName?: string; lastName?: string; phoneNumber?: string; email?: string }): Promise<Doctor> {
        try {
            const doctor = await this.doctorRepo.findOneBy({ id });
            if (!doctor) {
                throw new NotFoundException('Doctor not found');
            }
            
            if (body.email && body.email !== doctor.email) {
                const existingDoctor = await this.doctorRepo.findOneBy({ email: body.email });
                if (existingDoctor) {
                    throw new BadRequestException('Doctor with this email already exists');
                }
            }
            
            if (body.phoneNumber && body.phoneNumber !== doctor.phoneNumber) {
                const existingDoctor = await this.doctorRepo.findOneBy({ phoneNumber: body.phoneNumber });
                if (existingDoctor) {
                    throw new BadRequestException('Doctor with this phone number already exists');
                }
            }
            
            if (body.firstName) doctor.firstName = body.firstName;
            if (body.lastName) doctor.lastName = body.lastName;
            if (body.phoneNumber) doctor.phoneNumber = body.phoneNumber;
            if (body.email) doctor.email = body.email;
            
            return await this.doctorRepo.save(doctor);
        } catch (error) {
            if (error instanceof BadRequestException || error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to update doctor');
        }
    }

    async deleteDoctor(id: number): Promise<void> {
        try {
            const doctor = await this.doctorRepo.findOneBy({ id });
            if (!doctor) {
                throw new NotFoundException('Doctor not found');
            }
            
            await this.doctorRepo.remove(doctor);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to delete doctor');
        }
    }

    async addFavorsToDoctor(doctorId: number, favorIds: number[]): Promise<Doctor> {
        try {
            const doctor = await this.getDoctorById(doctorId);
            if (!doctor) {
                throw new NotFoundException('Doctor not found');
            }
            const favors = await this.favorRepo.findBy({ id: In(favorIds) });

            if (favors.length !== favorIds.length) {
                const foundIds = favors.map(f => f.id);
                const missingIds = favorIds.filter(id => !foundIds.includes(id));
                throw new BadRequestException(`Favors with IDs [${missingIds.join(', ')}] not found`);
            }

            const existingFavorIds = (doctor.favors || []).map(f => f.id);
            const newFavors = favors.filter(f => !existingFavorIds.includes(f.id));
            
            if (newFavors.length === 0) {
                throw new BadRequestException('All specified favors are already assigned to this doctor');
            }

            doctor.favors = [...(doctor.favors || []), ...newFavors];
            return await this.doctorRepo.save(doctor);
        } catch (error) {
            if (error instanceof BadRequestException || error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to add favors to doctor');
        }
    }

    async removeFavorFromDoctor(doctorId: number, favorId: number): Promise<void> {
        try {
            const doctor = await this.getDoctorById(doctorId);
            if (!doctor) {
                throw new NotFoundException('Doctor not found');
            }
            const favorExists = (doctor.favors || []).some(favor => favor.id === favorId);
            if (!favorExists) {
                throw new BadRequestException(`Favor with ID ${favorId} is not assigned to this doctor`);
            }

            doctor.favors = (doctor.favors || []).filter(favor => favor.id !== favorId);
            await this.doctorRepo.save(doctor);
        } catch (error) {
            if (error instanceof BadRequestException || error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to remove favor from doctor');
        }
    }

    async updateFavorsForDoctor(doctorId: number, favorIds: number[]): Promise<Doctor> {
        try {
            const doctor = await this.getDoctorById(doctorId);
            if (!doctor) {
                throw new NotFoundException('Doctor not found');
            }       
            const favors = await this.favorRepo.findBy({ id: In(favorIds) });

            if (favors.length !== favorIds.length) {
                const foundIds = favors.map(f => f.id);
                const missingIds = favorIds.filter(id => !foundIds.includes(id));
                throw new BadRequestException(`Favors with IDs [${missingIds.join(', ')}] not found`);
            }

            doctor.favors = favors;
            return await this.doctorRepo.save(doctor);
        } catch (error) {
            if (error instanceof BadRequestException || error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to update favors for doctor');
        }
    }
}
