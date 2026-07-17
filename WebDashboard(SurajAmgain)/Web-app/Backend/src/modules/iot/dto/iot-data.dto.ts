import { IsBoolean, IsNumber, IsOptional, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SensorDataDto {
  @ApiProperty({ example: 75, description: 'Heart rate in BPM' })
  @IsNumber()
  @IsOptional()
  heartRate?: number;

  @ApiProperty({ example: 98, description: 'Blood oxygen saturation percentage' })
  @IsNumber()
  @IsOptional()
  spo2?: number;

  @ApiProperty({ example: false, description: 'Fall detection status' })
  @IsBoolean()
  @IsOptional()
  fallDetected?: boolean;

  @ApiProperty({ example: false, description: 'Button alert / SOS status' })
  @IsBoolean()
  @IsOptional()
  btn_alert?: boolean;

  @ApiProperty({ example: 27.7172, description: 'Latitude coordinate' })
  @IsNumber()
  @IsOptional()
  lat?: number;

  @ApiProperty({ example: 85.3240, description: 'Longitude coordinate' })
  @IsNumber()
  @IsOptional()
  long?: number;

  @ApiProperty({ example: 0.5, description: 'Accelerometer X-axis value' })
  @IsNumber()
  @IsOptional()
  accx?: number;

  @ApiProperty({ example: 0.3, description: 'Accelerometer Y-axis value' })
  @IsNumber()
  @IsOptional()
  accy?: number;

  @ApiProperty({ example: 9.8, description: 'Accelerometer Z-axis value' })
  @IsNumber()
  @IsOptional()
  accz?: number;
}

export class IotDataDto {
  @ApiProperty({ example: 'ESP_001', description: 'Device identifier' })
  @IsString()
  @IsNotEmpty()
  deviceId: string;

  @ApiProperty({ type: SensorDataDto, description: 'Sensor data payload' })
  sensorData: SensorDataDto;

  @ApiProperty({ example: 1234567890, description: 'Unix timestamp' })
  @IsNumber()
  @IsOptional()
  timestamp?: number;
}
