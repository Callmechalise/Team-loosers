import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ActivitiesController } from './activities.controller';
import { ActivitiesService } from './activities.service';
import { ActivityEvent, ActivitySchema } from './schemas/activity.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ActivityEvent.name, schema: ActivitySchema }]),
  ],
  controllers: [ActivitiesController],
  providers: [ActivitiesService],
  exports: [ActivitiesService],
})
export class ActivitiesModule {}
