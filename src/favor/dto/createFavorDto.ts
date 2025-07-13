import {ApiProperty} from "@nestjs/swagger";
import {IsString, IsArray, IsNumber, IsNotEmpty} from "class-validator";

export class CreateFavorDto {
    @ApiProperty({ example: 'Therapy', description: 'Name of the medical service (favor)' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: [1, 2], description: 'List of doctor IDs who provide this service' })
    @IsArray()
    @IsNumber({}, {each: true})
    doctorIds: number[];
}