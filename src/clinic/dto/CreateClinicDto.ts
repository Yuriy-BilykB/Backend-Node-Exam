import {ApiProperty} from "@nestjs/swagger";
import {IsString, IsArray, IsNumber, IsNotEmpty} from "class-validator";

export class CreateClinicDto {
    @ApiProperty({example: 'Medix Clinic', description: 'Name of clinic'})
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({example: [1, 2, 3], description: 'Array of doctor`s, who work in clinic'})
    @IsArray()
    @IsNumber({}, {each: true})
    doctorIds: number[];
}
