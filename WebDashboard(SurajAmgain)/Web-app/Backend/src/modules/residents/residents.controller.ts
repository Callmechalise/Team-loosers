import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ResidentsService } from './residents.service';

@ApiTags('residents')
@Controller('residents')
export class ResidentsController {
  constructor(private readonly residentsService: ResidentsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all residents' })
  findAll() {
    return this.residentsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get resident by ID' })
  findOne(@Param('id') id: string) {
    return this.residentsService.findOne(id);
  }
}