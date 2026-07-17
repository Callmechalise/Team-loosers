import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FallEvent, FallDocument } from './schemas/fall.schema';
import { MOCK_FALLS } from '../../common/constants/mock-data';

@Injectable()
export class FallsService {
  constructor(
    @InjectModel(FallEvent.name) private fallModel: Model<FallDocument>,
  ) {}

  async findAll(): Promise<FallEvent[]> {
    return this.fallModel.find().exec();
  }

  async findOne(id: string): Promise<FallEvent | null> {
    try {
      return this.fallModel.findById(id).exec();
    } catch {
      return null;
    }
  }

  async getPending(): Promise<FallEvent[]> {
    return this.fallModel.find({ responseStatus: 'pending' }).exec();
  }

  async seedDatabase(): Promise<void> {
    const count = await this.fallModel.countDocuments();
    if (count === 0) {
      const fallsToInsert = MOCK_FALLS.map(({ id, ...rest }) => rest);
      await this.fallModel.insertMany(fallsToInsert);
      console.log('✅ Falls seeded successfully!');
    }
  }
}
