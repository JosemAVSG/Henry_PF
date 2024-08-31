import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeliverableCategory } from '../../entities/deliverableCategory.entity';

@Injectable()
export class DeliverableCategorySeeder {
  constructor(
    @InjectRepository(DeliverableCategory)
    private readonly deliverableCategoryRepository: Repository<DeliverableCategory>,
  ) {}

  async seedDeliverableCategory() {
    const deliverableCategoryData = [];

    if(await this.deliverableCategoryRepository.count() > 0) {
      return;
    }

    let deliverableType = new DeliverableCategory();
    deliverableType.name = "Actas"
    deliverableCategoryData.push(deliverableType);

    deliverableType = new DeliverableCategory();
    deliverableType.name = "Formularios"
    deliverableCategoryData.push(deliverableType);

    deliverableType = new DeliverableCategory();
    deliverableType.name = "Cartas"
    deliverableCategoryData.push(deliverableType);

    await this.deliverableCategoryRepository.save(deliverableCategoryData);
    console.info('Seeded deliverable type Data');
  }
}
