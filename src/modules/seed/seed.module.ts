import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserSeeder } from './user-seeder';
import { InvoiceStatusSeeder} from './invoiceStatus.seeder';
import { DeliverableTypeSeeder} from './deliverableType.seeder';
import { UserEntity } from '../../entities/user.entity';
import { InvoiceStatus } from '../../entities/invoiceStatus.entity';
import { DeliverableType } from '../../entities/deliverableType.entity';
import { PermissionTypeSeeder } from './permissionType.seeder';
import { PermissionType } from 'src/entities/permissionType.entity';


@Module({
  imports: [TypeOrmModule.forFeature(
    [
      UserEntity, 
      InvoiceStatus, 
      DeliverableType,
      PermissionType
    ]
  )],
  providers: [
    UserSeeder, 
    InvoiceStatusSeeder, 
    DeliverableTypeSeeder, 
    PermissionTypeSeeder],
})
export class SeedModule {}
