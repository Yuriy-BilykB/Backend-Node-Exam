import {BadRequestException, Injectable, InternalServerErrorException, NotFoundException} from '@nestjs/common';
import {CreateClinicDto} from "./dto/CreateClinicDto";
import {UpdateClinicDto} from "./dto/UpdateClinicDto";
import {Clinic} from "./entity/clinic.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {ILike, In, Repository} from "typeorm";
import {Doctor} from "../doctor/entity/doctor.entity";
import {Favor} from "../favor/entity/favor.entity";
import {ClinicWithFavors} from "./types/clinic.types";
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
    
    async createClinic(dto: CreateClinicDto): Promise<ClinicWithFavors> {
        if (!dto.name || dto.name.trim().length === 0) {
            throw new BadRequestException('Clinic name is required');
        }
        
        if (!dto.doctorIds || dto.doctorIds.length === 0) {
            throw new BadRequestException('At least one doctor must be assigned to the clinic');
        }
        
        try {
            const clinic = await this.clinicRepo.findOneBy({ name: dto.name });
            if (clinic) {
                throw new BadRequestException("Clinic with this name already exists");
            }
            
            const doctors = await this.doctorRepo.findBy({id: In(dto.doctorIds)});
            if (doctors.length !== dto.doctorIds.length) {
                const foundIds = doctors.map(d => d.id);
                const missingIds = dto.doctorIds.filter(id => !foundIds.includes(id));
                throw new BadRequestException(`Doctors with IDs [${missingIds.join(', ')}] not found`);
            }
            
            const newClinic = this.clinicRepo.create({ name: dto.name, doctors });
            const savedClinic = await this.clinicRepo.save(newClinic);
            
            return {
                ...savedClinic,
                favors: this.getClinicFavors(savedClinic.doctors)
            };
        } catch (err) {
            if (err instanceof BadRequestException) {
                throw err;
            }
            if (err.code === '23505') {
                throw new BadRequestException("Clinic with this name already exists");
            }
            throw new InternalServerErrorException('Failed to create clinic');
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
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to fetch clinics');
        }
    }

    async getClinicById(id: number): Promise<ClinicWithFavors> {
        try {
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
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to fetch clinic');
        }
    }

    async updateClinic(id: number, dto: UpdateClinicDto): Promise<ClinicWithFavors> {
        try {
            const clinic = await this.getClinicById(id);

            if (dto.name) {
                if (dto.name.trim().length === 0) {
                    throw new BadRequestException('Clinic name cannot be empty');
                }
                
                if (dto.name !== clinic.name) {
                    const existingClinic = await this.clinicRepo.findOneBy({ name: dto.name });
                    if (existingClinic) {
                        throw new BadRequestException('Clinic with this name already exists');
                    }
                }
                
                clinic.name = dto.name;
            }

            if (dto.doctorIds) {
                if (dto.doctorIds.length === 0) {
                    throw new BadRequestException('At least one doctor must be assigned to the clinic');
                }
                
                const doctors = await this.doctorRepo.findBy({ id: In(dto.doctorIds) });
                if (doctors.length !== dto.doctorIds.length) {
                    const foundIds = doctors.map(d => d.id);
                    const missingIds = dto.doctorIds.filter(id => !foundIds.includes(id));
                    throw new BadRequestException(`Doctors with IDs [${missingIds.join(', ')}] not found`);
                }
                
                clinic.doctors = doctors;
            }

            const savedClinic = await this.clinicRepo.save(clinic);
            
            return {
                ...savedClinic,
                favors: this.getClinicFavors(savedClinic.doctors)
            };
        } catch (error) {
            if (error instanceof BadRequestException || error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to update clinic');
        }
    }

    async deleteClinic(id: number): Promise<void> {
        try {
            const clinic = await this.getClinicById(id);
            await this.clinicRepo.remove(clinic);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to delete clinic');
        }
    }

    async addDoctorsToClinic(clinicId: number, doctorIds: number[]): Promise<ClinicWithFavors> {
        try {
            const clinic = await this.getClinicById(clinicId);
            const doctors = await this.doctorRepo.findBy({ id: In(doctorIds) });

            if (doctors.length !== doctorIds.length) {
                const foundIds = doctors.map(d => d.id);
                const missingIds = doctorIds.filter(id => !foundIds.includes(id));
                throw new BadRequestException(`Doctors with IDs [${missingIds.join(', ')}] not found`);
            }

            const existingDoctorIds = clinic.doctors.map(d => d.id);
            const newDoctors = doctors.filter(d => !existingDoctorIds.includes(d.id));
            
            if (newDoctors.length === 0) {
                throw new BadRequestException('All specified doctors are already assigned to this clinic');
            }

            clinic.doctors = [...clinic.doctors, ...newDoctors];
            const savedClinic = await this.clinicRepo.save(clinic);
            
            return {
                ...savedClinic,
                favors: this.getClinicFavors(savedClinic.doctors)
            };
        } catch (error) {
            if (error instanceof BadRequestException || error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to add doctors to clinic');
        }
    }

    async removeDoctorFromClinic(clinicId: number, doctorId: number): Promise<void> {
        try {
            const clinic = await this.getClinicById(clinicId);
            if (!clinic) {
                throw new NotFoundException(`Clinic with ID ${clinicId} not found`);
            }
            const doctorExists = clinic.doctors.some(doctor => doctor.id === doctorId);
            if (!doctorExists) {
                throw new BadRequestException(`Doctor with ID ${doctorId} is not assigned to this clinic`);
            }

            if (clinic.doctors.length === 1) {
                throw new BadRequestException('Cannot remove the last doctor from clinic. At least one doctor must remain.');
            }

            clinic.doctors = clinic.doctors.filter(doctor => doctor.id !== doctorId);
            await this.clinicRepo.save(clinic);
        } catch (error) {
            if (error instanceof BadRequestException || error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to remove doctor from clinic');
        }
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
