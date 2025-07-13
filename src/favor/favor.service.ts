import { Injectable } from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {Favor} from "./entity/favor.entity";
import {ILike, In, Repository} from "typeorm";
import {CreateFavorDto} from "./dto/createFavorDto";
import {Doctor} from "../doctor/entity/doctor.entity";
import { NotFoundException } from '@nestjs/common';

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

    async getFavorById(id: number): Promise<Favor> {
        const favor = await this.favorRepo.findOne({
            where: { id },
            relations: {
                doctors: true
            }
        });

        if (!favor) {
            throw new NotFoundException(`Favor with ID ${id} not found`);
        }

        return favor;
    }

    async updateFavor(id: number, body: { name: string }) {
        const favor = await this.favorRepo.findOneBy({ id });
        if (!favor) throw new NotFoundException('Favor not found');
        favor.name = body.name ?? favor.name;
        return this.favorRepo.save(favor);
    }

    async deleteFavor(id: number) {
        const favor = await this.favorRepo.findOneBy({ id });
        if (!favor) throw new NotFoundException('Favor not found');
        await this.favorRepo.remove(favor);
        return { message: 'Favor deleted successfully' };
    }
}

