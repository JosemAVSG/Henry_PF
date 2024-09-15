import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateDeliverableDto } from './dto/create-deliverable.dto';
import { UpdateDeliverableDto } from './dto/update-deliverable.dto';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ILike, Repository } from 'typeorm';
import { Deliverable } from '../../entities/deliverable.entity';
import { DeliverableType } from '../../entities/deliverableType.entity';
import { google } from 'googleapis';
import { PermissionType } from '../../entities/permissionType.entity';
import { Permission } from '../../entities/permission.entity';
import { UserEntity } from 'src/entities/user.entity';
import { join } from 'path';
import { existsSync,createWriteStream } from 'fs';
import { Response } from 'express';
import { pipeline } from 'stream';
import { promisify } from 'util';
@Injectable()
export class DeliverablesService {
  constructor(
    @InjectDataSource() private dataSource: DataSource,

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
    isFolder: boolean,
  ) {
    const { name, path, deliverableTypeId, deliverableCategoryId, parentId } = createDeliverableDto;
    
    const deliverableType = await this.deliverableTypeRepository.findOneBy({
      id: deliverableTypeId,
    });

    if (!deliverableType) {
      throw new Error('Deliverable Type not found');
    }

    const deliverableCategory = await this.deliverableTypeRepository.findOneBy({
      id: deliverableCategoryId,
    });

    if (!deliverableType) {
      throw new Error('Deliverable Categpry not found');
    }

    const deliverableData: any = {
      name,
      path,
      deliverableType,
      deliverableCategory,
      isFolder,
    };
    
    //const deliverable = this.deliverableRepository.create(deliverableData);

    // Solo añadir `parentId` si no es `null` o `undefined`
    if (parentId != null && parentId.toString() != "" && parentId != undefined) {
      deliverableData.parentId = parentId;
    }
   
    const deliveryResult = await this.deliverableRepository.save(deliverableData);

    let ownerPermissionTypeId = 1;
    let deliverableId = deliveryResult.id;

    const permissionObject = this.permissionsRepository.create({
      userId: userId.toString(),
      user: await this.userRepository.findOneBy({ id: Number(userId) }),

      permissionTypeId: ownerPermissionTypeId,
      permissionType: await this.permissionTypeRepository.findOneBy({
        id: Number(ownerPermissionTypeId),
      }),

      deliverable: await this.deliverableRepository.findOneBy({
        id: deliverableId,
      }),
      deliverableId: deliverableId.toString(),
    });

    const permissionResult = await this.permissionsRepository.save(permissionObject);

    return { deliverableId, permissionResult };
  }

  async findAll(
    userId: number = null,
    page: number = 1,
    pageSize: number = 10,
    parentId: number = null,
    orderBy: 'name' | 'date' | 'category',
    isAdmin: boolean,
    orderOrientation: 'ASC' | 'DESC' = 'DESC',
    deliverableIds: number[] = null,
    companyId: number = null,
  ): Promise<Deliverable[]> {
    const offset = (page - 1) * pageSize;

    // Crear la subconsulta
    const queryBuilder = this.deliverableRepository
    .createQueryBuilder('deliverable')
    .leftJoin('deliverable.deliverableType', 'deliverableType')
    .leftJoin('deliverable.permissions', 'permission')
    .leftJoin('permission.permissionType', 'permissionType')
    .leftJoin('permission.user', 'user')
    .leftJoin('user.company', 'company')
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
    );

    queryBuilder.where('deliverable.statusId = 1');

    if (!isAdmin && userId) {
      queryBuilder.andWhere('permission.userId = :userId', { userId });
    }

    if (companyId) {
      queryBuilder.andWhere('company.id = :companyId', { companyId });
    }

    if (parentId) {
      queryBuilder.andWhere('deliverable.parentId = :parentId', { parentId });
    } else {
      // Entregables a excluir si no se especifica una carpeta padre. Mostrando los entregables de mayor jerarquía a los que se tiene acceso.
      if(deliverableIds){
        queryBuilder.andWhere('(deliverable.parentId IS NULL OR deliverable.parentId NOT IN (:...deliverableIds) )', { deliverableIds })
      }
    }

