import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Deliverable } from '../../entities/deliverable.entity';

@Injectable()
export class DeliverableSeeder {
  constructor(
    @InjectRepository(Deliverable)
    private readonly deliverableRepository: Repository<Deliverable>,
  ) {}

  async seedDeliverable() {
    const deliverableData = [
      { id: 1, name: "Folder A", parentId: 2, isFolder: true },
      { id: 2, name: "Folder B", parentId: 3, isFolder: true },
      { id: 3, name: "Folder C", parentId: 4, isFolder: true },
      { id: 4, name: "Folder D", parentId: 5, isFolder: true },
      { id: 6, name: "File 1", parentId: 1, isFolder: false },
      { id: 7, name: "File 2", parentId: 2, isFolder: false },
      { id: 8, name: "File 3", parentId: 3, isFolder: false },
      { id: 9, name: "Folder F", parentId: 4, isFolder: true }
    ];

    if(await this.deliverableRepository.count() > 0) {
      console.log('Deliverables already has data.');
      return;
    }

    for (const item of deliverableData) {
      const deliverable = this.deliverableRepository.create(item);
      await this.deliverableRepository.save(deliverable);
    }

    console.log('Deliverables seeded successfully.');
  }
}
