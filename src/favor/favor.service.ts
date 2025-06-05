import { Injectable } from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {Favor} from "./entity/favor.entity";
import {ILike, In, Repository} from "typeorm";
import {CreateFavorDto} from "./dto/createFavorDto";
import {Doctor} from "../doctor/entity/doctor.entity";

@Injectable()
export class FavorService {
    constructor(
        @InjectRepository(Favor)
        private readonly favorRepo: Repository<Favor>,
        @InjectRepository(Doctor)
        private readonly doctorRepo: Repository<Doctor>
    ) {}

    async createFavor(dto: CreateFavorDto) {
        const doctors = await this.doctorRepo.findBy({id: In(dto.doctorIds)});
        const favor = this.favorRepo.create({name: dto.name, doctors});
        return await this.favorRepo.save(favor);
    }

    async getFavors(name?: string, sort: 'asc' | 'desc' = 'asc') {
        const where = name ? { name: ILike(`%${name}%`) } : {};

        const favors = await this.favorRepo.find({
            where,
            order: {
                name: sort,
            },
            relations: {
                doctors: true
            }
        });

        return favors;
    }
}

