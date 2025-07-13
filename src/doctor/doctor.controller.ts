import {Body, Controller, Get, Post, Put, Delete, Param, Query, UseGuards} from '@nestjs/common';
import {CreateDoctorDto} from "./dto/CreateDoctorDto";
import {DoctorService} from "./doctor.service";
import {ApiQuery, ApiParam, ApiBody} from "@nestjs/swagger";
import {AuthGuard} from "../guards/auth.guard";
import {RolesGuard} from "../guards/roles.guard";
import {Roles} from "../decorators/roles.decorator";

@Controller('doctor')
export class DoctorController {
    constructor(
        private readonly doctorService: DoctorService,
    ) {
    }
    
    @Post()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBody({ type: CreateDoctorDto })
    create(@Body() dto: CreateDoctorDto) {
        return this.doctorService.createDoctor(dto);
    }

    @UseGuards(AuthGuard)
    @Get()
    @ApiQuery({ name: 'firstName', required: false, description: 'Filter doctors by first name (partial match)' })
    @ApiQuery({ name: 'lastName', required: false, description: 'Filter doctors by last name (partial match)' })
    @ApiQuery({ name: 'phoneNumber', required: false, description: 'Filter doctors by phone number' })
    @ApiQuery({ name: 'email', required: false, description: 'Filter doctors by email address' })
    @ApiQuery({ name: 'sortBy', enum: ['firstName', 'lastName'], description: 'Sort doctors by firstName or lastName', required: false })
    @ApiQuery({ name: 'sortOrder', enum: ['asc', 'desc'], description: 'Sort order: ascending or descending', required: false })
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

    @UseGuards(AuthGuard)
    @Get(':id')
    @ApiParam({ name: 'id', description: 'Doctor ID' })
    getDoctorById(@Param('id') id: number) {
        return this.doctorService.getDoctorById(id);
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Put(':id')
    @Roles('admin')
    @ApiParam({ name: 'id', description: 'Doctor ID' })
    @ApiBody({ schema: { type: 'object', properties: { firstName: { type: 'string' }, lastName: { type: 'string' }, phoneNumber: { type: 'string' }, email: { type: 'string' } } } })
    updateDoctor(@Param('id') id: number, @Body() body: { firstName?: string; lastName?: string; phoneNumber?: string; email?: string }) {
        return this.doctorService.updateDoctor(id, body);
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Delete(':id')
    @Roles('admin')
    @ApiParam({ name: 'id', description: 'Doctor ID' })
    deleteDoctor(@Param('id') id: number) {
        return this.doctorService.deleteDoctor(id);
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Post(':id/favors')
    @Roles('admin')
    @ApiParam({ name: 'id', description: 'Doctor ID' })
    @ApiBody({ schema: { type: 'object', properties: { favorIds: { type: 'array', items: { type: 'number' } } } } })
    addFavorsToDoctor(@Param('id') id: number, @Body() body: { favorIds: number[] }) {
        return this.doctorService.addFavorsToDoctor(id, body.favorIds);
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Delete(':id/favors/:favorId')
    @Roles('admin')
    @ApiParam({ name: 'id', description: 'Doctor ID' })
    @ApiParam({ name: 'favorId', description: 'Favor ID' })
    removeFavorFromDoctor(@Param('id') id: number, @Param('favorId') favorId: number) {
        return this.doctorService.removeFavorFromDoctor(id, favorId);
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Put(':id/favors')
    @Roles('admin')
    @ApiParam({ name: 'id', description: 'Doctor ID' })
    @ApiBody({ schema: { type: 'object', properties: { favorIds: { type: 'array', items: { type: 'number' } } } } })
    updateFavorsForDoctor(@Param('id') id: number, @Body() body: { favorIds: number[] }) {
        return this.doctorService.updateFavorsForDoctor(id, body.favorIds);
    }
}
