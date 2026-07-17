import { Injectable } from '@nestjs/common';
import { MOCK_RESIDENTS, MOCK_ALERTS, MOCK_FALLS, MOCK_NOTIFICATIONS, MOCK_ACTIVITIES } from '../../common/constants/mock-data';

@Injectable()
export class DashboardService {
  getDashboardSummary() {
    // Calculate resident status counts
    const healthy = MOCK_RESIDENTS.filter(r => r.status === 'healthy').length;
    const warning = MOCK_RESIDENTS.filter(r => r.status === 'warning').length;
    const emergency = MOCK_RESIDENTS.filter(r => r.status === 'emergency').length;
    const total = MOCK_RESIDENTS.length;

    // Calculate vitals summary
    const avgHeartRate = MOCK_RESIDENTS.reduce((acc, r) => acc + r.vitals.heartRate, 0) / total;
    const avgTemperature = MOCK_RESIDENTS.reduce((acc, r) => acc + r.vitals.temperature, 0) / total;
    const avgSpo2 = MOCK_RESIDENTS.reduce((acc, r) => acc + r.vitals.spo2, 0) / total;
    const avgBattery = MOCK_RESIDENTS.reduce((acc, r) => acc + r.vitals.battery, 0) / total;

    return {
      residents: {
        total,
        healthy,
        warning,
        emergency,
      },
      alerts: {
        unacknowledged: MOCK_ALERTS.filter(a => !a.acknowledged).length,
        total: MOCK_ALERTS.length,
      },
      vitals: {
        avgHeartRate: Math.round(avgHeartRate),
        avgTemperature: Math.round(avgTemperature * 10) / 10,
        avgSpo2: Math.round(avgSpo2),
        avgBattery: Math.round(avgBattery),
      },
      falls: {
        recent: MOCK_FALLS.filter(f => f.responseStatus === 'pending').length,
        total: MOCK_FALLS.length,
      },
      activities: {
        recent: MOCK_ACTIVITIES.slice(0, 5),
      },
      notifications: {
        unread: MOCK_NOTIFICATIONS.filter(n => !n.read).length,
      },
    };
  }
}
