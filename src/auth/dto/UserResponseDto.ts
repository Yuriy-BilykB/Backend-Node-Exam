import {UserRole} from "../types/RoleEnum";
import {ApiProperty} from "@nestjs/swagger";

export class UserResponseDto {
    @ApiProperty({ example: 1, description: 'User ID' })
    id: number;

    @ApiProperty({ example: 'john@example.com', description: 'User email' })
    email: string;

    @ApiProperty({ example: UserRole.ADMIN, enum: UserRole, description: 'User role' })
    role: UserRole;
}