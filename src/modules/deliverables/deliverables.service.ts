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

  async findAll(page:number=1, pageSize: number=10): Promise<Deliverable[]> {
    const offset = (page - 1) * pageSize
    
    const result = this.deliverableRepository
    .createQueryBuilder('deliverable')
    .leftJoinAndSelect('deliverable.deliverableType', 'deliverableType')
    .select([
      'deliverable.name AS deliverable_name',
      'deliverableType.name AS deliverableType_name',
      'COALESCE(deliverable.updatedAt, deliverable.createdAt) AS "orderDate"',
    ])
    //.addSelect("COALESCE(deliverable.updatedAt, deliverable.createdAt)", "orderDate")
    .orderBy('"orderDate"', 'DESC')
    .limit(pageSize)
    .offset(offset)
    .getRawMany() //.getMany()

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
