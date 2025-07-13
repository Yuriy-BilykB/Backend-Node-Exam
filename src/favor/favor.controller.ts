import {Body, Controller, Get, Post, Put, Delete, Param, Query, UseGuards} from '@nestjs/common';
import {CreateFavorDto} from "./dto/createFavorDto";
import {FavorService} from "./favor.service";
import {ApiBody, ApiQuery, ApiParam} from "@nestjs/swagger";
import {RolesGuard} from "../guards/roles.guard";
import {AuthGuard} from "../guards/auth.guard";
import {Roles} from "../decorators/roles.decorator";

@Controller('favor')
export class FavorController {
    constructor(
        private readonly favorService: FavorService
    ) {
    }

    @Post()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBody({ type: CreateFavorDto })
    create(@Body() dto: CreateFavorDto) {
        return this.favorService.createFavor(dto);
    }

    @UseGuards(AuthGuard)
    @Get()
    @ApiQuery({ name: 'name', required: false, description: 'Filter favors by part of their name' })
    @ApiQuery({ name: 'sort', enum: ['asc', 'desc'], description: 'Sort favors by name ascending or descending', required: false })
    getFavors(
        @Query('name') name?: string,
        @Query('sort') sort: 'asc' | 'desc' = 'asc'
    ) {
        return this.favorService.getFavors(name, sort);
    }

    @UseGuards(AuthGuard)
    @Get(':id')
    @ApiParam({ name: 'id', description: 'Favor ID' })
    getFavorById(@Param('id') id: number) {
        return this.favorService.getFavorById(id);
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Put(':id')
    @Roles('admin')
    @ApiParam({ name: 'id', description: 'Favor ID' })
    @ApiBody({ schema: { type: 'object', properties: { name: { type: 'string' } } } })
    updateFavor(@Param('id') id: number, @Body() body: { name: string }) {
        return this.favorService.updateFavor(id, body);
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Delete(':id')
    @Roles('admin')
    @ApiParam({ name: 'id', description: 'Favor ID' })
    deleteFavor(@Param('id') id: number) {
        return this.favorService.deleteFavor(id);
    }
}
