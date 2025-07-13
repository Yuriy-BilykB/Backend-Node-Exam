import {ApiProperty} from "@nestjs/swagger";
import {IsString, IsEmail, IsNotEmpty} from "class-validator";

export class CreateDoctorDto {
    @ApiProperty({ example: 'John', description: 'First name of the doctor' })
    @IsString()
    @IsNotEmpty()
    firstName: string;

    @ApiProperty({ example: 'Doe', description: 'Last name of the doctor' })
    @IsString()
    @IsNotEmpty()
    lastName: string;

    @ApiProperty({ example: '+380501234567', description: 'Phone number of the doctor' })
    @IsString()
    @IsNotEmpty()
    phoneNumber: string;

    @ApiProperty({ example: 'john.doe@example.com', description: 'Email address of the doctor' })
    @IsEmail()
    @IsNotEmpty()
    email: string;
}