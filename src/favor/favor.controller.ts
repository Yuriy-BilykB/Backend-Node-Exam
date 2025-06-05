import {Body, Controller, Get, Post, Query, UseGuards} from '@nestjs/common';
import {CreateFavorDto} from "./dto/createFavorDto";
import {FavorService} from "./favor.service";
import {ApiBody, ApiQuery} from "@nestjs/swagger";
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

}
