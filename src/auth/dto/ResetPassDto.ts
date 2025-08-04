import {IsString, MinLength} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";

export class ResetPassDto {
    @ApiProperty({ example: 'newPassword123!', description: 'New password for the user' })
    @IsString()
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    password: string;

    @ApiProperty({ example: 'token-from-email-link', description: 'Password reset token' })
    @IsString()
    token: string;
}