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
      { id: 1, name: "Folder A", parentId: 2, isFolder: true },
      { id: 2, name: "Folder B", parentId: 3, isFolder: true },
      { id: 3, name: "Folder C", parentId: 4, isFolder: true },
      { id: 4, name: "Folder D", parentId: 5, isFolder: true },
      { id: 6, name: "File 1", parentId: 1, isFolder: false },
      { id: 7, name: "File 2", parentId: 2, isFolder: false },
      { id: 8, name: "File 3", parentId: 3, isFolder: false },
      { id: 9, name: "Folder F", parentId: 4, isFolder: true }
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
        statusId: 1, // Valor predeterminado, cambiar si es necesario
        deliverableType: await this.deliverableTypeRepository.findOne({ where: { id: 1 } }), // Asigna un tipo de deliverable por defecto, modificar según necesidad
        deliverableCategory: await this.deliverableCategoryRepository.findOne({ where: { id: 1 } }), // Asigna una categoría por defecto, modificar según necesidad
      });
  
      await this.deliverableRepository.save(deliverable);
    }
  
    console.log('Deliverables seeded successfully.');
  }
  
}
