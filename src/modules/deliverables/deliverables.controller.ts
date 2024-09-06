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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
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
  async createFolderDeliverable(
    @Body() createDeliverableDto: CreateDeliverableDto,
    @Req() req: Request,
  ) {
    try {
      const userId = req.user.id;
      const folderName = createDeliverableDto.name;
      const relativePath = createDeliverableDto.path;
      const isFolder = true;
      const folderPath = path.join(
        __dirname,
        '..',
        'uploads/deliverables',
        relativePath,
        folderName,
      );

      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
        await this.deliverablesService.create(
          createDeliverableDto,
          userId,
          isFolder,
        );
        return `Folder ${folderName} created successfully`;
      } else {
        return `Folder ${folderName} already exists`;
      }
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @Post('link')
  async createLinkDeliverable(
    @Body() createDeliverableDto: CreateDeliverableDto,
    @Req() req: Request,
  ) {
    const userId = req.user.id;
    const isFolder = false;
    return this.deliverablesService.create(
      createDeliverableDto,
      userId,
      isFolder,
    );
  }

  @Get('user/:userId')
  //@UseGuards(AuthGuard)
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
      //const isAdmin =  req.user.isAdmin
      const isAdmin =  true;
      parentId = 4;
      let result = null;
      const deliverableResult = await this.deliverablesService.findAll(userId, page, limit, parentId, orderBy, isAdmin, orderOrientation);
      
      if(parentId){
        return deliverableResult;
      }else{
        const deliverableIds = deliverableResult.map(item => item.id);
        console.log('los ids son deliverableIds'); 
        console.log(deliverableIds); 
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

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDeliverableDto: UpdateDeliverableDto,
  ) {
    try {
      return this.deliverablesService.update(+id, updateDeliverableDto);
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
