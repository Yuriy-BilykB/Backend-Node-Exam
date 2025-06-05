import {Injectable, InternalServerErrorException} from '@nestjs/common';
import {CreateDoctorDto} from "./dto/CreateDoctorDto";
import {InjectRepository} from "@nestjs/typeorm";
import {ILike, Repository} from "typeorm";
import {Doctor} from "./entity/doctor.entity";

@Injectable()
export class DoctorService {
    constructor(
        @InjectRepository(Doctor)
        private readonly doctorRepo: Repository<Doctor>
    ) {
    }
    async createDoctor(dto: CreateDoctorDto) {
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
}
