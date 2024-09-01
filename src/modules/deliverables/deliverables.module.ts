import { Module } from '@nestjs/common';
import { DeliverablesService } from './deliverables.service';
import { DeliverablesController } from './deliverables.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Deliverable } from '../../entities/deliverable.entity';
import { DeliverableType } from '../../entities/deliverableType.entity';
import { Permission } from '../../entities/permission.entity';
import { PermissionType } from '../../entities/permissionType.entity';
import { UserEntity } from '../../entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Deliverable, DeliverableType,Permission,PermissionType, UserEntity])],
  controllers: [DeliverablesController],
  providers: [DeliverablesService],
})
export class DeliverablesModule {}
