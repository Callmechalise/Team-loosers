import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CaretakersController } from './caretakers.controller';
import { CaretakersService } from './caretakers.service';
import { Caretaker, CaretakerSchema } from './schemas/caretaker.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Caretaker.name, schema: CaretakerSchema }]),
  ],
  controllers: [CaretakersController],
  providers: [CaretakersService],
  exports: [CaretakersService],
})
export class CaretakersModule {}
