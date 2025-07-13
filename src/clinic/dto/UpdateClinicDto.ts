import {ApiProperty} from "@nestjs/swagger";
import {IsOptional, IsString, IsArray, IsNumber} from "class-validator";

export class UpdateClinicDto {
    @ApiProperty({example: 'Medix Clinic', description: 'Name of clinic', required: false})
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({example: [1, 2, 3], description: 'Array of doctor IDs who work in clinic', required: false})
    @IsOptional()
    @IsArray()
    @IsNumber({}, {each: true})
    doctorIds?: number[];
} 