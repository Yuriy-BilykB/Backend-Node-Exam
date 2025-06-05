import {Body, Controller, Get, Post, Query, UseGuards} from '@nestjs/common';
import {CreateDoctorDto} from "./dto/CreateDoctorDto";
import {DoctorService} from "./doctor.service";
import {ApiQuery} from "@nestjs/swagger";
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

}
