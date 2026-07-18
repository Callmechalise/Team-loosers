import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { IotController } from './iot.controller';
import { IotService } from './iot.service';
import { IotData, IotDataSchema } from './schemas/iot-data.schema';
import { EmergencyAlert, EmergencyAlertSchema } from './schemas/emergency-alert.schema';
import { AlertsModule } from '../alerts/alerts.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: IotData.name, schema: IotDataSchema },
      { name: EmergencyAlert.name, schema: EmergencyAlertSchema },
    ]),
    AlertsModule,
  ],
  controllers: [IotController],
  providers: [IotService],
  exports: [IotService],
})
export class IotModule {}
