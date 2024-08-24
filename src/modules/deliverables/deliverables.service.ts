import { Injectable } from '@nestjs/common';
import { CreateDeliverableDto } from './dto/create-deliverable.dto';
import { UpdateDeliverableDto } from './dto/update-deliverable.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Deliverable } from 'src/entities/deliverable.entity';

@Injectable()
export class DeliverablesService {
  constructor(
    @InjectRepository(Deliverable)
    private deliverableRepository: Repository<Deliverable>
  ){}

  create(createDeliverableDto: CreateDeliverableDto) {
    return 'This action adds a new deliverable';
  }

  async findAll(userId: number = null, page:number=1, pageSize: number=10): Promise<Deliverable[]> {
    const offset = (page - 1) * pageSize
    
    const queryBuilder = this.deliverableRepository
    .createQueryBuilder('deliverable')
    .leftJoinAndSelect('deliverable.deliverableType', 'deliverableType')
    .leftJoinAndSelect('deliverable.permissions', 'permission')
    .leftJoinAndSelect('permission.permissionType', 'permissionType')
    .select([
      'deliverable.name AS deliverable_name',
      'deliverableType.name AS deliverableType',
      'permissionType.name AS PermissionType',
      `TO_CHAR(COALESCE(deliverable.updatedAt, deliverable.createdAt), 'DD-MM-YYYY') AS "lastDate"`,
    ])

//    .addSelect("COALESCE(deliverable.updatedAt, deliverable.createdAt)", "orderDate")
    .orderBy('"lastDate"', 'DESC')
    .limit(pageSize)
    .offset(offset)
    
    if (userId) {
      queryBuilder.where('permission.userId = :userId', { userId });
    }
    const result = await queryBuilder.getRawMany();
    //.getMany()
    
    return result; // `This action returns all deliverables`;
  }

  findOne(id: number) {
    return `This action returns a #${id} deliverable`;
  }

  update(id: number, updateDeliverableDto: UpdateDeliverableDto) {
    return `This action updates a #${id} deliverable`;
  }

  remove(id: number) {
    return `This action removes a #${id} deliverable`;
  }
}
