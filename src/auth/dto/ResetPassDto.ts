import {IsEmail, IsString} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";

export class ResetPassDto {
    @ApiProperty({ example: 'newPassword123!', description: 'New password for the user' })
    @IsEmail()
    password: string;

    @ApiProperty({ example: 'token-from-email-link', description: 'Password reset token' })
    @IsString()
    token: string;
}