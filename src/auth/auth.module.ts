import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {User} from "./entities/user.entity";
import {AuthService} from "./auth.service";
import {MailModule} from "../mail/mail.module";
import {TokensModule} from "../tokens/tokens.module";


@Module({
  imports: [TypeOrmModule.forFeature([User]), MailModule, TokensModule],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule {}
