import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from '../../entities/permission.entity';

@Injectable()
export class PermissionSeeder {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  async seedPermission() {
    const permissionData = [];

    if(await this.permissionRepository.count() > 0) {
      return;
    }

    let permission = new Permission();
    permission.userId = "1"
    permission.deliverableId = "1"
    permission.permissionTypeId = 1
    permissionData.push(permission);

    permission = new Permission();
    permission.userId = "1"
    permission.deliverableId = "1"
    permission.permissionTypeId = 2
    permissionData.push(permission);

    permission = new Permission();
    permission.userId = "1"
    permission.deliverableId = "1"
    permission.permissionTypeId = 3
    permissionData.push(permission);

    await this.permissionRepository.save(permissionData);
    console.info('Seeded Permission Type Data');
  }
}
