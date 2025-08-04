import {Body, Controller, Get, Post, Put, Delete, Param, Query, UseGuards, HttpCode, HttpStatus} from '@nestjs/common';
import {CreateDoctorDto} from "./dto/CreateDoctorDto";
import {DoctorService} from "./doctor.service";
import {ApiQuery, ApiParam, ApiBody, ApiOperation, ApiResponse, ApiTags} from "@nestjs/swagger";
import {AuthGuard} from "../guards/auth.guard";
import {RolesGuard} from "../guards/roles.guard";
import {Roles} from "../decorators/roles.decorator";

@ApiTags('Doctors')
@Controller('doctors')
@UseGuards(AuthGuard)
export class DoctorController {
    constructor(
        private readonly doctorService: DoctorService,
    ) {
    }
    
    @Post()
    @UseGuards(RolesGuard)
    @Roles('admin')
    @ApiBody({ type: CreateDoctorDto })
    @ApiOperation({ summary: 'Create doctor' })
    @ApiResponse({ status: 201, description: 'Doctor successfully created' })
    create(@Body() dto: CreateDoctorDto) {
        return this.doctorService.createDoctor(dto);
    }

    @Get()
    @ApiQuery({ name: 'firstName', required: false, description: 'Filter doctors by first name (partial match)' })
    @ApiQuery({ name: 'lastName', required: false, description: 'Filter doctors by last name (partial match)' })
    @ApiQuery({ name: 'phoneNumber', required: false, description: 'Filter doctors by phone number' })
    @ApiQuery({ name: 'email', required: false, description: 'Filter doctors by email address' })
    @ApiQuery({ name: 'sortBy', enum: ['firstName', 'lastName'], description: 'Sort doctors by firstName or lastName', required: false })
    @ApiQuery({ name: 'sortOrder', enum: ['asc', 'desc'], description: 'Sort order: ascending or descending', required: false })
    @ApiOperation({ summary: 'Get list of doctors with filters' })
    @ApiResponse({ status: 200, description: 'List of doctors' })
    getDoctors(
        @Query('firstName') firstName?: string,
        @Query('lastName') lastName?: string,
        @Query('phoneNumber') phoneNumber?: string,
        @Query('email') email?: string,
        @Query('sortBy') sortBy: 'firstName' | 'lastName' = 'firstName',
        @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'asc'
    ) {
        return this.doctorService.findDoctors(firstName, lastName, phoneNumber, email, sortBy, sortOrder);
    }

    @Get(':id')
    @ApiParam({ name: 'id', description: 'Doctor ID' })
    @ApiOperation({ summary: 'Get doctor by ID' })
    @ApiResponse({ status: 200, description: 'Doctor details' })
    getDoctorById(@Param('id') id: number) {
        return this.doctorService.getDoctorById(id);
    }

    @UseGuards(RolesGuard)
    @Put(':id')
    @Roles('admin')
    @ApiParam({ name: 'id', description: 'Doctor ID' })
    @ApiBody({ schema: { type: 'object', properties: { firstName: { type: 'string' }, lastName: { type: 'string' }, phoneNumber: { type: 'string' }, email: { type: 'string' } } } })
    @ApiOperation({ summary: 'Update doctor' })
    @ApiResponse({ status: 200, description: 'Doctor updated' })
    updateDoctor(@Param('id') id: number, @Body() body: { firstName?: string; lastName?: string; phoneNumber?: string; email?: string }) {
        return this.doctorService.updateDoctor(id, body);
    }

    @UseGuards(RolesGuard)
    @Delete(':id')
    @Roles('admin')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiParam({ name: 'id', description: 'Doctor ID' })
    @ApiOperation({ summary: 'Delete doctor' })
    async deleteDoctor(@Param('id') id: number): Promise<void> {
        await this.doctorService.deleteDoctor(id);
    }

    @UseGuards(RolesGuard)
    @Post(':id/favors')
    @Roles('admin')
    @ApiParam({ name: 'id', description: 'Doctor ID' })
    @ApiBody({ schema: { type: 'object', properties: { favorIds: { type: 'array', items: { type: 'number' } } } } })
    @ApiOperation({ summary: 'Add services to doctor' })
    @ApiResponse({ status: 200, description: 'Services added to doctor' })
    addFavorsToDoctor(@Param('id') id: number, @Body() body: { favorIds: number[] }) {
        return this.doctorService.addFavorsToDoctor(id, body.favorIds);
    }

    @UseGuards(RolesGuard)
    @Delete(':id/favors/:favorId')
    @Roles('admin')
    @ApiParam({ name: 'id', description: 'Doctor ID' })
    @ApiParam({ name: 'favorId', description: 'Favor ID' })
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Remove service from doctor' })
    async removeFavorFromDoctor(@Param('id') id: number, @Param('favorId') favorId: number) {
       await this.doctorService.removeFavorFromDoctor(id, favorId);
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Put(':id/favors')
    @Roles('admin')
    @ApiParam({ name: 'id', description: 'Doctor ID' })
    @ApiBody({ schema: { type: 'object', properties: { favorIds: { type: 'array', items: { type: 'number' } } } } })
    @ApiOperation({ summary: 'Update doctor services' })
    @ApiResponse({ status: 200, description: 'Doctor services updated' })
    updateFavorsForDoctor(@Param('id') id: number, @Body() body: { favorIds: number[] }) {
        return this.doctorService.updateFavorsForDoctor(id, body.favorIds);
    }
}
