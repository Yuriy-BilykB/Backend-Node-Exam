import {Body, Controller, Get, Post, Query, UseGuards} from '@nestjs/common';
import {CreateClinicDto} from "./dto/CreateClinicDto";
import {ClinicService} from "./clinic.service";
import {ApiBody, ApiQuery} from "@nestjs/swagger";
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
    create(@Body() dto: CreateClinicDto){
        return this.clinicService.createClinic(dto);
    }

    @UseGuards(AuthGuard)
    @Get()
    @ApiQuery({ name: 'name', required: false, description: 'Filter by part of name' })
    @ApiQuery({ name: 'sort', enum: ['asc', 'desc'], required: false, description: 'Sort by name' })
    getAllClinics(
        @Query('name') name?: string,
        @Query('sort') sort: 'asc' | 'desc' = 'asc'
    ) {
        return this.clinicService.getClinics(name, sort);
    }
}
