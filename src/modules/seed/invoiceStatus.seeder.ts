import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InvoiceStatus } from '../../entities/deliverable';

@Injectable()
export class InvoiceStatusSeeder {
  constructor(
    @InjectRepository(InvoiceStatus)
    private readonly invoiceStatusRepository: Repository<InvoiceStatus>,
  ) {}

  async seedInvoiceStatus() {
    const invoiceStatusData = [];

    if(await this.invoiceStatusRepository.count() > 0) {
      return;
    }

    let invoiceStatus = new InvoiceStatus();
    invoiceStatus.name = "Pending"
    invoiceStatusData.push(invoiceStatus);

    invoiceStatus = new InvoiceStatus();
    invoiceStatus.name = "Payed"
    invoiceStatusData.push(invoiceStatus);

    invoiceStatus = new InvoiceStatus();
    invoiceStatus.name = "Cancelled"
    invoiceStatusData.push(invoiceStatus);

    await this.invoiceStatusRepository.save(invoiceStatusData);
    console.info('Seeded invoice Status Data');
  }
}
