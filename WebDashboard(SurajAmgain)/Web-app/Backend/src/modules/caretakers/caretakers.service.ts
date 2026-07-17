import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Caretaker, CaretakerDocument } from './schemas/caretaker.schema';
import { MOCK_CARETAKERS } from '../../common/constants/mock-data';

@Injectable()
export class CaretakersService {
  constructor(
    @InjectModel(Caretaker.name) private caretakerModel: Model<CaretakerDocument>,
  ) {}

  async findAll(): Promise<Caretaker[]> {
    return this.caretakerModel.find().exec();
  }

  async findOne(id: string): Promise<Caretaker | null> {
    try {
      return this.caretakerModel.findById(id).exec();
    } catch {
      return null;
    }
  }

  async getProfile(): Promise<Caretaker | null> {
    const caretakers = await this.caretakerModel.find().limit(1).exec();
    return caretakers.length > 0 ? caretakers[0] : null;
  }

  async seedDatabase(): Promise<void> {
    const count = await this.caretakerModel.countDocuments();
    if (count === 0) {
      const caretakersToInsert = MOCK_CARETAKERS.map(({ id, ...rest }) => rest);
      await this.caretakerModel.insertMany(caretakersToInsert);
      console.log('✅ Caretakers seeded successfully!');
    }
  }
}
