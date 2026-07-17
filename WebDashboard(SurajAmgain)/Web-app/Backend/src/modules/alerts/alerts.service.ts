import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AlertEvent, AlertDocument } from './schemas/alert.schema';
import { MOCK_ALERTS } from '../../common/constants/mock-data';

@Injectable()
export class AlertsService {
  constructor(
    @InjectModel(AlertEvent.name) private alertModel: Model<AlertDocument>,
  ) {}

  async findAll(): Promise<AlertEvent[]> {
    return this.alertModel.find().exec();
  }

  async findOne(id: string): Promise<AlertEvent | null> {
    try {
      return this.alertModel.findById(id).exec();
    } catch {
      return null;
    }
  }

  async getUnacknowledgedCount(): Promise<number> {
    return this.alertModel.countDocuments({ acknowledged: false });
  }

  async seedDatabase(): Promise<void> {
    const count = await this.alertModel.countDocuments();
    if (count === 0) {
      const alertsToInsert = MOCK_ALERTS.map(({ id, ...rest }) => rest);
      await this.alertModel.insertMany(alertsToInsert);
      console.log('✅ Alerts seeded successfully!');
    }
  }
}
