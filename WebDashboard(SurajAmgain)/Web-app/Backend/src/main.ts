import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ResidentsService } from './modules/residents/residents.service';
import { AlertsService } from './modules/alerts/alerts.service';
import { FallsService } from './modules/falls/falls.service';
import { NotificationsService } from './modules/notifications/notifications.service';
import { ActivitiesService } from './modules/activities/activities.service';
import { CaretakersService } from './modules/caretakers/caretakers.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:3001'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('Elder Care API')
    .setDescription('API for elderly care monitoring system')
    .setVersion('1.0')
    .addTag('residents', 'Resident management')
    .addTag('alerts', 'Alert management')
    .addTag('falls', 'Fall event management')
    .addTag('notifications', 'Notification management')
    .addTag('activities', 'Activity management')
    .addTag('caretakers', 'Caretaker management')
    .addTag('dashboard', 'Dashboard summary')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Seed all collections
  const residentsService = app.get(ResidentsService);
  await residentsService.seedDatabase();
  
  const alertsService = app.get(AlertsService);
  await alertsService.seedDatabase();
  
  const fallsService = app.get(FallsService);
  await fallsService.seedDatabase();
  
  const notificationsService = app.get(NotificationsService);
  await notificationsService.seedDatabase();
  
  const activitiesService = app.get(ActivitiesService);
  await activitiesService.seedDatabase();
  
  const caretakersService = app.get(CaretakersService);
  await caretakersService.seedDatabase();

  const port = process.env.APP_PORT || 3001;
  await app.listen(port);
  console.log('🚀 Application is running on: http://localhost:' + port);
  console.log('📚 Swagger documentation: http://localhost:' + port + '/api/docs');
}
bootstrap();
