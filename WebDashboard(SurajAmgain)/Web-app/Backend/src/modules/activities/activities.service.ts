import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ActivityEvent, ActivityDocument } from './schemas/activity.schema';
import { MOCK_ACTIVITIES } from '../../common/constants/mock-data';

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectModel(ActivityEvent.name) private activityModel: Model<ActivityDocument>,
  ) {}

  async findAll(): Promise<ActivityEvent[]> {
    return this.activityModel.find().exec();
  }

  async findOne(id: string): Promise<ActivityEvent | null> {
    try {
      return this.activityModel.findById(id).exec();
    } catch {
      return null;
    }
  }

  async getRecent(limit: number = 10): Promise<ActivityEvent[]> {
    return this.activityModel.find().sort({ time: -1 }).limit(limit).exec();
  }

  async seedDatabase(): Promise<void> {
    const count = await this.activityModel.countDocuments();
    if (count === 0) {
      const activitiesToInsert = MOCK_ACTIVITIES.map(({ id, ...rest }) => rest);
      await this.activityModel.insertMany(activitiesToInsert);
      console.log('✅ Activities seeded successfully!');
    }
  }
}
