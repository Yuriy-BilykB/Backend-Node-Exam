import {BadRequestException, Injectable, InternalServerErrorException, NotFoundException} from '@nestjs/common';
import {CreateClinicDto} from "./dto/CreateClinicDto";
import {UpdateClinicDto} from "./dto/UpdateClinicDto";
import {Clinic} from "./entity/clinic.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {ILike, In, Repository} from "typeorm";
import {Doctor} from "../doctor/entity/doctor.entity";
import {Favor} from "../favor/entity/favor.entity";

type ClinicWithFavors = Clinic & { favors: Favor[] };

@Injectable()
export class ClinicService {
    constructor(
        @InjectRepository(Clinic)
        private readonly clinicRepo: Repository<Clinic>,

        @InjectRepository(Doctor)
        private readonly doctorRepo: Repository<Doctor>,

        @InjectRepository(Favor)
        private readonly favorRepo: Repository<Favor>
    ) {
    }
    
    async createClinic(dto: CreateClinicDto): Promise<ClinicWithFavors > {
        try {
            const clinic = await this.clinicRepo.findOneBy({ name: dto.name });
            if (clinic) {
                throw new BadRequestException("Clinic with this name already exists");
            }
            const doctors = await this.doctorRepo.findBy({id: In(dto.doctorIds)});
            const newClinic = this.clinicRepo.create({ name: dto.name, doctors });
            const savedClinic = await this.clinicRepo.save(newClinic);
            return {
                ...savedClinic,
                favors: this.getClinicFavors(savedClinic.doctors)
            };
        }catch (err) {
            if (err.code === '23505') {
                throw new BadRequestException("Clinic with this name already exists");
            }
            throw err;
        }
    }

    async getClinics(name?: string, sort: 'asc' | 'desc' = 'asc', favorName?: string, doctorName?: string): Promise<ClinicWithFavors[]> {
        try {
            let query = this.clinicRepo.createQueryBuilder('clinic')
                .leftJoinAndSelect('clinic.doctors', 'doctor')
                .leftJoinAndSelect('doctor.favors', 'doctorFavor');

            if (name) {
                query = query.where('clinic.name ILIKE :name', { name: `%${name}%` });
            }

            if (favorName) {
                query = query.andWhere('doctorFavor.name ILIKE :favorName', { favorName: `%${favorName}%` });
            }

            if (doctorName) {
                query = query.andWhere('(doctor.firstName ILIKE :doctorName OR doctor.lastName ILIKE :doctorName)', { doctorName: `%${doctorName}%` });
            }

            query = query.orderBy('clinic.name', sort.toUpperCase() as 'ASC' | 'DESC');

            const clinics = await query.getMany();

            if (!clinics || clinics.length === 0) {
                throw new NotFoundException('Clinics not found');
            }

            return clinics.map(clinic => ({
                ...clinic,
                favors: this.getClinicFavors(clinic.doctors)
            }));
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }

    async getClinicById(id: number): Promise<ClinicWithFavors> {
        const clinic = await this.clinicRepo.findOne({
            where: { id },
            relations: {
                doctors: {
                    favors: true
                }
            }
        });

        if (!clinic) {
            throw new NotFoundException(`Clinic with ID ${id} not found`);
        }

        return {
            ...clinic,
            favors: this.getClinicFavors(clinic.doctors)
        };
    }

    async updateClinic(id: number, dto: UpdateClinicDto): Promise<ClinicWithFavors> {
        const clinic = await this.getClinicById(id);

        if (dto.name) {
            clinic.name = dto.name;
        }

        if (dto.doctorIds) {
            const doctors = await this.doctorRepo.findBy({ id: In(dto.doctorIds) });
            clinic.doctors = doctors;
        }

        const savedClinic = await this.clinicRepo.save(clinic);
        
        return {
            ...savedClinic,
            favors: this.getClinicFavors(savedClinic.doctors)
        };
    }

    async deleteClinic(id: number): Promise<{ message: string }> {
        const clinic = await this.getClinicById(id);
        await this.clinicRepo.remove(clinic);
        return { message: 'Clinic deleted successfully' };
    }

    async addDoctorsToClinic(clinicId: number, doctorIds: number[]): Promise<ClinicWithFavors> {
        const clinic = await this.getClinicById(clinicId);
        const doctors = await this.doctorRepo.findBy({ id: In(doctorIds) });

        if (doctors.length !== doctorIds.length) {
            throw new NotFoundException('Some doctors not found');
        }

        clinic.doctors = [...clinic.doctors, ...doctors];
        const savedClinic = await this.clinicRepo.save(clinic);
        
        return {
            ...savedClinic,
            favors: this.getClinicFavors(savedClinic.doctors)
        };
    }

    async removeDoctorFromClinic(clinicId: number, doctorId: number): Promise<ClinicWithFavors> {
        const clinic = await this.getClinicById(clinicId);
        clinic.doctors = clinic.doctors.filter(doctor => doctor.id !== doctorId);
        const savedClinic = await this.clinicRepo.save(clinic);
        
        return {
            ...savedClinic,
            favors: this.getClinicFavors(savedClinic.doctors)
        };
    }

    private getClinicFavors(doctors: Doctor[]): Favor[] {
        const allFavors: Favor[] = [];
        doctors.forEach(doctor => {
            if (doctor.favors) {
                allFavors.push(...doctor.favors);
            }
        });
        
        return allFavors.filter((favor, index, self) => 
            index === self.findIndex(f => f.id === favor.id)
        );
    }
}
