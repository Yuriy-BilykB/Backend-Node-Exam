import {ApiProperty} from "@nestjs/swagger";

export class CreateDoctorDto {
    @ApiProperty({ example: 'John', description: 'First name of the doctor' })
    firstName: string;

    @ApiProperty({ example: 'Doe', description: 'Last name of the doctor' })
    lastName: string;

    @ApiProperty({ example: '+380501234567', description: 'Phone number of the doctor' })
    phoneNumber: string;

    @ApiProperty({ example: 'john.doe@example.com', description: 'Email address of the doctor' })
    email: string;

    @ApiProperty({ example: 1, description: 'ID of the clinic the doctor is associated with' })
    clinicId: number;
}