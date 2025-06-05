import {IsEmail, IsString} from 'class-validator';
import {ApiProperty} from "@nestjs/swagger";
export class LoginDto {
    @ApiProperty({ example: 'john@example.com', description: 'Registered email of the user' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'StrongPass123!', description: 'User password' })
    @IsString()
    password: string;
}