import {IsEmail, IsString, IsEnum} from 'class-validator';
import {UserRole} from "../types/RoleEnum";
import {ApiProperty} from "@nestjs/swagger";
export class RegisterDto {
    @ApiProperty({ example: 'John Doe', description: 'Full name of the user' })
    @IsString()
    name: string;

    @ApiProperty({ example: 'john@example.com', description: 'Email address of the user' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'StrongPass123!', description: 'User password' })
    @IsString()     
    password: string;

    @ApiProperty({ example: UserRole.USER, enum: UserRole, description: 'User role' })
    @IsEnum(UserRole)
    role: UserRole;
}