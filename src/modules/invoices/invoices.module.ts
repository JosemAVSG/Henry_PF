import { Module } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invoice } from '../../entities/invoice.entity';
import { InvoiceStatus } from '../../entities/invoiceStatus.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Invoice,InvoiceStatus])],
  providers: [InvoicesService],
  controllers: [InvoicesController]
})
export class InvoicesModule {}
