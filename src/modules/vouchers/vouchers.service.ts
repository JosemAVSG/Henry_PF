import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, Repository } from 'typeorm';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';
import { Invoice } from '../../entities/invoice.entity';
import { Voucher } from 'src/entities/vouchers.entity';

@Injectable()
export class VouchersService {
  constructor(
    @InjectRepository(Voucher)
    private voucherRepository: Repository<Voucher>,
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>,
  ) {}

  async createVoucher(createVoucherDto: CreateVoucherDto): Promise<Voucher> {
    const { invoiceId, ...rest } = createVoucherDto;
    const invoice = await this.invoiceRepository.findOne({
      where: { id: invoiceId },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${invoiceId} not found`);
    }

    const voucher = this.voucherRepository.create({
      ...rest,
      invoiceId: invoice,
    });

    return this.voucherRepository.save(voucher);
  }

  async getAllVouchers(): Promise<Voucher[]> {
    return this.voucherRepository.find({ relations: ['invoiceId'] });
  }

  async getVoucherById(id: number): Promise<Voucher> {
    const voucher = await this.voucherRepository.findOne({
      where: { id },
      relations: ['invoiceId'],
    });

    if (!voucher) {
      throw new NotFoundException(`Voucher with ID ${id} not found`);
    }

    return voucher;
  }

  async getVouchersByInvoiceId(invoiceId: number): Promise<Voucher[]> {
    return this.voucherRepository.find({
      where: { invoiceId: Equal(invoiceId) },
    });
  }

  async updateVoucher(
    id: number,
    updateVoucherDto: UpdateVoucherDto,
  ): Promise<Voucher> {
    const voucher = await this.getVoucherById(id);

    Object.assign(voucher, updateVoucherDto);

    return this.voucherRepository.save(voucher);
  }

  async deleteVoucher(id: number): Promise<void> {
    const voucher = await this.getVoucherById(id);
    await this.voucherRepository.remove(voucher);
  }
}
