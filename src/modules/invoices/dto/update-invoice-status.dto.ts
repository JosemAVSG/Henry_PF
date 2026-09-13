// src/invoices/dto/update-invoice-status.dto.ts
import { IsInt, IsNotEmpty } from 'class-validator';

export class UpdateInvoiceStatusDto {
  @IsInt()
  @IsNotEmpty()
  invoiceStatusId: number;
}
