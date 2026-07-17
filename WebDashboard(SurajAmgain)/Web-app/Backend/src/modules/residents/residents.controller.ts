import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ResidentsService } from './residents.service';

@ApiTags('residents')
@Controller('residents')
export class ResidentsController {
  constructor(private readonly residentsService: ResidentsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all residents' })
  async findAll() {
    return this.residentsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get resident by ID' })
  async findOne(@Param('id') id: string) {
    const resident = await this.residentsService.findOne(id);
    if (!resident) {
      throw new NotFoundException('Resident not found');
    }
    return resident;
  }
}
