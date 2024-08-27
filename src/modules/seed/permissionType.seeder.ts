import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PermissionType } from '../../entities/permissionType.entity';

@Injectable()
export class PermissionTypeSeeder {
  constructor(
    @InjectRepository(PermissionType)
    private readonly permissionTypeRepository: Repository<PermissionType>,
  ) {}

  async seedPermissionType() {
    const permissionTypeData = [];

    if(await this.permissionTypeRepository.count() > 0) {
      return;
    }

    let permissionType = new PermissionType();
    permissionType.name = "owner"
    permissionTypeData.push(permissionType);

    permissionType = new PermissionType();
    permissionType.name = "editor"
    permissionTypeData.push(permissionType);

    permissionType = new PermissionType();
    permissionType.name = "viewer"
    permissionTypeData.push(permissionType);

    await this.permissionTypeRepository.save(permissionTypeData);
    console.info('Seeded Permission Type Data');
  }
}
