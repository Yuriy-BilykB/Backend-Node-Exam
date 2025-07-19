import {Body, Controller, Get, Post, Put, Delete, Param, Query, UseGuards} from '@nestjs/common';
import {CreateClinicDto} from "./dto/CreateClinicDto";
import {UpdateClinicDto} from "./dto/UpdateClinicDto";
import {ClinicService} from "./clinic.service";
import {ApiBody, ApiQuery, ApiParam, ApiOperation, ApiResponse} from "@nestjs/swagger";
import {RolesGuard} from "../guards/roles.guard";
import {Roles} from "../decorators/roles.decorator";
import {AuthGuard} from "../guards/auth.guard";

@Controller('clinic')
export class ClinicController {
    constructor(
        private readonly clinicService: ClinicService,
    ) {
    }
    
    @UseGuards(AuthGuard, RolesGuard)
    @Post()
    @Roles('admin')
    @ApiBody({type: CreateClinicDto})
    @ApiOperation({ summary: 'Створити клініку' })
    @ApiResponse({ status: 201, description: 'Клініка успішно створена' })
    create(@Body() dto: CreateClinicDto){
        return this.clinicService.createClinic(dto);
    }

    @UseGuards(AuthGuard)
    @Get()
    @ApiQuery({ name: 'name', required: false, description: 'Filter by part of clinic name' })
    @ApiQuery({ name: 'sort', enum: ['asc', 'desc'], required: false, description: 'Sort by name' })
    @ApiQuery({ name: 'favorName', required: false, description: 'Filter clinics by favor (service) name' })
    @ApiQuery({ name: 'doctorName', required: false, description: 'Filter clinics by doctor name (first or last name)' })
    @ApiOperation({ summary: 'Отримати список клінік з фільтрами' })
    @ApiResponse({ status: 200, description: 'Список клінік' })
    getAllClinics(
        @Query('name') name?: string,
        @Query('sort') sort: 'asc' | 'desc' = 'asc',
        @Query('favorName') favorName?: string,
        @Query('doctorName') doctorName?: string
    ) {
        return this.clinicService.getClinics(name, sort, favorName, doctorName);
    }

    @UseGuards(AuthGuard)
    @Get(':id')
    @ApiParam({ name: 'id', description: 'Clinic ID' })
    @ApiOperation({ summary: 'Отримати клініку за ID' })
    @ApiResponse({ status: 200, description: 'Деталі клініки' })
    getClinicById(@Param('id') id: number) {
        return this.clinicService.getClinicById(id);
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Put(':id')
    @Roles('admin')
    @ApiParam({ name: 'id', description: 'Clinic ID' })
    @ApiBody({ type: UpdateClinicDto })
    @ApiOperation({ summary: 'Оновити клініку' })
    @ApiResponse({ status: 200, description: 'Клініка оновлена' })
    updateClinic(@Param('id') id: number, @Body() dto: UpdateClinicDto) {
        return this.clinicService.updateClinic(id, dto);
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Delete(':id')
    @Roles('admin')
    @ApiParam({ name: 'id', description: 'Clinic ID' })
    @ApiOperation({ summary: 'Видалити клініку' })
    @ApiResponse({ status: 200, description: 'Клініка видалена' })
    deleteClinic(@Param('id') id: number) {
        return this.clinicService.deleteClinic(id);
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Post(':id/doctors')
    @Roles('admin')
    @ApiParam({ name: 'id', description: 'Clinic ID' })
    @ApiBody({ schema: { type: 'object', properties: { doctorIds: { type: 'array', items: { type: 'number' } } } } })
    @ApiOperation({ summary: 'Додати лікарів до клініки' })
    @ApiResponse({ status: 200, description: 'Лікарі додані до клініки' })
    addDoctorsToClinic(@Param('id') id: number, @Body() body: { doctorIds: number[] }) {
        return this.clinicService.addDoctorsToClinic(id, body.doctorIds);
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Delete(':id/doctors/:doctorId')
    @Roles('admin')
    @ApiParam({ name: 'id', description: 'Clinic ID' })
    @ApiParam({ name: 'doctorId', description: 'Doctor ID' })
    @ApiOperation({ summary: 'Видалити лікаря з клініки' })
    @ApiResponse({ status: 200, description: 'Лікар видалений з клініки' })
    removeDoctorFromClinic(@Param('id') id: number, @Param('doctorId') doctorId: number) {
        return this.clinicService.removeDoctorFromClinic(id, doctorId);
    }
}
