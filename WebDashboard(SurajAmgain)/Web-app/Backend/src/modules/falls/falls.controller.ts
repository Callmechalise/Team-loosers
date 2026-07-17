import { Controller, Get, Param, Patch, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { FallsService } from './falls.service';

@ApiTags('falls')
@Controller('falls')
export class FallsController {
  constructor(private readonly fallsService: FallsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all fall events' })
  findAll() {
    return this.fallsService.findAll();
  }

  @Get('pending')
  @ApiOperation({ summary: 'Get pending fall events' })
  getPending() {
    return this.fallsService.getPending();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get fall event by ID' })
  findOne(@Param('id') id: string) {
    return this.fallsService.findOne(id);
  }
}