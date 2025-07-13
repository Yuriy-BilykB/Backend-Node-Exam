import { Module } from '@nestjs/common';
import { ClinicController } from './clinic.controller';
import { ClinicService } from './clinic.service';
import {TypeOrmModule} from "@nestjs/typeorm";
import {Clinic} from "./entity/clinic.entity";
import {Doctor} from "../doctor/entity/doctor.entity";
import {Favor} from "../favor/entity/favor.entity";
import {TokensModule} from "../tokens/tokens.module";

@Module({
  imports: [TypeOrmModule.forFeature([Clinic, Doctor, Favor]), TokensModule],
  controllers: [ClinicController],
  providers: [ClinicService]
})
export class ClinicModule {}
