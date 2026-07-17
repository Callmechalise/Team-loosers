import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CaretakersService } from './caretakers.service';

@ApiTags('caretakers')
@Controller('caretakers')
export class CaretakersController {
  constructor(private readonly caretakersService: CaretakersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all caretakers' })
  findAll() {
    return this.caretakersService.findAll();
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get caretaker profile' })
  getProfile() {
    return this.caretakersService.getProfile();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get caretaker by ID' })
  findOne(@Param('id') id: string) {
    return this.caretakersService.findOne(id);
  }
}