import { Injectable } from '@nestjs/common';
import { ResidentsService } from '../residents/residents.service';
import { AlertsService } from '../alerts/alerts.service';
import { FallsService } from '../falls/falls.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ActivitiesService } from '../activities/activities.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly residentsService: ResidentsService,
    private readonly alertsService: AlertsService,
    private readonly fallsService: FallsService,
    private readonly notificationsService: NotificationsService,
    private readonly activitiesService: ActivitiesService,
  ) {}

  async getDashboardSummary() {
    const residents = await this.residentsService.findAll();
    const alerts = await this.alertsService.findAll();
    const falls = await this.fallsService.findAll();
    const notifications = await this.notificationsService.findAll();
    const activities = await this.activitiesService.getRecent(5);

    const healthy = residents.filter(r => r.status === 'healthy').length;
    const warning = residents.filter(r => r.status === 'warning').length;
    const emergency = residents.filter(r => r.status === 'emergency').length;
    const total = residents.length;

    const avgHeartRate = residents.reduce((acc, r) => acc + r.vitals.heartRate, 0) / total;
    const avgTemperature = residents.reduce((acc, r) => acc + r.vitals.temperature, 0) / total;
    const avgSpo2 = residents.reduce((acc, r) => acc + r.vitals.spo2, 0) / total;
    const avgBattery = residents.reduce((acc, r) => acc + r.vitals.battery, 0) / total;

    return {
      residents: {
        total,
        healthy,
        warning,
        emergency,
      },
      alerts: {
        unacknowledged: alerts.filter(a => !a.acknowledged).length,
        total: alerts.length,
      },
      vitals: {
        avgHeartRate: Math.round(avgHeartRate),
        avgTemperature: Math.round(avgTemperature * 10) / 10,
        avgSpo2: Math.round(avgSpo2),
        avgBattery: Math.round(avgBattery),
      },
      falls: {
        recent: falls.filter(f => f.responseStatus === 'pending').length,
        total: falls.length,
      },
      activities: {
        recent: activities,
      },
      notifications: {
        unread: notifications.filter(n => !n.read).length,
      },
    };
  }
}
