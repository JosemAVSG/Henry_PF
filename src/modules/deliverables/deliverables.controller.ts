import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Put,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
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

  @Post()
  create(@Body() createDeliverableDto: CreateDeliverableDto) {
    return this.deliverablesService.create(createDeliverableDto);
  }

  @Get('user/:userId')
  // @UseGuards(AuthGuard)
  findAll(
    @Param('userId') userId: number,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('parentId') parentId: number = null,
    @Query('orderBy') orderBy: number = null,
    @Req() req: Request,
  ) {
    try {
      // console.log(req.user);
      // const isAdmin =  req.user.isAdmin
      const isAdmin =  false;
      return this.deliverablesService.findAll(userId, page, limit, parentId, orderBy, isAdmin);
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
  async getPermision(@Param('deliverableId') deliverableId: number): Promise<Partial<Permission>[]> {
    try {
      return this.deliverablesService.getPermissions(deliverableId);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @Put('permision/:deliverableId')
  async createPermision(@Param('deliverableId') deliverableId: number, @Body() permission: any): Promise<Permission[]> {
    try {
      console.log(permission, deliverableId);
      
      return this.deliverablesService.updatePermissions(deliverableId, permission);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
