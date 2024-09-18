import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  Req,
  BadRequestException,
  Put,
  Res,
  HttpException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join, resolve, extname } from 'path';
import * as fs from 'fs-extra';
import * as path from 'path';
import { DeliverablesService } from './deliverables.service';
import { CreateDeliverableDto } from './dto/create-deliverable.dto';
import { UpdateDeliverableDto } from './dto/update-deliverable.dto';
import { AuthGuard } from '../../guards/auth.guards';
import { Permission } from '../../entities/permission.entity';
import { Request } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { cwd } from 'process';
import { Response } from 'express';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateNotificationDto } from '../notifications/create-notification.dto';
import { NotificationsGateway } from '../../websockets/notifications/notifications.gateway';

@ApiTags('deliverables')
@Controller('deliverables')
export class DeliverablesController {
  constructor(
    private readonly deliverablesService: DeliverablesService,
    private readonly notificationsService: NotificationsService,
    private readonly notificationsGateway: NotificationsGateway
  ) {}

  @Post('file')
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: async (req, file, callback) => {
          const uploadPath = './uploads/deliverables/temporal';

          await fs.ensureDir(uploadPath); // Crea el directorio si no existe
          callback(null, uploadPath);
        },
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `${uniqueSuffix}${ext}`;
          callback(null, filename);
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 }, // Límite de tamaño del archivo: 10 MB
    }),
  )
  async createDeliverableFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() createDeliverableDto: CreateDeliverableDto,
    @Req() req: Request,
  ) {
    try {
      let userId = req?.user?.id || 1;
      let user = req?.user;

      let isFolder = false;
      
      const temporalPath = join(cwd(),'./uploads/deliverables/temporal/', file.filename);
      
      const parentFolders = await this.deliverablesService.getParentFolders(createDeliverableDto.parentId);
      const newRelativePath = join('uploads/deliverables', parentFolders, file.filename);

      const newPath = join(cwd(), newRelativePath);
      
      createDeliverableDto.path = newRelativePath;

      fs.rename(temporalPath, newPath)
      .then(() => {
        console.log('File moved successfully!');
      })
      .catch(err => {
        console.error('Error moving file:', err);
      });

      
      const deliverableResult = await this.deliverablesService.create(
        createDeliverableDto,
        userId,
        isFolder,
      );

      if(deliverableResult) {
        const createNotificationDto = new CreateNotificationDto();
        createNotificationDto.deliverableId = deliverableResult.deliverableId;
        createNotificationDto.notificationTypeId = 8;
        createNotificationDto.triggerUserId = userId;

        this.notificationsService.createNotification(createNotificationDto)
      }  

      // canal para el administrador
      const canalAdmin = 'Admin';

      // Emitir notificación al administrador
      this.notificationsGateway.emitNotificationToUser(canalAdmin, {
        note: '',
        notificationType: {name:'cargar el entregable'}, 
        impactedUser: null,
        triggerUser: { Names: user.names, LastName: user.lastName},
        deliverable: { 
          name: createDeliverableDto.name, 
          path: createDeliverableDto.path 
        },
      });

      return true
    } catch (error) {
      throw new BadRequestException(error);
    }
  }


  @Put('file/:deliverableId')
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: async (req, file, callback) => {
          const uploadPath = './uploads/deliverables/temporal';

          await fs.ensureDir(uploadPath); // Crea el directorio si no existe
          callback(null, uploadPath);
        },
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `${uniqueSuffix}${ext}`;
          callback(null, filename);
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 }, // Límite de tamaño del archivo: 10 MB
    }),
  )
  async updateDeliverableFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() createDeliverableDto: CreateDeliverableDto,
    @Param('deliverableId') deliverableId: number,
    @Req() req: Request,
  ) {
    try {
      let userId = req?.user?.id || 1;
      let user = req?.user;

      createDeliverableDto.path = file ? file.path : null;
      const isFolder = false;

      // Si existe el archivo, procesar
      if (file) {
        const temporalPath = join(cwd(), './uploads/deliverables/temporal/', file.filename);
        
        const parentFolders = await this.deliverablesService.getParentFolders(createDeliverableDto.parentId);
        const newRelativePath = join('uploads/deliverables', parentFolders, file.filename);
        const newPath = join(cwd(), newRelativePath);
        
        createDeliverableDto.path = newRelativePath;
  
        await fs.rename(temporalPath, newPath)
          .then(() => {
            console.log('File moved successfully!');
          })
          .catch(err => {
            console.error('Error moving file:', err);
          });
  
        // Eliminar el archivo anterior
        const oldFileResult = await this.deliverablesService.getByDeliverableID(deliverableId);
        const oldFileRelativePath = oldFileResult[0]?.path;
        if (oldFileRelativePath) {
          const oldFilePath = join(cwd(), 'uploads/deliverables', oldFileRelativePath);
          await fs.unlink(oldFilePath, (err) => {
            if (err) {
              console.error('Error deleting old file:', err);
            } else {
              console.log('Old file deleted successfully!');
            }
          });
        }
      } else {
        // Si no se recibe archivo, conservar la ruta existente
        const existingDeliverable = await this.deliverablesService.getByDeliverableID(deliverableId);
        createDeliverableDto.path = existingDeliverable[0]?.path || null;
      }

      //actualizar información en la base de datos
      const deliverableResult = this.deliverablesService.updateDeliverable(deliverableId, createDeliverableDto, isFolder);

      if(deliverableResult) {
        const createNotificationDto = new CreateNotificationDto();
        createNotificationDto.deliverableId = deliverableId;
        createNotificationDto.notificationTypeId = 10;
        createNotificationDto.triggerUserId = userId;

        this.notificationsService.createNotification(createNotificationDto)
      }
      
      // canal para el administrador
      const canalAdmin = 'Admin';

      // Emitir notificación al administrador
      this.notificationsGateway.emitNotificationToUser(canalAdmin, {
        note: '',
        notificationType: {name:'editar el entregable'}, 
        impactedUser: null,
        triggerUser: { Names: user.names, LastName: user.lastName},
        deliverable: { 
          name: createDeliverableDto.name, 
          path: createDeliverableDto.path 
        },
      });

      return deliverableResult;

    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @Post('folder')
  @UseGuards(AuthGuard)
  async createFolderDeliverable(
    @Body() createDeliverableDto: CreateDeliverableDto,
    @Req() req: Request,
  ) {
    try {
      let userId = req?.user?.id || 1;
      let user = req?.user;
      
      if (!userId) {
        throw new BadRequestException('User ID is missing');
      }

      const folderName = createDeliverableDto.name;
      //const relativePath = createDeliverableDto.path;

      let relativePath = ""

      if(createDeliverableDto.parentId){
        relativePath = await this.deliverablesService.getParentFolders(createDeliverableDto.parentId);

        console.log(relativePath);
      }

      const isFolder = true;

      // Construir la ruta completa a la carpeta uploads, que está al mismo nivel que src y dist
      const folderPath = resolve(
        process.cwd(), // Carpeta raíz del proyecto
        'uploads/deliverables',
        relativePath,
        folderName,
      );
      console.log("folderPath")
      console.log(folderPath)


      try {
        const folderExists = await fs.stat(folderPath).catch(() => false);

        if (!folderExists) {
          createDeliverableDto.path = join('uploads/deliverables', relativePath ,   folderName)

          await fs.mkdir(folderPath, { recursive: true });
          
          const deliverableResult = await this.deliverablesService.create(
            createDeliverableDto,
            userId,
            isFolder,
          );

          if(deliverableResult) {
            const createNotificationDto = new CreateNotificationDto();
            createNotificationDto.deliverableId = deliverableResult.deliverableId;
            createNotificationDto.notificationTypeId = 8;
            createNotificationDto.triggerUserId = userId;
    
            this.notificationsService.createNotification(createNotificationDto)
          }  

          // canal para el administrador
          const canalAdmin = 'Admin';

          // Emitir notificación al administrador
          this.notificationsGateway.emitNotificationToUser(canalAdmin, {
            note: '',
            notificationType: {name:'cargar el entregable'}, 
            impactedUser: null,
            triggerUser: { Names: user.names, LastName: user.lastName},
            deliverable: { 
              name: createDeliverableDto.name, 
              path: createDeliverableDto.path 
            },
          });

          return {
            message: `Folder ${folderName} created successfully`,
            folderPath,
          };
        } else {
          throw new ConflictException(`Folder ${folderName} already exists`);
        }
      } catch (error) {
        throw new BadRequestException(`Error creating folder: ${error.message}`);
      }
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Put('folder/:deliverableId')
  @UseGuards(AuthGuard)
  async updateFolderDeliverable(
    @Body() createDeliverableDto: CreateDeliverableDto,
    @Param('deliverableId') deliverableId: number,
    @Req() req: Request,
  ) {
    const isFolder = true;

    try {
      let userId = req?.user?.id || 1;
      let user = req?.user;
     
      if (!userId) {
        throw new BadRequestException('User ID is missing');
      }

      const newFolderName = createDeliverableDto.name;
      //const relativePath = createDeliverableDto.path;

      let relativePath = ""

      if(createDeliverableDto.parentId){
        relativePath = await this.deliverablesService.getParentFolders(createDeliverableDto.parentId);

        console.log(relativePath);
      }

      const oldFolderNameResult = await this.deliverablesService.getByDeliverableID(deliverableId);
      const oldFolderName = oldFolderNameResult[0].name;

      console.log("oldFolderName")
      console.log(oldFolderName)

      // Ruta actual de la carpeta que deseas renombrar
      const oldPath = path.join(process.cwd(), 'uploads/deliverables', relativePath,
      oldFolderName);

      // Construir la ruta completa a la carpeta uploads, que está al mismo nivel que src y dist
      const newFolderPath = resolve(
        process.cwd(), // Carpeta raíz del proyecto
        'uploads/deliverables',
        relativePath,
        newFolderName,
      );

      console.log("newFolderPath")
      console.log(newFolderPath)

      createDeliverableDto.path = join('uploads/deliverables', relativePath ,   newFolderName)

      fs.rename(oldPath, newFolderPath, (err) => {
        if (err) {
          console.error('Error al renombrar la carpeta:', err);
        } else {
          console.log('Carpeta renombrada con éxito');
        }
      });

      const deliverableResult = this.deliverablesService.updateDeliverable(deliverableId, createDeliverableDto, isFolder);

      if(deliverableResult) {
        const createNotificationDto = new CreateNotificationDto();
        createNotificationDto.deliverableId = deliverableId;
        createNotificationDto.notificationTypeId = 10;
        createNotificationDto.triggerUserId = userId;

        this.notificationsService.createNotification(createNotificationDto)
      }

      // canal para el administrador
      const canalAdmin = 'Admin';

      // Emitir notificación al administrador
      this.notificationsGateway.emitNotificationToUser(canalAdmin, {
        note: '',
        notificationType: {name:'editar el entregable'}, 
        impactedUser: null,
        triggerUser: { Names: user.names, LastName: user.lastName},
        deliverable: { 
          name: createDeliverableDto.name, 
          path: createDeliverableDto.path 
        },
      });

      return deliverableResult 
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @Post('link')
  @UseGuards(AuthGuard)
  async createLinkDeliverable(
    @Body() createDeliverableDto: CreateDeliverableDto,
    @Req() req: Request,
  ) {
    try {
      let userId = req?.user?.id || 1;
      let user = req?.user;
      const isFolder = false;
  
      // Intentamos crear el deliverable con los datos proporcionados
      const deliverableResult = await this.deliverablesService.create(
        createDeliverableDto,
        userId,
        isFolder,
      );

      if(deliverableResult) {
        const createNotificationDto = new CreateNotificationDto();
        createNotificationDto.deliverableId = deliverableResult.deliverableId;
        createNotificationDto.notificationTypeId = 8;
        createNotificationDto.triggerUserId = userId;

        this.notificationsService.createNotification(createNotificationDto)
      }

      // canal para el administrador
      const canalAdmin = 'Admin';

      // Emitir notificación al administrador
      this.notificationsGateway.emitNotificationToUser(canalAdmin, {
        note: '',
        notificationType: {name:'cargar el entregable'}, 
        impactedUser: null,
        triggerUser: { Names: user.names, LastName: user.lastName},
        deliverable: { 
          name: createDeliverableDto.name, 
          path: createDeliverableDto.path 
        },
      });

      return {
        message: `Link created successfully`,
      };
  
    } catch (error) {
      // Si ocurre un error en la creación, lo capturamos y lanzamos una excepción adecuada
  
      // En caso de que el error sea debido a datos de entrada no válidos
      if (error instanceof BadRequestException) {
        throw new BadRequestException('Invalid data provided for creating deliverable');
      }
  
      // Para cualquier otro tipo de error no previsto, retornamos una excepción genérica
      throw new InternalServerErrorException('An unexpected error occurred while creating the deliverable');
    }
  }

  @Put('link/:deliverableId')
  @UseGuards(AuthGuard)
  async updateLinkDeliverable(
    @Body() createDeliverableDto: CreateDeliverableDto,
    @Param('deliverableId') deliverableId: number,
    @Req() req: Request,
  ){
    const isFolder = false;

    try {
      let userId = req?.user?.id || 1;
      let user = req?.user

      createDeliverableDto.deliverableTypeId = 2;
      if (!userId) {
        throw new BadRequestException('User ID is missing');
      }

      const deliverableResult = await this.deliverablesService.updateDeliverable(deliverableId, createDeliverableDto, isFolder);

      if(deliverableResult) {
        const createNotificationDto = new CreateNotificationDto();
        createNotificationDto.deliverableId = deliverableId;
        createNotificationDto.notificationTypeId = 10;
        createNotificationDto.triggerUserId = userId;

        this.notificationsService.createNotification(createNotificationDto)
      }

      // canal para el administrador
      const canalAdmin = 'Admin';

      // Emitir notificación al administrador
      this.notificationsGateway.emitNotificationToUser(canalAdmin, {
        note: '',
        notificationType: {name:'editar el entregable'}, 
        impactedUser: null,
        triggerUser: { Names: user.names, LastName: user.lastName},
        deliverable: { 
          name: createDeliverableDto.name, 
          path: createDeliverableDto.path 
        },
      });

    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @Get('user/:userId')
  @UseGuards(AuthGuard)
  async findAll(
    @Param('userId') userId: number,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('parentId') parentId: number = null,
    @Query('orderBy') orderBy: 'name' | 'date' | 'category' = 'date',
    @Query('orderOrientation') orderOrientation: 'ASC' | 'DESC' = 'DESC',
    @Query('companyId') companyId: number = null,
    @Req() req: Request,
  ) {
    try {
      const isAdmin =  req.user.isAdmin
      //const isAdmin =  true;
      let result = null;

      const deliverableResult = await this.deliverablesService.findAll(userId, page, limit, parentId, orderBy, isAdmin, orderOrientation, null, companyId);

      //console.log(deliverableResult)
      
      if(parentId){
        return deliverableResult;
      }else{
        const deliverableIds = deliverableResult.map(item => item.id);
        result = await this.deliverablesService.findAll(userId, page, limit, parentId, orderBy, isAdmin, orderOrientation, deliverableIds, companyId);
        return result
      }


    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @Get(':deliverableId')
  getByDeliverableId(@Param('deliverableId') deliverableId: number) {
    try {
      return this.deliverablesService.getByDeliverableID(deliverableId);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }


  @UseGuards(AuthGuard)
  @Get('download/:deliverableId')
  async downloadFile(
    @Param('deliverableId') deliverableId: number,
    @Res() res: Response,
    @Req() req: Request
  ) {

    try {
      const userId = req.user.id;
      const user = req.user;
      
      const data = await this.deliverablesService.getDownloadDeliverableCopy(
        userId,
        deliverableId,
      );

      const { filePath, deliverableCopy, contentType,fileExtension } = data;

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${deliverableCopy.name}.${fileExtension}"`);
      res.download(filePath);

      //Crear notificación en base de datos
      const createNotificationDto = new CreateNotificationDto();
      createNotificationDto.deliverableId = deliverableId;
      createNotificationDto.notificationTypeId = 5;
      createNotificationDto.triggerUserId = userId;

      this.notificationsService.createNotification(createNotificationDto)

      // canal para el administrador
      const canalAdmin = 'Admin';

      // Emitir notificación al administrador
      this.notificationsGateway.emitNotificationToUser(canalAdmin, {
        note: '',
        notificationType: { name:'editar el entregable'}, 
        impactedUser: null,
        triggerUser: { Names: user.names, LastName: user.lastName},
        deliverable: { 
          name: deliverableCopy.name, 
          path: filePath
        },
      });

    } catch (error) {
      throw new BadRequestException(error);
    }
  }


  @Get('file/:name')
  @UseGuards(AuthGuard)
  async getByName(@Param('name') name: string, @Req() req: Request) {
    try {
      const userId = req.user.id;
      return this.deliverablesService.getByName(name,userId);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }



  @Delete(':id')
  remove(@Param('id') id: string) {
    try {
      return this.deliverablesService.remove(+id);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @Get('preview/:fileId')
  async getPreview(@Param('fileId') fileId: string): Promise<string> {
    try {
      return this.deliverablesService.getFilePreview(fileId);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }


  @Get('permision/:deliverableId')
  async getPermision(
    @Param('deliverableId') deliverableId: number,
  ): Promise<Partial<Permission>[]> {
    try {
      return this.deliverablesService.getPermissions(deliverableId);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @UseGuards(AuthGuard)
  @Put('permision/:deliverableId')
  async createPermision(
    @Param('deliverableId') deliverableId: number,
    @Body() permission: any,
    @Req() req: Request
  ): Promise<Permission[]> {
    try {
      const userId = req.user.id;
      return this.deliverablesService.updatePermissions(
        deliverableId,
        permission,
        userId
      );
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @UseGuards(AuthGuard)
  @Post('uploadGoogleFile')
  async uploadGoogleFile(@Body() body: any,
    @Req() req: Request,
    @Res() res: Response
  )
  {
    try {
      const userId = req.user.id;
      const {fileName,deliverableId} = body;
      
      return this.deliverablesService.uploadGoogleFile(userId,deliverableId,fileName,res)
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
