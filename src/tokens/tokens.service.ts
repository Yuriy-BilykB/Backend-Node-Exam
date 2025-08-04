import {Injectable, UnauthorizedException, InternalServerErrorException} from '@nestjs/common';
import {JwtService} from "@nestjs/jwt";
import {TokensDto} from "./dto/TokensDto";
import {ConfigService} from "@nestjs/config";
import {PayloadDto} from "../auth/dto/PayloadDto";

interface IRecoveryPayload {
    email: string,
    iat: number,
    exp: number
}

@Injectable()
export class TokensService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) {
    }

    
    generateTokens(payloadDto: PayloadDto): TokensDto {
        const payload = {id: payloadDto.id, email: payloadDto.email, role: payloadDto.role};
        const accessToken = this.jwtService.sign(payload, {
            secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
            expiresIn: this.configService.get<string>('EXPIRES_ACCESS_TOKEN'),
        });
        console.log('access token secret',this.configService.get<string>('ACCESS_TOKEN_SECRET'));

        const refreshToken = this.jwtService.sign(payload, {
            secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
            expiresIn: this.configService.get<string>('EXPIRES_REFRESH_TOKEN'),
        });

        return {accessToken, refreshToken};
    };

    verifyAccessToken(token: string): PayloadDto {
        try {
            return this.jwtService.verify(token, {
                secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
            });
        } catch (error) {
            throw new UnauthorizedException('Invalid access token');
        }
    };

    verifyRefreshToken(token: string): PayloadDto {
        try {
            return  this.jwtService.verify(token, {
                secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
            });
        } catch (error) {
            throw new UnauthorizedException('Invalid refresh token');
        }
    };

    generateRecoveryToken(email: string): string {
        const payload = {email: email};
        const recoveryToken = this.jwtService.sign(payload,{
            secret: this.configService.get<string>('RECOVERY_TOKEN_SECRET'),
            expiresIn: this.configService.get<string>('EXPIRES_RECOVERY_TOKEN')
        })
        return recoveryToken;
    };

    verifyRecoveryToken(token: string): IRecoveryPayload {
        try {
            return this.jwtService.verify(token, {
                secret: this.configService.get<string>('RECOVERY_TOKEN_SECRET')
            });
        } catch (error) {
            throw new UnauthorizedException('Invalid or expired recovery token');
        }
    };
}