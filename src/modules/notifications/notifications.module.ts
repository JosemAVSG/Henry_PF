import { Module } from '@nestjs/common';
import { NotificationsGateway } from '../../websockets/notifications/notifications.gateway';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from '../../entities/notification.entity';
import { NotificationType } from '../../entities/notificationType.entity';
import { UserEntity } from '../../entities/user.entity';
import { Invoice } from '../../entities/invoice.entity';
import { Deliverable } from '../../entities/deliverable.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    Notification, NotificationType, UserEntity, Invoice, Deliverable
  ])],
  providers: [NotificationsGateway, NotificationsService],
  controllers: [NotificationsController]
})
export class NotificationsModule {}