    const queryBuilder2 = this.dataSource
      .createQueryBuilder()
      .select('*')
      .from('(' + queryBuilder.getQuery() + ')', 'subquery')
      .setParameters(queryBuilder.getParameters()); // Pasar parámetros de la subconsulta

    // Aplicar filtros y ordenamientos adicionales
    if (orderBy) {
      switch (orderBy) {
        case 'date':
          queryBuilder2.orderBy('"lastDate"', orderOrientation);
          break;
        case 'name':
          queryBuilder2.orderBy('"deliverableName"', orderOrientation);
          break;
        case 'category':
          queryBuilder2.orderBy('"deliverableCategory"', orderOrientation);
          break;
        default:
          queryBuilder2.orderBy('"lastDate"', orderOrientation);
          break;
      }
    }

    if (parentId) {
      queryBuilder2.limit(pageSize);
      queryBuilder2.offset(offset);
    } else {
      // Entregables a excluir si no se especifica una carpeta padre. Mostrando los entregables de mayor jerarquía a los que se tiene acceso.
      if (deliverableIds) {
        queryBuilder2.limit(pageSize);
        queryBuilder2.offset(offset);
      }
    }

    const result = await queryBuilder2.getRawMany();

    return result;
  }

  async getParentFolders(deliverableId: number): Promise<string> {
    // Buscar el deliverable por ID
    const deliverable = await this.deliverableRepository.findOneBy({
      id: deliverableId,
    });

    if (!deliverable) {
      throw new Error(`Deliverable with ID ${deliverableId} not found`);
    }

    // Inicializar la ruta actual con el nombre del deliverable
    let currentPath = deliverable.name;

    // Si hay un parentId, realizar la llamada recursiva para obtener la ruta del padre
    if (deliverable.parentId) {
      const parentPath = await this.getParentFolders(deliverable.parentId);
      currentPath = parentPath + '/' + currentPath;
    }

    return currentPath;
  }

  async updateDeliverable(id: number, updateDeliverableDto: UpdateDeliverableDto, isFolder: boolean) {
    
    const { name, path, deliverableTypeId, deliverableCategoryId, parentId } = updateDeliverableDto;
    
    const deliverableType = await this.deliverableTypeRepository.findOneBy({
      id: deliverableTypeId,
    });

    if (!deliverableType) {
      throw new Error('Deliverable Type not found');
    }

    const deliverableCategory = await this.deliverableTypeRepository.findOneBy({
      id: deliverableCategoryId,
    });

    if (!deliverableType) {
      throw new Error('Deliverable Categpry not found');
    }

    const deliverableData: any = {
      name,
      path,
      deliverableType,
      deliverableCategory,
      isFolder,
    };
    
    //const deliverable = this.deliverableRepository.create(deliverableData);

    // Solo añadir `parentId` si no es `null` o `undefined`
    if (parentId != null && parentId.toString() != "" && parentId != undefined) {
      deliverableData.parentId = parentId;
    }

    const result = await this.deliverableRepository.update(id, deliverableData);
    
    return result;

  }

  async remove(id: number) {
    const result = await this.deliverableRepository.update(id, { statusId: 2 });
    if (result.affected === 0) {
      throw new NotFoundException(`Deliverable with ID ${id} not found`);
    }

    return { message: 'Deliverable status updated' };
  }


  async getPermissions(deliverableId: number) {
    const data = await this.permissionsRepository.find({
      relations: { user: true, permissionType: true },
      where: { deliverable: { id: deliverableId } },
      select: { permissionType: { name: true, id: true } },
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

    await this.permissionsRepository.remove(permissions);

    const result = newPermission.map(async (item) => {
      const permissionObject = this.permissionsRepository.create({
        userId: item.userId,
        permissionTypeId: item.permissionTypeId,
        user: await this.userRepository.findOneBy({ id: Number(item.userId) }),
        permissionType: await this.permissionTypeRepository.findOneBy({
          id: Number(item.permissionTypeId),
        }),
        deliverable: await this.deliverableRepository.findOneBy({
          id: deliverableId,
        }),
        deliverableId: deliverableId.toString(),
      });

      return await this.permissionsRepository.save(permissionObject);
    });

    return await Promise.all(result);
  }

  async getByDeliverableID(deliverableId) {
    return await this.deliverableRepository.find({
      relations: {
        permissions: true,
        deliverableType: true,
        deliverableCategory: true,
      },
      where: { id: deliverableId },
    });
  }

  async getByName(name: string, userId: string) {
    const user = await this.userRepository.findOneBy({ id: Number(userId) });
    if (user.isAdmin) {
      const result = await this.deliverableRepository.find({
        where: { name: ILike(`%${name}%`) },
        relations: {
          permissions: { permissionType: true },
          deliverableType: true,
          deliverableCategory: true,
        },
        select: {
          id: true,
          parentId: true,
          name: true,
          isFolder: true,
          path: true,
          deliverableType: { name: true },
          deliverableCategory: { name: true },
          permissions: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      console.log(result);
      if (!result || result.length === 0) {
        throw new NotFoundException('No deliverables found');
      }

      return result;
    } else {
      const data = await this.deliverableRepository.find({
        where: {
          name: ILike(`%${name}%`),
          permissions: { user: { id: Number(userId) } },
        },
        relations: {
          permissions: { permissionType: true },
          deliverableType: true,
          deliverableCategory: true,
        },
        select: {
          id: true,
          parentId: true,
          name: true,
          isFolder: true,
          path: true,
          deliverableType: { name: true },
          deliverableCategory: { name: true },
          permissions: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      console.log(data);

      if (!data)
        throw new NotFoundException(`Deliverable with name ${name} not found`);
      return data;
    }
  }

  async getDownloadDeliverableCopy(userId: number,deliverableId: number,) {

    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new Error('User does not exist');

    const deliverableCopy = await this.deliverableRepository.findOne({
      where: { id: deliverableId },
    });
    console.log(deliverableCopy.path);

    if (!deliverableCopy) throw new NotFoundException('Deliverable not found');

    const filePath = join(process.cwd(), deliverableCopy.path);
    console.log(filePath);

    if (!existsSync(deliverableCopy.path)) {
      throw new NotFoundException('Invoice file not found');
    }
    const fileExtension = filePath.split('.').pop();
    let contentType: string;

    switch (fileExtension) {
      case 'pdf':
        contentType = 'application/pdf';
        break;
      case 'jpg':
      case 'jpeg':
        contentType = 'image/jpeg';
        break;
      case 'png':
        contentType = 'image/png';
        break;
      case 'txt':
        contentType = 'text/plain';
        break;
      default:
        contentType = 'application/octet-stream'; // Tipo genérico para otros archivos
    }

    return { contentType, filePath, deliverableCopy, fileExtension };
  }

  async uploadGoogleFile (userId: number, deliverableId: number, fileName:string,res : Response) {

    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('User does not exist');


    const fileUrl = `https://drive.google.com/uc?export=download&id=${deliverableId}`;
    const filePath = join(process.cwd(), 'uploads/deliverables', fileName); 
  
    try {
      // Descargar el archivo desde Google Drive
      const response = await fetch(fileUrl, {
        method: 'GET',
      })

      if (!response.ok) {
        throw new BadRequestException('Error al descargar el archivo');
      }
        // Crear un stream de escritura para el archivo en el servidor
        const fileStream = createWriteStream(filePath);

        // Promisify pipeline para trabajar con async/await
        const streamPipeline = promisify(pipeline);
  
        // Usar pipeline para manejar el stream de forma segura
        await streamPipeline(response.body, fileStream);
  
        console.log(`Archivo guardado en: ${filePath}`);
        const deliverableObject = {
          name: fileName,
          path: filePath,
          deliverableCategoryId: 1,
          deliverableTypeId: 2,
          parentId: null
        }
        const deliverable = await this.create(deliverableObject,userId,false);
        console.log(`Deliverable: ${deliverable}`);
        
        res.status(200).json({ message: 'Archivo guardado exitosamente.', filePath });

    } catch (error) {
      console.error('Error al descargar o guardar el archivo:', error);
      throw new BadRequestException('Error al descargar o guardar el archivo');
    }

  }

}
