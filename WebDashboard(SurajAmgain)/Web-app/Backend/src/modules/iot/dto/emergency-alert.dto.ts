import { IsBoolean, IsNumber, IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EmergencyAlertDto {
  @ApiProperty({ example: 'Chalise-001', description: 'Card/Device identifier' })
  @IsString()
  @IsNotEmpty()
  card_id: string;

  @ApiProperty({ example: true, description: 'Whether this is an emergency alert' })
  @IsBoolean()
  @IsOptional()
  alert?: boolean;

  @ApiProperty({ example: 'Fell', description: 'Alert message/type' })
  @IsString()
  @IsOptional()
  msg?: string;

  @ApiProperty({ example: 27.7172, description: 'Latitude coordinate' })
  @IsNumber()
  @IsOptional()
  lat?: number;

  @ApiProperty({ example: 85.3240, description: 'Longitude coordinate' })
  @IsNumber()
  @IsOptional()
  lng?: number;

  @ApiProperty({ example: 122617, description: 'Unix timestamp' })
  @IsNumber()
  @IsOptional()
  timestamp?: number;
}
