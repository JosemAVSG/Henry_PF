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

  async findAll(userId: number = null, page:number=1, pageSize: number=10): Promise<Deliverable[]> {
    const offset = (page - 1) * pageSize
    
    const queryBuilder = this.deliverableRepository
    .createQueryBuilder('deliverable')
    .leftJoinAndSelect('deliverable.deliverableType', 'deliverableType')
    .leftJoinAndSelect('deliverable.permissions', 'permission')
    .leftJoinAndSelect('permission.permissionType', 'permissionType')
    .select([
      'deliverable.id AS "id"',
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
    const result = await queryBuilder.getRawMany();
    
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
}
