import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { ResidentsModule } from '../residents/residents.module';
import { AlertsModule } from '../alerts/alerts.module';
import { FallsModule } from '../falls/falls.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { ActivitiesModule } from '../activities/activities.module';

@Module({
  imports: [
    ResidentsModule,
    AlertsModule,
    FallsModule,
    NotificationsModule,
    ActivitiesModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}