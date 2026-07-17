import { Module } from '@nestjs/common';
import { ResidentsModule } from './modules/residents/residents.module';
import { AlertsModule } from './modules/alerts/alerts.module';
import { FallsModule } from './modules/falls/falls.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ActivitiesModule } from './modules/activities/activities.module';
import { CaretakersModule } from './modules/caretakers/caretakers.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';

@Module({
  imports: [
    ResidentsModule,
    AlertsModule,
    FallsModule,
    NotificationsModule,
    ActivitiesModule,
    CaretakersModule,
    DashboardModule,
  ],
})
export class AppModule {}