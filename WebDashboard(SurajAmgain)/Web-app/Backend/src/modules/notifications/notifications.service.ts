import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotificationItem, NotificationDocument } from './schemas/notification.schema';
import { MOCK_NOTIFICATIONS } from '../../common/constants/mock-data';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(NotificationItem.name) private notificationModel: Model<NotificationDocument>,
  ) {}

  async findAll(): Promise<NotificationItem[]> {
    return this.notificationModel.find().exec();
  }

  async findOne(id: string): Promise<NotificationItem | null> {
    try {
      return this.notificationModel.findById(id).exec();
    } catch {
      return null;
    }
  }

  async getUnread(): Promise<NotificationItem[]> {
    return this.notificationModel.find({ read: false }).exec();
  }

  async getUnreadCount(): Promise<number> {
    return this.notificationModel.countDocuments({ read: false });
  }

  async seedDatabase(): Promise<void> {
    const count = await this.notificationModel.countDocuments();
    if (count === 0) {
      const notificationsToInsert = MOCK_NOTIFICATIONS.map(({ id, ...rest }) => rest);
      await this.notificationModel.insertMany(notificationsToInsert);
      console.log('✅ Notifications seeded successfully!');
    }
  }
}
