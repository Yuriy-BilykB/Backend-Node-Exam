import {Injectable, NotFoundException} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {User} from "./entities/user.entity";
import {Repository} from "typeorm";
import {RegisterDto} from "./dto/RegisterDto";
import {UserResponseDto} from "./dto/UserResponseDto";
import {TokensService} from "../tokens/tokens.service";
import {AuthResponseDto} from "./dto/AuthResponseDto";
import {LoginDto} from "./dto/LoginDto";
import {MailService} from "../mail/mail.service";
import {ResetPassDto} from "./dto/ResetPassDto";
import * as bcrypt from 'bcrypt';
import {ForgotPasswordDto} from "./dto/ForgotPasswordDto";


@Injectable()
export class AuthService {
    constructor(
       @InjectRepository(User)
       private readonly userRepo: Repository<User>,
       private readonly tokenServices: TokensService,
       private readonly mailService: MailService
    ) {}
    async register(dto: RegisterDto): Promise<AuthResponseDto> {
        const user = await this.createUser(dto);
        const tokens = this.tokenServices.generateTokens(user);
        const userResponse: UserResponseDto = this.toUserResponse(user);
        return { user: userResponse, tokens };
    }
    private async createUser(dto: RegisterDto): Promise<User> {
        const user = this.userRepo.create(dto);
        return await this.userRepo.save(user);
    }
    private toUserResponse(user: User): UserResponseDto {
        const { id, email, role } = user;
        return { id, email, role };
    }

    async login (dto: LoginDto): Promise<AuthResponseDto> {
        const {email, password} = dto;
        const user = await this.userRepo.findOneBy({ email });
        if (!user || !(await user.validatePassword(password))) {
            throw new NotFoundException('Invalid email or password');
        }
        const tokens = this.tokenServices.generateTokens(user);
        const userResponse: UserResponseDto = this.toUserResponse(user);
        return {tokens, user: userResponse}
    }

    async sendRecoveryEmail (dto: ForgotPasswordDto){
        const {email} = dto;
        const user = await this.userRepo.findOneBy({email});
        if (!user) {
            throw new NotFoundException('User with this email not found');
        }
        const token = this.tokenServices.generateRecoveryToken(email);
        if (!token) {
            throw new NotFoundException('Token not found');
        }
        await this.mailService.sendEmail(email, token)
    }

    async resetPassword(dto: ResetPassDto) {
        const {token, password} = dto;
        const payload = await this.tokenServices.verifyRecoveryToken(token);
        if (!payload){
            throw new NotFoundException('Reset Token is incorrect');
        }
        const user = await this.userRepo.findOneBy({email: payload.email});
        if (!user){
            throw new NotFoundException('User not found');
        }
        user.password = await bcrypt.hash(dto.password, 10);
        await this.userRepo.save(user);
    }
}
