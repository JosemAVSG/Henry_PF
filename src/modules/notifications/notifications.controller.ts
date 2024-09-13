import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './create-notification.dto';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
    constructor(
        private readonly notificationsService: NotificationsService
    ) {}

    @Get()
    async getNotifications() {
        return this.notificationsService.getNotifications();
    }

    @Post()
    async createNotification(
        @Body() createNotificationDto: CreateNotificationDto
    ) {
        return this.notificationsService.createNotification(createNotificationDto);
    }
}
