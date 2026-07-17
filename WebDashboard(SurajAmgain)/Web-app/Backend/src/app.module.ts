import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ResidentsModule } from './modules/residents/residents.module';
import { AlertsModule } from './modules/alerts/alerts.module';
import { FallsModule } from './modules/falls/falls.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ActivitiesModule } from './modules/activities/activities.module';
import { CaretakersModule } from './modules/caretakers/caretakers.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { IotModule } from './modules/iot/iot.module';
import databaseConfig from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [databaseConfig],
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('database.uri'),
      }),
      inject: [ConfigService],
    }),
    ResidentsModule,
    AlertsModule,
    FallsModule,
    NotificationsModule,
    ActivitiesModule,
    CaretakersModule,
    DashboardModule,
    IotModule,  // <-- ADD THIS LINE
  ],
})
export class AppModule {}
