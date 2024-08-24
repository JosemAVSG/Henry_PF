import { Module } from '@nestjs/common';
import { DeliverablesService } from './deliverables.service';
import { DeliverablesController } from './deliverables.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Deliverable } from '../../entities/deliverable.entity';
import { DeliverableType } from '../../entities/deliverableType.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Deliverable, DeliverableType])],
  controllers: [DeliverablesController],
  providers: [DeliverablesService],
})
export class DeliverablesModule {}
