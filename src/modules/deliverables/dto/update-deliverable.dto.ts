import { PartialType } from '@nestjs/mapped-types';
import { CreateDeliverableDto } from './create-deliverable.dto';

export class UpdateDeliverableDto extends PartialType(CreateDeliverableDto) {}
