import { Module } from '@nestjs/common';
import { DoctorController } from './doctor.controller';
import { DoctorService } from './doctor.service';
import {TypeOrmModule} from "@nestjs/typeorm";
import {User} from "../auth/entities/user.entity";
import {Doctor} from "./entity/doctor.entity";
import {Favor} from "../favor/entity/favor.entity";
import {TokensModule} from "../tokens/tokens.module";

@Module({
  imports: [TypeOrmModule.forFeature([Doctor, Favor]), TokensModule],
  controllers: [DoctorController],
  providers: [DoctorService]
})
export class DoctorModule {}
