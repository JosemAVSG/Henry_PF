// src/voucher/voucher.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VouchersService } from './vouchers.service';
import { VouchersController } from './vouchers.controller';
import { Invoice } from '../../entities/invoice.entity';
import { Voucher } from '../../entities/vouchers.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Voucher, Invoice])],
  controllers: [VouchersController],
  providers: [VouchersService],
})
export class VouchersModule {}
