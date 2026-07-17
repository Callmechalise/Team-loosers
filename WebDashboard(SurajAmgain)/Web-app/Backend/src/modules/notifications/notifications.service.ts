import { Injectable } from '@nestjs/common';
import { MOCK_NOTIFICATIONS } from '../../common/constants/mock-data';
import { NotificationItem } from '../../common/types';

@Injectable()
export class NotificationsService {
  private notifications: NotificationItem[] = MOCK_NOTIFICATIONS;

  findAll(): NotificationItem[] {
    return this.notifications;
  }

  findOne(id: string): NotificationItem | undefined {
    return this.notifications.find(notification => notification.id === id);
  }

  getUnread(): NotificationItem[] {
    return this.notifications.filter(notification => !notification.read);
  }

  getUnreadCount(): number {
    return this.notifications.filter(notification => !notification.read).length;
  }
}