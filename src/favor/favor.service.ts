import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {Favor} from "./entity/favor.entity";
import {ILike, In, Repository} from "typeorm";
import {CreateFavorDto} from "./dto/createFavorDto";
import {Doctor} from "../doctor/entity/doctor.entity";

interface DeleteResponse {
    message: string;
}

@Injectable()
export class FavorService {
    constructor(
        @InjectRepository(Favor)
        private readonly favorRepo: Repository<Favor>,
        @InjectRepository(Doctor)
        private readonly doctorRepo: Repository<Doctor>
    ) {}

    async createFavor(dto: CreateFavorDto): Promise<Favor> {
        try {
            if (!dto.name || dto.name.trim().length === 0) {
                throw new BadRequestException('Favor name is required');
            }
            
            if (!dto.doctorIds || dto.doctorIds.length === 0) {
                throw new BadRequestException('At least one doctor must be assigned to the favor');
            }
            
            const existingFavor = await this.favorRepo.findOneBy({ name: dto.name });
            if (existingFavor) {
                throw new BadRequestException('Favor with this name already exists');
            }
            
            const doctors = await this.doctorRepo.findBy({id: In(dto.doctorIds)});
            
            if (doctors.length !== dto.doctorIds.length) {
                const foundIds = doctors.map(d => d.id);
                const missingIds = dto.doctorIds.filter(id => !foundIds.includes(id));
                throw new BadRequestException(`Doctors with IDs [${missingIds.join(', ')}] not found`);
            }
            
            const favor = this.favorRepo.create({name: dto.name, doctors});
            return await this.favorRepo.save(favor);
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }
            if (error.code === '23505') {
                throw new BadRequestException('Favor with this name already exists');
            }
            throw new InternalServerErrorException('Failed to create favor');
        }
    }

    async getFavors(name?: string, sort: 'asc' | 'desc' = 'asc'): Promise<Favor[]> {
        try {
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
        } catch (error) {
            throw new InternalServerErrorException('Failed to fetch favors');
        }
    }

    async getFavorById(id: number): Promise<Favor> {
        try {
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
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to fetch favor');
        }
    }

    async updateFavor(id: number, body: { name: string }): Promise<Favor> {
        try {
            const favor = await this.favorRepo.findOneBy({ id });
            if (!favor) {
                throw new NotFoundException('Favor not found');
            }
            
            if (!body.name || body.name.trim().length === 0) {
                throw new BadRequestException('Favor name is required');
            }
            
            if (body.name !== favor.name) {
                const existingFavor = await this.favorRepo.findOneBy({ name: body.name });
                if (existingFavor) {
                    throw new BadRequestException('Favor with this name already exists');
                }
            }
            
            favor.name = body.name;
            return await this.favorRepo.save(favor);
        } catch (error) {
            if (error instanceof BadRequestException || error instanceof NotFoundException) {
                throw error;
            }
            if (error.code === '23505') {
                throw new BadRequestException('Favor with this name already exists');
            }
            throw new InternalServerErrorException('Failed to update favor');
        }
    }

    async deleteFavor(id: number): Promise<void> {
        try {
            const favor = await this.favorRepo.findOneBy({ id });
            if (!favor) {
                throw new NotFoundException('Favor not found');
            }
            
            await this.favorRepo.remove(favor);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to delete favor');
        }
    }
}

