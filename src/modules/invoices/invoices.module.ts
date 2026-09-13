import { Module } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invoice } from '../../entities/invoice.entity';
import { InvoiceStatus } from '../../entities/invoiceStatus.entity';
import { UserEntity } from '../../entities/user.entity';
import { Permission } from 'src/entities/permission.entity';
import { PermissionType } from 'src/entities/permissionType.entity';
import { Company } from 'src/entities/company.entity';
import { NotificationsGateway } from 'src/websockets/notifications/notifications.gateway';
import { NotificationsModule } from '../notifications/notifications.module';
import { MailService } from '../mail/mail.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Invoice,
      InvoiceStatus,
      UserEntity,
      Permission,
      PermissionType,
      Company,
    ]),
    NotificationsModule,
  ],
  providers: [InvoicesService,NotificationsGateway, MailService],
  controllers: [InvoicesController],
})
export class InvoicesModule {}
