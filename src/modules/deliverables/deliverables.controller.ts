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
import { Deliverable } from 'src/entities/deliverable.entity';
import { Permission } from 'src/entities/permission.entity';
import { Request } from 'express';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('deliverables')
@Controller('deliverables')
export class DeliverablesController {
  constructor(private readonly deliverablesService: DeliverablesService) {}

  @Post('file')
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: async (req, file, callback) => {
          const uploadPath = './uploads/deliverables';
          //const relativePath = await this.deliverablesService.getRelativePath(createDeliverableDto.parentId);

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
      let isFolder = false;

      createDeliverableDto.path = file ? file.path : null;

      return this.deliverablesService.create(
        createDeliverableDto,
        userId,
        isFolder,
      );
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @Put('file')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: async (req, file, callback) => {
          const uploadPath = './uploads/deliverables';
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
    @Req() req: Request,
  ) {
    try {
      let userId = req?.user?.id || 1;
      createDeliverableDto.path = file ? file.path : null;

      //return this.deliverablesService.update(createDeliverableDto, userId);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @Post('folder')
  //@UseGuards(AuthGuard)
  async createFolderDeliverable(
    @Body() createDeliverableDto: CreateDeliverableDto,
    @Req() req: Request,
  ) {
    try {
      const userId = 1; // req.user?.id;
      if (!userId) {
        throw new BadRequestException('User ID is missing');
      }

      const folderName = createDeliverableDto.name;
      //const relativePath = createDeliverableDto.path;
      const relativePath = await this.deliverablesService.getRelativePath(createDeliverableDto.parentId);
      console.log(relativePath);

      const isFolder = true;

      // Construir la ruta completa a la carpeta uploads, que está al mismo nivel que src y dist
      const folderPath = resolve(
        process.cwd(), // Carpeta raíz del proyecto
        'uploads/deliverables',
        relativePath,
        folderName,
      );

      
      try {
        const folderExists = await fs.stat(folderPath).catch(() => false);

        if (!folderExists) {
          createDeliverableDto.path = join('uploads/deliverables', relativePath ,   folderName)

          await fs.mkdir(folderPath, { recursive: true });
          await this.deliverablesService.create(
            createDeliverableDto,
            userId,
            isFolder,
          );
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

  @Post('link')
  //@UseGuards(AuthGuard)
  async createLinkDeliverable(
    @Body() createDeliverableDto: CreateDeliverableDto,
    @Req() req: Request,
  ) {
    try {
      const userId = 1; // req.user.id;
      const isFolder = false;
  
      // Intentamos crear el deliverable con los datos proporcionados
      const deliverable = await this.deliverablesService.create(
        createDeliverableDto,
        userId,
        isFolder,
      );
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


  @Get('user/:userId')
  @UseGuards(AuthGuard)
  async findAll(
    @Param('userId') userId: number,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('parentId') parentId: number = null,
    @Query('orderBy') orderBy: 'name' | 'date' | 'category' = 'date',
    @Query('orderOrientation') orderOrientation: 'ASC' | 'DESC' = 'DESC',
    @Req() req: Request,
  ) {
    try {
      const isAdmin =  req.user.isAdmin
      //const isAdmin =  true;
      let result = null;
      const deliverableResult = await this.deliverablesService.findAll(userId, page, limit, parentId, orderBy, isAdmin, orderOrientation);
      
      if(parentId){
        return deliverableResult;
      }else{
        const deliverableIds = deliverableResult.map(item => item.id);
        //console.log('los ids son deliverableIds'); 
        //console.log(deliverableIds); 
        result = await this.deliverablesService.findAll(userId, page, limit, parentId, orderBy, isAdmin, orderOrientation, deliverableIds);
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

  @Get('download/:id')
  async downloadFile(@Param('id') id: string, @Res() res: Response) {
    // const user = await this.userRepository.findOneBy({ id: userId });
    // if (!user) throw new Error('User does not exist');

    // const invoiceCopy = await this.invoiceRepository.findOneBy({ id: invoiceId });
    // if (!invoiceCopy) throw new Error('Invoice does not exist');

    // const filePath = join(__dirname, '../../upload/invoices', invoiceCopy.path);

    // if (!existsSync(filePath)) {
    //     throw new Error('Invoice file not found');
    // }

    // // Enviar el archivo directamente como respuesta
    // return res.download(filePath, invoiceCopy.number);
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

  @Put('permision/:deliverableId')
  async createPermision(
    @Param('deliverableId') deliverableId: number,
    @Body() permission: any,
  ): Promise<Permission[]> {
    try {
      console.log(permission, deliverableId);

      return this.deliverablesService.updatePermissions(
        deliverableId,
        permission,
      );
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
