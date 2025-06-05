import {ApiProperty} from "@nestjs/swagger";

export class CreateClinicDto {
    @ApiProperty({example: 'Medix Clinic', description: 'Name of clinic'})
    name: string;

    @ApiProperty({example: [1, 2, 3], description: 'Array of doctor`s, who work in clinic'})
    doctorIds: number[];
}
