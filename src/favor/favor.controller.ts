import {Body, Controller, Get, Post, Put, Delete, Param, Query, UseGuards, HttpCode, HttpStatus} from '@nestjs/common';
import {CreateFavorDto} from "./dto/createFavorDto";
import {FavorService} from "./favor.service";
import {ApiBody, ApiQuery, ApiParam, ApiOperation, ApiResponse, ApiTags} from "@nestjs/swagger";
import {RolesGuard} from "../guards/roles.guard";
import {AuthGuard} from "../guards/auth.guard";
import {Roles} from "../decorators/roles.decorator";

@ApiTags('Favors')
@Controller('favors')
export class FavorController {
    constructor(
        private readonly favorService: FavorService
    ) {
    }

    @Post()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBody({ type: CreateFavorDto })
    @ApiOperation({ summary: 'Create service' })
    @ApiResponse({ status: 201, description: 'Service successfully created' })
    create(@Body() dto: CreateFavorDto) {
        return this.favorService.createFavor(dto);
    }

    @UseGuards(AuthGuard)
    @Get()
    @ApiQuery({ name: 'name', required: false, description: 'Filter services by part of their name' })
    @ApiQuery({ name: 'sort', enum: ['asc', 'desc'], description: 'Sort services by name ascending or descending', required: false })
    @ApiOperation({ summary: 'Get list of services with filters' })
    @ApiResponse({ status: 200, description: 'List of services' })
    getFavors(
        @Query('name') name?: string,
        @Query('sort') sort: 'asc' | 'desc' = 'asc'
    ) {
        return this.favorService.getFavors(name, sort);
    }

    @UseGuards(AuthGuard)
    @Get(':id')
    @ApiParam({ name: 'id', description: 'Service ID' })
    @ApiOperation({ summary: 'Get service by ID' })
    @ApiResponse({ status: 200, description: 'Service details' })
    getFavorById(@Param('id') id: number) {
        return this.favorService.getFavorById(id);
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Put(':id')
    @Roles('admin')
    @ApiParam({ name: 'id', description: 'Service ID' })
    @ApiBody({ schema: { type: 'object', properties: { name: { type: 'string' } } } })
    @ApiOperation({ summary: 'Update service' })
    @ApiResponse({ status: 200, description: 'Service updated' })
    updateFavor(@Param('id') id: number, @Body() body: { name: string }) {
        return this.favorService.updateFavor(id, body);
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Delete(':id')
    @Roles('admin')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiParam({ name: 'id', description: 'Service ID' })
    @ApiOperation({ summary: 'Delete service' })
    async deleteFavor(@Param('id') id: number): Promise<void> {
        await this.favorService.deleteFavor(id);
    }
}
