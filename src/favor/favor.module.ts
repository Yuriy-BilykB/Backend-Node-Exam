import { Module } from '@nestjs/common';
import { FavorController } from './favor.controller';
import { FavorService } from './favor.service';
import {TypeOrmModule} from "@nestjs/typeorm";
import {Favor} from "./entity/favor.entity";
import {Doctor} from "../doctor/entity/doctor.entity";
import {TokensModule} from "../tokens/tokens.module";

@Module({
  imports: [TypeOrmModule.forFeature([Favor, Doctor]), TokensModule],
  controllers: [FavorController],
  providers: [FavorService]
})
export class FavorModule {}
