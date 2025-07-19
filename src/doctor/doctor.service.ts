import {Injectable, InternalServerErrorException, NotFoundException} from '@nestjs/common';
import {CreateDoctorDto} from "./dto/CreateDoctorDto";
import {InjectRepository} from "@nestjs/typeorm";
import {ILike, In, Repository} from "typeorm";
import {Doctor} from "./entity/doctor.entity";
import {Favor} from "../favor/entity/favor.entity";

@Injectable()
export class DoctorService {
    constructor(
        @InjectRepository(Doctor)
        private readonly doctorRepo: Repository<Doctor>,
        
        @InjectRepository(Favor)
        private readonly favorRepo: Repository<Favor>
    ) {
    }
    
    async createDoctor(dto: CreateDoctorDto) {
        const existingByEmail = await this.doctorRepo.findOneBy({ email: dto.email });
        if (existingByEmail) {
            throw new Error('Doctor with this email already exists');
        }
        const existingByPhone = await this.doctorRepo.findOneBy({ phoneNumber: dto.phoneNumber });
        if (existingByPhone) {
            throw new Error('Doctor with this phone number already exists');
        }
        const doctor = this.doctorRepo.create(dto);
        return await this.doctorRepo.save(doctor);
    }

    async findDoctors(
        firstName?: string,
        lastName?: string,
        phoneNumber?: string,
        email?: string,
        sortBy: 'firstName' | 'lastName' = 'firstName',
        sortOrder: 'asc' | 'desc' = 'asc'
    ) {
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
            throw new InternalServerErrorException(error.message);
        }
    }

    async getDoctorById(id: number): Promise<Doctor> {
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
    }

    async updateDoctor(id: number, body: { firstName?: string; lastName?: string; phoneNumber?: string; email?: string }) {
        const doctor = await this.doctorRepo.findOneBy({ id });
        if (!doctor) throw new NotFoundException('Doctor not found');
        
        if (body.firstName) doctor.firstName = body.firstName;
        if (body.lastName) doctor.lastName = body.lastName;
        if (body.phoneNumber) doctor.phoneNumber = body.phoneNumber;
        if (body.email) doctor.email = body.email;
        
        return this.doctorRepo.save(doctor);
    }

    async deleteDoctor(id: number) {
        const doctor = await this.doctorRepo.findOneBy({ id });
        if (!doctor) throw new NotFoundException('Doctor not found');
        await this.doctorRepo.remove(doctor);
        return { message: 'Doctor deleted successfully' };
    }

    async addFavorsToDoctor(doctorId: number, favorIds: number[]): Promise<Doctor> {
        const doctor = await this.getDoctorById(doctorId);
        const favors = await this.favorRepo.findBy({ id: In(favorIds) });

        if (favors.length !== favorIds.length) {
            throw new NotFoundException('Some favors not found');
        }

        doctor.favors = [...(doctor.favors || []), ...favors];
        return this.doctorRepo.save(doctor);
    }

    async removeFavorFromDoctor(doctorId: number, favorId: number): Promise<Doctor> {
        const doctor = await this.getDoctorById(doctorId);
        doctor.favors = (doctor.favors || []).filter(favor => favor.id !== favorId);
        return this.doctorRepo.save(doctor);
    }

    async updateFavorsForDoctor(doctorId: number, favorIds: number[]): Promise<Doctor> {
        const doctor = await this.getDoctorById(doctorId);
        const favors = await this.favorRepo.findBy({ id: In(favorIds) });

        if (favors.length !== favorIds.length) {
            throw new NotFoundException('Some favors not found');
        }

        doctor.favors = favors;
        return this.doctorRepo.save(doctor);
    }
}
