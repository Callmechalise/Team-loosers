import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ActivitiesService } from './activities.service';

@ApiTags('activities')
@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all activities' })
  findAll() {
    return this.activitiesService.findAll();
  }

  @Get('recent')
  @ApiOperation({ summary: 'Get recent activities' })
  getRecent(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.activitiesService.getRecent(limitNum);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get activity by ID' })
  findOne(@Param('id') id: string) {
    return this.activitiesService.findOne(id);
  }
}