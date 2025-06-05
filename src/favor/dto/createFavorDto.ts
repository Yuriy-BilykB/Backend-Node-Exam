import {ApiProperty} from "@nestjs/swagger";

export class CreateFavorDto {
    @ApiProperty({ example: 'Therapy', description: 'Name of the medical service (favor)' })
    name: string;

    @ApiProperty({ example: [1, 2], description: 'List of doctor IDs who provide this service' })
    doctorIds: number[];
}