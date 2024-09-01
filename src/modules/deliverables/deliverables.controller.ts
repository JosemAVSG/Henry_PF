import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs-extra';
import { DeliverablesService } from './deliverables.service';
import { CreateDeliverableDto } from './dto/create-deliverable.dto';
import { UpdateDeliverableDto } from './dto/update-deliverable.dto';
import { AuthGuard } from '../../guards/auth.guards';

@Controller('deliverables')
export class DeliverablesController {
  constructor(private readonly deliverablesService: DeliverablesService) {}


  @Post()
  @UseInterceptors(
      FileInterceptor('file', {
          storage: diskStorage({
              destination: async (req, file, callback) => {
                  const uploadPath = './uploads/deliverables';
                  await fs.ensureDir(uploadPath); // Crea el directorio si no existe
                  callback(null, uploadPath);
              },
              filename: (req, file, callback) => {
                  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                  const ext = extname(file.originalname);
                  const filename = `${uniqueSuffix}${ext}`;
                  callback(null, filename);
              },
          }),
      }),
  )
  async createInvoice(
      @UploadedFile() file: Express.Multer.File,
      @Body() createDeliverableDto: CreateDeliverableDto
  ) {
      createDeliverableDto.path = file ? file.path : null;
      return this.deliverablesService.create(createDeliverableDto);
  }



  @Get(':userId')
  @UseGuards(AuthGuard)
  findAll(
    @Param('userId') userId: number,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('parentId') parentId: number = null,
    @Query('orderBy') orderBy: number = null,
  ) {
    const isAdmin = true;
    return this.deliverablesService.findAll(userId, page, limit, parentId, orderBy, isAdmin);
  }


  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDeliverableDto: UpdateDeliverableDto) {
    return this.deliverablesService.update(+id, updateDeliverableDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.deliverablesService.remove(+id);
  }

  @Get('preview/:fileId')
  async getPreview(@Param('fileId') fileId: string): Promise<string> {
    try {
      return this.deliverablesService.getFilePreview(fileId);
    } catch (error) {
      throw new Error(error);
    }
  }

}
