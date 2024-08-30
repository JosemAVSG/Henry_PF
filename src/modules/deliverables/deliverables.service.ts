import { Injectable } from '@nestjs/common';
import { CreateDeliverableDto } from './dto/create-deliverable.dto';
import { UpdateDeliverableDto } from './dto/update-deliverable.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Deliverable } from 'src/entities/deliverable.entity';
import { DeliverableType } from 'src/entities/deliverableType.entity';
import { google } from 'googleapis';
@Injectable()
export class DeliverablesService {
  constructor(
    @InjectRepository(Deliverable)
    private deliverableRepository: Repository<Deliverable>,

    @InjectRepository(DeliverableType)
    private deliverableTypeRepository: Repository<DeliverableType>
  ){}

  private drive = google.drive({ version: 'v3', auth: process.env.GOOGLE_DRIVE_TOKEN });

  async getFilePreview(fileId: string) {
      
      const response = await this.drive.files.get({
          fileId,
          fields: 'webViewLink, webContentLink',
          supportsTeamDrives: true // TODO: check if this is needed  
      });
      console.log(response);
      
      return response.data.webViewLink; // esto es una url para ver el archivo
  }


  async create(createDeliverableDto: CreateDeliverableDto) {
    const {name, path, deliverableTypeId} = createDeliverableDto
    const deliverableType = await this.deliverableTypeRepository.findOneBy({id:deliverableTypeId})

    if(!deliverableType){
      throw new Error('DeliverableType not found')
    }

    const deliverable = this.deliverableRepository.create({
      name,
      path,
      deliverableType
    })
    
    const result = this.deliverableRepository.save(deliverable);
    return result;
  }

  async findAll(
    userId: number = null, 
    page:number=1, 
    pageSize: number=10,
    parentId: number = null
  ): Promise<Deliverable[]> {
    const offset = (page - 1) * pageSize
    
    const queryBuilder = this.deliverableRepository
    .createQueryBuilder('deliverable')
    .leftJoinAndSelect('deliverable.deliverableType', 'deliverableType')
    .leftJoinAndSelect('deliverable.permissions', 'permission')
    .leftJoinAndSelect('permission.permissionType', 'permissionType')
    .select([
      'deliverable.id AS "id"',
      'deliverable.parentId AS "parentId"',
      'deliverable.name AS "deliverableName"',
      'deliverable.path AS "deliverablePath"',
      'deliverableType.name AS "deliverableType"',
      'permissionType.name AS "permissionType"',
      `TO_CHAR(COALESCE(deliverable.updatedAt, deliverable.createdAt), 'DD-MM-YYYY') AS "lastDate"`,
    ])
    .orderBy('"lastDate"', 'DESC')
    .limit(pageSize)
    .offset(offset)
    
    if (userId) {
      queryBuilder.where('permission.userId = :userId', { userId });
    }
    let result = null

    if(parentId){
      queryBuilder.where('deliverable.parentId = :parentId', { parentId });
      result = await queryBuilder.getRawMany();

    }else{
      result = await queryBuilder.getRawMany();
      result = this.findTopLevelItems(result)
    }

    return result;
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


/*
  const data = [
    { id: 1, name: "Folder A", parentId: 2 },
    { id: 2, name: "Folder B", parentId: 3 },
    { id: 3, name: "Folder C", parentId: 4 },
    { id: 4, name: "Folder D", parentId: 5 },
    { id: 6, name: "File 1", parentId: 1 },
    { id: 7, name: "File 2", parentId: 2 },
    { id: 8, name: "File 3", parentId: 3 },
    { id: 9, name: "Folder F", parentId: 4 }
  ];
*/

  // Función para construir el árbol
/*  buildTree(items, parentId = null) {
    return items
      .filter(item => item.parentId === parentId)
      .map(item => {
        const children = buildTree(items, item.id);
        if (children.length) {
          item.children = children;
        }
        return item;
      });
  }
*/  
  // Función para encontrar los elementos de nivel superior
  findTopLevelItems(items) {
    const topLevelItems = [];
    const itemMap = new Map();
  
    // Mapa de id -> item
    items.forEach(item => {
      itemMap.set(item.id, item);
    });
  
    // Verifica cada elemento; si su padre no está en la lista, es de nivel superior
    items.forEach(item => {
      if (!itemMap.has(item.parentId)) {
        topLevelItems.push(item);
      }
    });
  
    return topLevelItems;
  }
  
  // Construye el árbol
  //const tree = buildTree(data);
  
  // Encuentra los elementos de nivel superior
  //const topLevelItems = findTopLevelItems(data);
  
  //console.log("Arbol:", JSON.stringify(tree, null, 2));
  //console.log("Elementos de nivel superior:", JSON.stringify(topLevelItems, null, 2));
  

}
