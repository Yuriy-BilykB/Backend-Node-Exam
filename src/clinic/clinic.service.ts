import {Injectable, InternalServerErrorException, NotFoundException} from '@nestjs/common';
import {CreateClinicDto} from "./dto/CreateClinicDto";
import {Clinic} from "./entity/clinic.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {ILike, In, Repository} from "typeorm";
import {Doctor} from "../doctor/entity/doctor.entity";

@Injectable()
export class ClinicService {
    constructor(
        @InjectRepository(Clinic)
        private readonly clinicRepo: Repository<Clinic>,

        @InjectRepository(Doctor)
        private readonly doctorRepo: Repository<Doctor>
    ) {
    }
    async createClinic(dto: CreateClinicDto): Promise<Clinic> {
        const doctors = await this.doctorRepo.findBy({id: In(dto.doctorIds)});
        const clinic = this.clinicRepo.create({ name: dto.name, doctors });
        return this.clinicRepo.save(clinic);
    }

    async getClinics(name?: string, sort: 'asc' | 'desc' = 'asc') {
        try {
            const where = name ? { name: ILike(`%${name}%`) } : {};

            const clinics = await this.clinicRepo.find({
                where,
                order: {
                    name: sort
                },
                relations: {
                    doctors: {
                        favors: true
                    }
                }
            });

            if (!clinics || clinics.length === 0) {
                throw new NotFoundException('Clinics not found');
            }

            return clinics;
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }
}
