import { Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all notifications' })
  findAll() {
    return this.notificationsService.findAll();
  }

  @Get('unread')
  @ApiOperation({ summary: 'Get unread notifications' })
  getUnread() {
    return this.notificationsService.getUnread();
  }

  @Get('unread/count')
  @ApiOperation({ summary: 'Get unread notifications count' })
  getUnreadCount() {
    return { count: this.notificationsService.getUnreadCount() };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get notification by ID' })
  findOne(@Param('id') id: string) {
    return this.notificationsService.findOne(id);
  }
}