import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { IotService } from './iot.service';
import { HealthDataDto } from './dto/health-data.dto';
import { EmergencyAlertDto } from './dto/emergency-alert.dto';

@ApiTags('IoT Data')
@Controller('data')
export class IotController {
  constructor(private readonly iotService: IotService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Receive health data from IoT device',
    description: 'ESP32 sends health data (heart rate, SpO2, GPS, accelerometer) to this endpoint'
  })
  @ApiResponse({ status: 201, description: 'Data received successfully' })
  @ApiResponse({ status: 400, description: 'Invalid data format' })
  async receiveData(@Body() healthData: HealthDataDto) {
    return this.iotService.receiveData(healthData);
  }

  @Post('alert')
  @ApiOperation({ 
    summary: 'Receive emergency alert from IoT device',
    description: 'ESP32 sends emergency alert (fall detection, button press) with location'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Alert received successfully',
    schema: {
      example: {
        status: 'success',
        message: 'Emergency alert received',
        alert: {
          card_id: 'Chalise-001',
          msg: 'Fell',
          location: 'Room 204',
          lat: 27.7172,
          lng: 85.3240,
          timestamp: 122617
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid data format' })
  async receiveAlert(@Body() alertData: EmergencyAlertDto) {
    return this.iotService.receiveAlert(alertData);
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

  @Get('alerts')
  @ApiOperation({ summary: 'Get all emergency alerts' })
  async getAllAlerts() {
    return this.iotService.getAllAlerts();
  }

  @Get('alerts/:cardId')
  @ApiOperation({ summary: 'Get emergency alerts for a specific device' })
  async getDeviceAlerts(@Param('cardId') cardId: string) {
    return this.iotService.getDeviceAlerts(cardId);
  }
}
