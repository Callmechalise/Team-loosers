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
    return this.residentModel.findById(id).exec();
  }

  async seedDatabase(): Promise<void> {
    const count = await this.residentModel.countDocuments();
    if (count === 0) {
      await this.residentModel.insertMany(MOCK_RESIDENTS);
      console.log('✅ Residents seeded successfully!');
    }
  }
}
