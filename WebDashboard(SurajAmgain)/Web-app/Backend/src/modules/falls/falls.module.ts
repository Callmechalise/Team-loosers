import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FallsController } from './falls.controller';
import { FallsService } from './falls.service';
import { FallEvent, FallSchema } from './schemas/fall.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: FallEvent.name, schema: FallSchema }]),
  ],
  controllers: [FallsController],
  providers: [FallsService],
  exports: [FallsService],
})
export class FallsModule {}
