import { Module } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invoice } from '../../entities/invoice.entity';
import { InvoiceStatus } from '../../entities/deliverable';
import { UserEntity } from '../../entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Invoice,InvoiceStatus, UserEntity])],
  providers: [InvoicesService],
  controllers: [InvoicesController]
})
export class InvoicesModule {}
