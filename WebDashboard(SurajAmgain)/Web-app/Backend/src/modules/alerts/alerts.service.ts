import { Injectable } from '@nestjs/common';
import { MOCK_ALERTS } from '../../common/constants/mock-data';
import { AlertEvent } from '../../common/types';

@Injectable()
export class AlertsService {
  private alerts: AlertEvent[] = MOCK_ALERTS;

  findAll(): AlertEvent[] {
    return this.alerts;
  }

  findOne(id: string): AlertEvent | undefined {
    return this.alerts.find(alert => alert.id === id);
  }

  getUnacknowledgedCount(): number {
    return this.alerts.filter(alert => !alert.acknowledged).length;
  }
}