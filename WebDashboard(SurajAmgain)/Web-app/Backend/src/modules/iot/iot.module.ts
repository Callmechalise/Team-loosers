import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { IotController } from './iot.controller';
import { IotService } from './iot.service';
import { IotData, IotDataSchema } from './schemas/iot-data.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: IotData.name, schema: IotDataSchema }]),
  ],
  controllers: [IotController],
  providers: [IotService],
  exports: [IotService],
})
export class IotModule {}
