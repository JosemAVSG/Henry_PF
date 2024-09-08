import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Deliverable } from '../../entities/deliverable.entity';
import { DeliverableType } from '../../entities/deliverableType.entity';
import { DeliverableCategory } from '../../entities/deliverableCategory.entity';

@Injectable()
export class DeliverableSeeder {
  constructor(
    @InjectRepository(Deliverable)
    private readonly deliverableRepository: Repository<Deliverable>,
    @InjectRepository(DeliverableType)
    private readonly deliverableTypeRepository: Repository<DeliverableType>,
    @InjectRepository(DeliverableCategory)
    private readonly deliverableCategoryRepository: Repository<DeliverableCategory>,
  ) {}

  async seedDeliverable() {
    const deliverableData = [
      { id: 1, name: "Folder A", parentId: 2, isFolder: true, deliverableTypeId: 1, deliverableCategoryId: 2 },
      { id: 2, name: "Folder B", parentId: 3, isFolder: true, deliverableTypeId: 1, deliverableCategoryId: 1 },
      { id: 3, name: "Folder C", parentId: 4, isFolder: true, deliverableTypeId: 1, deliverableCategoryId: 3 },
      { id: 4, name: "Folder D", parentId: null, isFolder: true, deliverableTypeId: 1, deliverableCategoryId: 3 },
      { id: 5, name: "File X", parentId: 1, isFolder: false, deliverableTypeId: 4, deliverableCategoryId: 1  },
      { id: 6, name: "File 1", parentId: 1, isFolder: false, deliverableTypeId: 5, deliverableCategoryId: 2  },
      { id: 7, name: "File 2", parentId: 2, isFolder: false, deliverableTypeId: 4, deliverableCategoryId: 2  },
      { id: 8, name: "File 3", parentId: 3, isFolder: false, deliverableTypeId: 3, deliverableCategoryId: 3  },
      { id: 9, name: "Folder F", parentId: 4, isFolder: true, deliverableTypeId: 1, deliverableCategoryId: 1  }
    ];
  
    if (await this.deliverableRepository.count() > 0) {
      console.log('Deliverables already has data.');
      return;
    }
  
    for (const item of deliverableData) {
      const deliverable = this.deliverableRepository.create({
        ...item,
        path: item.name.toLowerCase().replace(/\s+/g, '_'), // Ejemplo de cómo generar la ruta basada en el nombre
        createdAt: new Date(),
        updatedAt: new Date(),
        statusId: 1, 
        deliverableType: await this.deliverableTypeRepository.findOne({ where: { id: item.deliverableTypeId } }), 
        deliverableCategory: await this.deliverableCategoryRepository.findOne({ where: { id: item.deliverableCategoryId } }), 
      });
  
      await this.deliverableRepository.save(deliverable);
    }
  
    console.log('Deliverables seeded successfully.');
  }
  
}
