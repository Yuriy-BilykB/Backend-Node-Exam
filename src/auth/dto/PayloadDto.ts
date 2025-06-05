import {IsEmail, IsEnum, IsNumber} from "class-validator";
import {UserRole} from "../types/RoleEnum";
import {ApiProperty} from "@nestjs/swagger";

export class PayloadDto {
    @ApiProperty({ example: 1, description: 'User ID' })
    @IsNumber()
    id: number;

    @ApiProperty({ example: 'john@example.com', description: 'User email' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: UserRole.ADMIN, enum: UserRole, description: 'User role' })
    @IsEnum(UserRole)
    role: UserRole;
};
