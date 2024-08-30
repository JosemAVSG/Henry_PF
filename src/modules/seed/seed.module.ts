import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserSeeder } from './user-seeder';
import { InvoiceStatusSeeder} from './invoiceStatus.seeder';
import { DeliverableTypeSeeder} from './deliverableType.seeder';
import { UserEntity } from '../../entities/user.entity';
import { InvoiceStatus } from '../../entities/invoiceStatus.entity';
import { DeliverableType } from '../../entities/deliverableType.entity';
import { PermissionTypeSeeder } from './permissionType.seeder';
import { PermissionType } from '../../entities/permissionType.entity';
import { Deliverable } from '../../entities/deliverable.entity';
import { DeliverableSeeder } from './delivery.seeder';


@Module({
  imports: [TypeOrmModule.forFeature(
    [
      UserEntity, 
      InvoiceStatus,
      Deliverable, 
      DeliverableType,
      PermissionType
    ]
  )],
  providers: [
    UserSeeder, 
    InvoiceStatusSeeder, 
    DeliverableSeeder,
    DeliverableTypeSeeder, 
    PermissionTypeSeeder],
})
export class SeedModule {}
