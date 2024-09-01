import { PartialType } from '@nestjs/mapped-types';
import { CreateInvoiceDto } from './create-invoices.dto';

export class UpdateInvoiceDto extends PartialType(CreateInvoiceDto) {}
