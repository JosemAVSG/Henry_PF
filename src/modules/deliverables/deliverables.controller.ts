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
  BadRequestException,
} from '@nestjs/common';
import { DeliverablesService } from './deliverables.service';
import { CreateDeliverableDto } from './dto/create-deliverable.dto';
import { UpdateDeliverableDto } from './dto/update-deliverable.dto';
import { AuthGuard } from '../../guards/auth.guards';
import { Deliverable } from 'src/entities/deliverable.entity';
import { Permission } from 'src/entities/permission.entity';

@Controller('deliverables')
export class DeliverablesController {
  constructor(private readonly deliverablesService: DeliverablesService) {}

  @Post()
  create(@Body() createDeliverableDto: CreateDeliverableDto) {
    return this.deliverablesService.create(createDeliverableDto);
  }

  @Get(':userId')
  //@UseGuards(AuthGuard)
  findAll(
    @Param('userId') userId: number,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('parenId') parenId: number = null,
    @Query('orderBy') orderBy: number = null,
  ) {
    try {
      return this.deliverablesService.findAll(userId, page, limit, parenId, orderBy);
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

  @Get('files-folder/:parentId')
  async getFilesFolder(
    @Param('parentId') parentId: number,
  ): Promise<Deliverable[]> {
    try {
      return this.deliverablesService.getFilesFolder(parentId);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @Get('permision/:deliverableId')
  async getPermision(@Param('deliverableId') deliverableId: number): Promise<Permission[]> {
    try {
      return this.deliverablesService.getPermissions(deliverableId);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  // @Post('permision/:userId')
  // async createPermision(@Param('userId') userId: number, @Body() body: any): Promise<Permission[]> {
  //   try {
  //     return this.deliverablesService.createPermision(userId, body);
  //   } catch (error) {
  //     throw new BadRequestException(error);
  //   }
  // }
}
