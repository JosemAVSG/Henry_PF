import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './create-notification.dto';
import { AuthGuard } from '../../guards/auth.guards';
import { Request } from 'express';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
    constructor(
        private readonly notificationsService: NotificationsService
    ) {}

    @UseGuards(AuthGuard)
    @Get()
    async getNotifications(
        @Req() req: Request,
        @Query("limit") limit: number = null
    ) {
        const isAdmin = req?.user?.isAdmin;
        const userId = req?.user?.id;

        return this.notificationsService.getNotifications(!isAdmin?userId:null, limit);
    }

    @Post()
    async createNotification(
        @Body() createNotificationDto: CreateNotificationDto
    ) {
        return this.notificationsService.createNotification(createNotificationDto);
    }
}
