import {BadRequestException, Body, Controller, Delete, Get, Patch, Post, Req, Res, UnauthorizedException, UseGuards} from '@nestjs/common';
import {RegisterDto} from "./dto/RegisterDto";
import {LoginDto} from "./dto/LoginDto";
import {AuthService} from "./auth.service";
import {Request, Response} from "express";
import {TokensService} from "../tokens/tokens.service";
import {ResetPassDto} from "./dto/ResetPassDto";
import {ForgotPasswordDto} from "./dto/ForgotPasswordDto";
import {ApiBearerAuth, ApiOperation, ApiResponse, ApiTags} from "@nestjs/swagger";
import {AuthResponseDto} from "./dto/AuthResponseDto";
import {AuthGuard} from "../guards/auth.guard";

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly tokenService: TokensService,
    ) {
    }

    @Post('register')
    @ApiOperation({summary: 'User registration'})
    @ApiResponse({status: 201, description: 'User successfully registered', type: AuthResponseDto})
    async register(
        @Body() dto: RegisterDto,
        @Res({passthrough: true}) res: Response
    ) {
        const {tokens, user} = await this.authService.register(dto);
        res.cookie('refresh_Token', tokens.refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        return {
            accessToken: tokens.accessToken,
            user: user
        };
     
    }

    @Post('login')
    @ApiOperation({summary: 'User login'})
    @ApiResponse({status: 200, description: 'User successfully logged in', type: AuthResponseDto})
    async login(
        @Body() dto: LoginDto,
        @Res({passthrough: true}) res: Response
    ) {
        const {tokens, user} = await this.authService.login(dto);
        res.cookie('refresh_Token', tokens.refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        return {
            accessToken: tokens.accessToken,
            user: user
        };
    }

    @Post('refresh')
    @ApiOperation({summary: 'Refresh access token using refresh token cookie'})
    @ApiResponse({status: 200, description: 'New access token issued', type: AuthResponseDto})
    @ApiBearerAuth()
    async refresh(
        @Req() req: Request,
        @Res({passthrough: true}) res: Response
    ) {
        const refreshToken = req.cookies['refresh_Token'];
        if (!refreshToken) {
            throw new UnauthorizedException('Refresh token not found');
        }
        const payload = this.tokenService.verifyRefreshToken(refreshToken);
        if (!payload) {
            throw new UnauthorizedException('Refresh token not found');
        }
        const tokens = this.tokenService.generateTokens(payload);
        res.cookie('refresh_Token', tokens.refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        return {
            accessToken: tokens.accessToken,
            user: payload
        };
    }

    @UseGuards(AuthGuard)
    @Delete('logout')
    @ApiOperation({ summary: 'Logout user' })
    @ApiResponse({ status: 200, description: 'User successfully logged out'})
    async logout(@Res({passthrough: true})res: Response) {
        res.clearCookie('refresh_Token', {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
        });
        return { message: 'Logged out successfully' };
    }

    @Post('forgot-password')
    @ApiOperation({summary: 'Send password recovery email'})
    @ApiResponse({status: 200, description: 'Recovery email sent'})
    async sendRecoveryEmail(@Body() dto: ForgotPasswordDto) {
        await this.authService.sendRecoveryEmail(dto)
        return {message: 'Recovery email sent'};
    }

    @Patch('reset-password')
    @ApiOperation({summary: 'Reset user password'})
    @ApiResponse({status: 200, description: 'Password successfully changed'})
    async resetPassword(@Body() dto: ResetPassDto) {
        await this.authService.resetPassword(dto)
        return {message: 'Password successfully changed'};
    }
}
