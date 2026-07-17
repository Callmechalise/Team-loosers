import { IsNumber, IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class HealthDataDto {
  @ApiProperty({ example: 'Chalise-001', description: 'Card/Device identifier' })
  @IsString()
  @IsNotEmpty()
  card_id: string;

  @ApiProperty({ example: 75.5, description: 'Heart rate in BPM' })
  @IsNumber()
  @IsOptional()
  heartrate?: number;

  @ApiProperty({ example: 98, description: 'Blood oxygen saturation percentage' })
  @IsNumber()
  @IsOptional()
  spo2?: number;

  @ApiProperty({ example: 122617, description: 'Unix timestamp' })
  @IsNumber()
  @IsOptional()
  timestamp?: number;

  @ApiProperty({ example: 27.7172, description: 'Latitude coordinate' })
  @IsNumber()
  @IsOptional()
  lat?: number;

  @ApiProperty({ example: 85.3240, description: 'Longitude coordinate' })
  @IsNumber()
  @IsOptional()
  lng?: number;

  @ApiProperty({ example: 0.0, description: 'Speed in km/h' })
  @IsNumber()
  @IsOptional()
  speed?: number;

  @ApiProperty({ example: 0, description: 'Accelerometer X-axis value' })
  @IsNumber()
  @IsOptional()
  ax?: number;

  @ApiProperty({ example: 0, description: 'Accelerometer Y-axis value' })
  @IsNumber()
  @IsOptional()
  ay?: number;

  @ApiProperty({ example: 0, description: 'Accelerometer Z-axis value' })
  @IsNumber()
  @IsOptional()
  az?: number;

  // Additional fields from ESP
  @IsBoolean()
  @IsOptional()
  fallDetected?: boolean;

  @IsBoolean()
  @IsOptional()
  btn_alert?: boolean;
}
