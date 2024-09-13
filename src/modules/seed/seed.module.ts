import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserSeeder } from './user-seeder';
import { InvoiceStatusSeeder } from './invoiceStatus.seeder';
import { DeliverableTypeSeeder } from './deliverableType.seeder';
import { UserEntity } from '../../entities/user.entity';
import { InvoiceStatus } from '../../entities/invoiceStatus.entity';
import { DeliverableType } from '../../entities/deliverableType.entity';
import { DeliverableCategory } from '../../entities/deliverableCategory.entity';
import { DeliverableCategorySeeder } from './deliverableCategory.seeder';
import { PermissionTypeSeeder } from './permissionType.seeder';
import { PermissionType } from '../../entities/permissionType.entity';
import { Permission } from '../../entities/permission.entity';
import { PermissionSeeder } from './permission.seeder';
import { Deliverable } from '../../entities/deliverable.entity';
import { DeliverableSeeder } from './deliverable.seeder';
import { CompanySeeder } from './company-seeder';
import { Company } from '../../entities/company.entity';
import { InvoiceSeeder } from './invoices-seeder';
import { Invoice } from '../../entities/invoice.entity';
import { NotificationType } from '../../entities/notificationType.entity';
import { NotificationTypeSeeder } from './notificationType.seeder';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      Company,
      Invoice,
      InvoiceStatus,
      Deliverable,
      DeliverableType,
      DeliverableCategory,
      PermissionType,
      Permission,
      NotificationType
    ]),
  ],
  providers: [
    UserSeeder,
    CompanySeeder,
    InvoiceSeeder,
    InvoiceStatusSeeder,
    DeliverableSeeder,
    DeliverableTypeSeeder,
    DeliverableCategorySeeder,
    PermissionTypeSeeder,
    PermissionSeeder,
    NotificationTypeSeeder
  ],
})
export class SeedModule {}
