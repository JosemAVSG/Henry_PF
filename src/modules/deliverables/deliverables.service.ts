import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDeliverableDto } from './dto/create-deliverable.dto';
import { UpdateDeliverableDto } from './dto/update-deliverable.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Deliverable } from '../../entities/deliverable.entity';
import { DeliverableType } from '../../entities/deliverableType.entity';
import { google } from 'googleapis';
import { PermissionType } from '../../entities/permissionType.entity';
import { Permission } from '../../entities/permission.entity';
import { UserEntity } from 'src/entities/user.entity';
@Injectable()
export class DeliverablesService {
  constructor(
    @InjectRepository(Deliverable)
    private deliverableRepository: Repository<Deliverable>,

    @InjectRepository(DeliverableType)
    private deliverableTypeRepository: Repository<DeliverableType>,

    @InjectRepository(PermissionType)
    private permissionTypeRepository: Repository<PermissionType>,

    @InjectRepository(Permission)
    private permissionsRepository: Repository<Permission>,

    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  private drive = google.drive({
    version: 'v3',
    auth: process.env.GOOGLE_DRIVE_TOKEN,
  });

  async getFilePreview(fileId: string) {
    const response = await this.drive.files.get({
      fileId,
      fields: 'webViewLink, webContentLink',
      supportsTeamDrives: true, // TODO: check if this is needed
    });
    console.log(response);

    return response.data.webViewLink; // esto es una url para ver el archivo
  }

  async create(
    createDeliverableDto: CreateDeliverableDto, 
    userId: number,
    isFolder: boolean 
  ) {
    const {name, path, deliverableTypeId, parentId} = createDeliverableDto

    const deliverableType = await this.deliverableTypeRepository.findOneBy({
      id: deliverableTypeId,
    });

    if (!deliverableType) {
      throw new Error('DeliverableType not found');
    }

    const deliverable = this.deliverableRepository.create({
      name,
      path,
      deliverableType,
      isFolder,
      parentId,
    })
    
    const deliveryResult = await this.deliverableRepository.save(deliverable);

    let ownerPermissionTypeId = 1;
    let deliverableId = deliveryResult.id;

    const permissionObject =  this.permissionsRepository.create({
      userId: userId.toString(),
      user: await this.userRepository.findOneBy({id: Number(userId)}),

      permissionTypeId: ownerPermissionTypeId,
      permissionType: await this.permissionTypeRepository.findOneBy(
          {id: Number(ownerPermissionTypeId)}
      ),
      
      deliverable: await this.deliverableRepository.findOneBy(
        {id: deliverableId}
      ),
      deliverableId: deliverableId.toString(),
    })

    const permissionResult = await this.permissionsRepository.save(permissionObject)

    return permissionResult;
  }

  async findAll(
    userId: number = null,
    page: number = 1,
    pageSize: number = 10,
    parentId: number = null,
    orderBy:  'name' | 'date' | 'category',
    isAdmin: boolean,
    orderOrientation: 'ASC' | 'DESC' = 'DESC',
  ): Promise<Deliverable[]> {
    const offset = (page - 1) * pageSize;
    
    const queryBuilder = this.deliverableRepository
      .createQueryBuilder('deliverable')
      .leftJoin('deliverable.deliverableType', 'deliverableType')
      .leftJoin('deliverable.permissions', 'permission')
      .leftJoin('permission.permissionType', 'permissionType')
      .leftJoin('deliverable.deliverableCategory', 'deliverableCategory')
      .select([
        'deliverable.id AS "id"',
        'deliverable.parentId AS "parentId"',
        'deliverable.name AS "deliverableName"',
        'deliverable.isFolder AS "deliverableIsFolder"',
        'deliverable.path AS "deliverablePath"',
        'deliverableType.name AS "deliverableType"',
        'deliverableCategory.name AS "deliverableCategory"',
        `ARRAY_AGG(permissionType.name) AS "permissionTypes"`,
        `TO_CHAR(COALESCE(deliverable.updatedAt, deliverable.createdAt), 'DD-MM-YYYY') AS "lastDate"`,
      ])
      .groupBy(
        'deliverable.id, deliverable.parentId, deliverable.name, deliverable.isFolder, deliverable.path, deliverableType.name, deliverableCategory.name',
      )
      .orderBy('"lastDate"', 'DESC')
      .limit(pageSize)
      .offset(offset);

    if (orderBy) {
      switch (orderBy) {
        case null:
          queryBuilder.orderBy('"lastDate"', orderOrientation);
          break;
        case 'date':
          queryBuilder.orderBy('"lastDate"', orderOrientation);
          break;
        case 'name':
          queryBuilder.orderBy('"deliverableName"', orderOrientation);
          break;
        case 'category':
          queryBuilder.orderBy('"deliverableCategory"', orderOrientation);
          break;
      }
    }
    queryBuilder.where('deliverable.statusId = 1');

    if (!isAdmin && userId) {
      queryBuilder.andWhere('permission.userId = :userId', { userId });
    }

    if (parentId) {
      queryBuilder.andWhere('deliverable.parentId = :parentId', { parentId });
    }

    let result = await queryBuilder.getRawMany();

    if (!parentId) {
      //console.log(result);
      result = this.findTopLevelItems(result);
    }

    return result;
  }

  findOne(id: number) {
    return `This action returns a #${id} deliverable`;
  }

  update(id: number, updateDeliverableDto: UpdateDeliverableDto) {
    return `This action updates a #${id} deliverable`;
  }

  async remove(id: number) {
    const result = await this.deliverableRepository.update(id, { statusId: 2 });
    if (result.affected === 0) {
      throw new NotFoundException(`Deliverable with ID ${id} not found`);
    }

    return { message: 'Deliverable status updated' };
  }

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
*/

  async getFilesFolder(parentId: number | null) {
    if (parentId === 1)
      return await this.deliverableRepository.find({
        where: { parentId: null },
      });

    if (parentId > 1)
      return await this.deliverableRepository.find({
        where: { parentId: parentId - 1 },
      });
  }

  // Función para encontrar los elementos de nivel superior
  findTopLevelItems(items) {
    const topLevelItems = [];
    const itemMap = new Map();

    // Mapa de id -> item
    items.forEach((item) => {
      itemMap.set(item.id, item);
    });

    // Verifica cada elemento; si su padre no está en la lista, es de nivel superior
    items.forEach((item) => {
      if (!itemMap.has(item.parentId)) {
        topLevelItems.push(item);
      }
    });

    return topLevelItems;
  }

  async getPermissions(deliverableId: number) {
    const data = await this.permissionsRepository.find({
      relations: { user: true, permissionType: true },
      where: { deliverable: { id: deliverableId }, },
      select: { permissionType:{name: true, id: true} },
    });
    
    const permissions = data.map((item) => {
    
      return {
        userId: item.userId,
        permissionType: item.permissionType,
      };
    });

    return permissions;
  }

  async updatePermissions(
    deliverableId: number,
    newPermission: Permission[],
  ): Promise<Permission[]> {
    const permissions = await this.permissionsRepository.find({
      relations: { user: true, permissionType: true },
      where: { deliverable: { id: deliverableId } },
    });
    if (!permissions) {
      return await this.permissionsRepository.save(newPermission);
    }

    await this.permissionsRepository.remove(permissions)

    const result = newPermission.map(async (item) => {

      const permissionObject =  this.permissionsRepository.create({
        userId: item.userId,
        permissionTypeId: item.permissionTypeId,
        user: await this.userRepository.findOneBy({id: Number(item.userId)}),
        permissionType: await this.permissionTypeRepository.findOneBy({id: Number(item.permissionTypeId)}),
        deliverable: await this.deliverableRepository.findOneBy({id: deliverableId}),
        deliverableId: deliverableId.toString(),
      })

       return await this.permissionsRepository.save(permissionObject)

    })

    return await Promise.all(result)

    }
  
  async getByDeliverableID(deliverableId){
    return await this.deliverableRepository.find({
      relations: { permissions: true,
        deliverableType: true, deliverableCategory: true },
      where: { id: deliverableId },
    })

  }

  async getByName(name: string, userId:string) {
    console.log(name);
    
    const data = await this.deliverableRepository.find({
      where: { name: ILike(`%${name}%`),
      permissions:{user: {id: Number(userId)}}
    },
      relations: { permissions:true },
    });
    console.log(data);
    
    if(!data) throw new NotFoundException(`Deliverable with name ${name} not found`)
    return data;
  }
}
