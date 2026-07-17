import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { IotService } from './iot.service';
import { HealthDataDto } from './dto/health-data.dto';

@ApiTags('iot')
@Controller('data')
export class IotController {
  constructor(private readonly iotService: IotService) {}

  @Post()
  @ApiOperation({ summary: 'Receive health data from IoT device' })
  @ApiResponse({ status: 201, description: 'Data received successfully' })
  @ApiResponse({ status: 400, description: 'Invalid data format' })
  async receiveData(@Body() healthData: HealthDataDto) {
    return this.iotService.receiveData(healthData);
  }

  @Get('device/:cardId')
  @ApiOperation({ summary: 'Get historical data for a device' })
  async getDeviceData(
    @Param('cardId') cardId: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 100;
    return this.iotService.getDeviceData(cardId, limitNum);
  }

  @Get('device/:cardId/latest')
  @ApiOperation({ summary: 'Get latest data for a device' })
  async getLatestDeviceData(@Param('cardId') cardId: string) {
    return this.iotService.getLatestDeviceData(cardId);
  }

  @Get('devices/latest')
  @ApiOperation({ summary: 'Get latest data for all devices' })
  async getAllLatestData() {
    return this.iotService.getAllLatestData();
  }
}
