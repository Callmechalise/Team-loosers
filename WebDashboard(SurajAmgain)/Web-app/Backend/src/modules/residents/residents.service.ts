import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Resident, ResidentDocument } from './schemas/resident.schema';
import { MOCK_RESIDENTS } from '../../common/constants/mock-data';

@Injectable()
export class ResidentsService {
  constructor(
    @InjectModel(Resident.name) private residentModel: Model<ResidentDocument>,
  ) {}

  async findAll(): Promise<Resident[]> {
    return this.residentModel.find().exec();
  }

  async findOne(id: string): Promise<Resident | null> {
    try {
      return this.residentModel.findById(id).exec();
    } catch {
      // If it's not a valid ObjectId, return null
      return null;
    }
  }

  async seedDatabase(): Promise<void> {
    const count = await this.residentModel.countDocuments();
    if (count === 0) {
      // Remove the id field from mock data so MongoDB generates its own
      const residentsToInsert = MOCK_RESIDENTS.map(({ id, ...rest }) => rest);
      await this.residentModel.insertMany(residentsToInsert);
      console.log('✅ Residents seeded successfully!');
    }
  }
}
