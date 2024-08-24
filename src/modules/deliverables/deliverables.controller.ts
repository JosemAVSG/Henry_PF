import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { DeliverablesService } from './deliverables.service';
import { CreateDeliverableDto } from './dto/create-deliverable.dto';
import { UpdateDeliverableDto } from './dto/update-deliverable.dto';
import { AuthGuard } from '../../guards/auth.guards';

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
  ) {
    return this.deliverablesService.findAll(userId, page, limit);
  }


  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDeliverableDto: UpdateDeliverableDto) {
    return this.deliverablesService.update(+id, updateDeliverableDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.deliverablesService.remove(+id);
  }
}
