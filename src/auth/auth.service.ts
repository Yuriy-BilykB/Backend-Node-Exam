import {BadRequestException, Injectable, NotFoundException, Logger, InternalServerErrorException} from '@nestjs/common';
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

interface RecoveryEmailResponse {
    message: string;
    email: string;
}

interface ResetPasswordResponse {
    message: string;
    user: UserResponseDto;
}

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);
    
    constructor(
       @InjectRepository(User)
       private readonly userRepo: Repository<User>,
       private readonly tokenServices: TokensService,
       private readonly mailService: MailService
    ) {}
    
    async register(dto: RegisterDto): Promise<AuthResponseDto> {
        try {
            const existingUser = await this.userRepo.findOneBy({email: dto.email});
            if (existingUser) {
                throw new BadRequestException('User with this email already exists');
            }
            
            const user = await this.createUser(dto);
            const tokens = this.tokenServices.generateTokens(user);
            const userResponse: UserResponseDto = this.toUserResponse(user);
            
            this.logger.log(`User registered successfully: ${user.email}`);
            return { user: userResponse, tokens };
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }
            this.logger.error(`Failed to register user: ${error.message}`);
            throw new InternalServerErrorException('Failed to register user');
        }
    }
    
    private async createUser(dto: RegisterDto): Promise<User> {
        try {
            const user = this.userRepo.create(dto);
            return await this.userRepo.save(user);
        } catch (error) {
            this.logger.error(`Failed to create user: ${error.message}`);
            throw new InternalServerErrorException('Failed to create user');
        }
    }
    
    private toUserResponse(user: User): UserResponseDto {
        const { id, email, role } = user;
        return { id, email, role };
    }

    async login(dto: LoginDto): Promise<AuthResponseDto> {
        try {
            const {email, password} = dto;
            
            if (!email || !password) {
                throw new BadRequestException('Email and password are required');
            }
            
            const user = await this.userRepo.findOneBy({ email });
            if (!user || !(await user.validatePassword(password))) {
                throw new NotFoundException('Invalid email or password');
            }
            
            const tokens = this.tokenServices.generateTokens(user);
            const userResponse: UserResponseDto = this.toUserResponse(user);
            
            this.logger.log(`User logged in successfully: ${user.email}`);
            return {tokens, user: userResponse};
        } catch (error) {
            if (error instanceof BadRequestException || error instanceof NotFoundException) {
                throw error;
            }
            this.logger.error(`Failed to login user: ${error.message}`);
            throw new InternalServerErrorException('Failed to login user');
        }
    }

    async sendRecoveryEmail(dto: ForgotPasswordDto): Promise<RecoveryEmailResponse> {
        try {
            const {email} = dto;
            if (!email || email.trim().length === 0) {
                throw new BadRequestException('Email is required');
            }
            
            const user = await this.userRepo.findOneBy({email});
            if (!user) {
                throw new NotFoundException('User with this email not found');
            }
            
            const token = this.tokenServices.generateRecoveryToken(email);
            if (!token) {
                throw new InternalServerErrorException('Failed to generate recovery token');
            }
            
            await this.mailService.sendEmail(email, token);
            
            this.logger.log(`Recovery email sent successfully to: ${email}`);
            return {
                message: 'Recovery email sent successfully',
                email: email
            };
        } catch (error) {
            if (error instanceof BadRequestException || error instanceof NotFoundException) {
                throw error;
            }
            this.logger.error(`Failed to send recovery email: ${error.message}`);
            throw new InternalServerErrorException('Failed to send recovery email');
        }
    }

    async resetPassword(dto: ResetPassDto): Promise<ResetPasswordResponse> {
        try {
            const {token, password} = dto;
            
            if (!token || !password) {
                throw new BadRequestException('Token and password are required');
            }
            
            if (password.length < 6) {
                throw new BadRequestException('Password must be at least 6 characters long');
            }
            
            const payload = await this.tokenServices.verifyRecoveryToken(token);
            if (!payload) {
                throw new BadRequestException('Invalid or expired reset token');
            }
            
            const user = await this.userRepo.findOneBy({email: payload.email});
            if (!user) {
                throw new NotFoundException('User not found');
            }
            
            user.password = await bcrypt.hash(password, 10);
            await this.userRepo.save(user);
            
            const userResponse: UserResponseDto = this.toUserResponse(user);
            
            this.logger.log(`Password reset successfully for user: ${user.email}`);
            return {
                message: 'Password reset successfully',
                user: userResponse
            };
        } catch (error) {
            if (error instanceof BadRequestException || error instanceof NotFoundException) {
                throw error;
            }
            this.logger.error(`Failed to reset password: ${error.message}`);
            throw new InternalServerErrorException('Failed to reset password');
        }
    }
}
