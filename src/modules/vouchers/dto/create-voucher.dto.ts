// create-voucher.dto.ts
import { IsNotEmpty, IsNumber, IsOptional, IsDate, IsString } from 'class-validator';

export class CreateVoucherDto {
  @IsOptional()
  @IsString()
  number: string;

  @IsOptional()
  @IsString()
  path: string;

  @IsNotEmpty()
  @IsDate()
  issueDate: Date;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsNumber()
  invoiceId: number;
}
