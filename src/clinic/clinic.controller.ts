import {Body, Controller, Get, Post, Put, Delete, Param, Query, UseGuards, HttpCode, HttpStatus} from '@nestjs/common';
import {CreateClinicDto} from "./dto/CreateClinicDto";
import {UpdateClinicDto} from "./dto/UpdateClinicDto";
import {ClinicService} from "./clinic.service";
import {ApiBody, ApiQuery, ApiParam, ApiOperation, ApiResponse, ApiTags} from "@nestjs/swagger";
import {RolesGuard} from "../guards/roles.guard";
import {Roles} from "../decorators/roles.decorator";
import {AuthGuard} from "../guards/auth.guard";

@ApiTags('Clinics')
@Controller('clinics')
@UseGuards(AuthGuard)
export class ClinicController {
    constructor(
        private readonly clinicService: ClinicService,
    ) {
    }
    
    @UseGuards(RolesGuard)
    @Post()
    @Roles('admin')
    @ApiBody({type: CreateClinicDto})
    @ApiOperation({ summary: 'Create clinic' })
    @ApiResponse({ status: 201, description: 'Clinic successfully created' })
    create(@Body() dto: CreateClinicDto){
        return this.clinicService.createClinic(dto);
    }

    @Get()
    @ApiQuery({ name: 'name', required: false, description: 'Filter by part of clinic name' })
    @ApiQuery({ name: 'sort', enum: ['asc', 'desc'], required: false, description: 'Sort by name' })
    @ApiQuery({ name: 'favorName', required: false, description: 'Filter clinics by favor (service) name' })
    @ApiQuery({ name: 'doctorName', required: false, description: 'Filter clinics by doctor name (first or last name)' })
    @ApiOperation({ summary: 'Get list of clinics with filters' })
    @ApiResponse({ status: 200, description: 'List of clinics' })
    getAllClinics(
        @Query('name') name?: string,
        @Query('sort') sort: 'asc' | 'desc' = 'asc',
        @Query('favorName') favorName?: string,
        @Query('doctorName') doctorName?: string
    ) {
        return this.clinicService.getClinics(name, sort, favorName, doctorName);
    }

    @Get(':id')
    @ApiParam({ name: 'id', description: 'Clinic ID' })
    @ApiOperation({ summary: 'Get clinic by ID' })
    @ApiResponse({ status: 200, description: 'Clinic details' })
    getClinicById(@Param('id') id: number) {
        return this.clinicService.getClinicById(id);
    }

    @UseGuards(RolesGuard)
    @Put(':id')
    @Roles('admin')
    @ApiParam({ name: 'id', description: 'Clinic ID' })
    @ApiBody({ type: UpdateClinicDto })
    @ApiOperation({ summary: 'Update clinic' })
    @ApiResponse({ status: 200, description: 'Clinic updated' })
    updateClinic(@Param('id') id: number, @Body() dto: UpdateClinicDto) {
        return this.clinicService.updateClinic(id, dto);
    }

    @UseGuards(RolesGuard)
    @Delete(':id')
    @Roles('admin')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiParam({ name: 'id', description: 'Clinic ID' })
    @ApiOperation({ summary: 'Delete clinic' })
    async deleteClinic(@Param('id') id: number): Promise<void> {
        await this.clinicService.deleteClinic(id);
    }

    @UseGuards(RolesGuard)
    @Post(':id/doctors')
    @Roles('admin')
    @ApiParam({ name: 'id', description: 'Clinic ID' })
    @ApiBody({ schema: { type: 'object', properties: { doctorIds: { type: 'array', items: { type: 'number' } } } } })
    @ApiOperation({ summary: 'Add doctors to clinic' })
    @ApiResponse({ status: 200, description: 'Doctors added to clinic' })
    addDoctorsToClinic(@Param('id') id: number, @Body() body: { doctorIds: number[] }) {
        return this.clinicService.addDoctorsToClinic(id, body.doctorIds);
    }

    @UseGuards(RolesGuard)
    @Delete(':id/doctors/:doctorId')
    @Roles('admin')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiParam({ name: 'id', description: 'Clinic ID' })
    @ApiParam({ name: 'doctorId', description: 'Doctor ID' })
    @ApiOperation({ summary: 'Remove doctor from clinic' })
    async removeDoctorFromClinic(@Param('id') id: number, @Param('doctorId') doctorId: number): Promise<void> {
        await this.clinicService.removeDoctorFromClinic(id, doctorId);
    }
}
