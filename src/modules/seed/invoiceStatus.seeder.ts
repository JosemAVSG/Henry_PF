import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InvoiceStatus } from '../../entities/invoiceStatus.entity';

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
    invoiceStatus.name = "Pendiente"
    invoiceStatusData.push(invoiceStatus);

    invoiceStatus = new InvoiceStatus();
    invoiceStatus.name = "Revisión"
    invoiceStatusData.push(invoiceStatus);

    invoiceStatus = new InvoiceStatus();
    invoiceStatus.name = "Pagado"
    invoiceStatusData.push(invoiceStatus);

    invoiceStatus = new InvoiceStatus();
    invoiceStatus.name = "Anulado"
    invoiceStatusData.push(invoiceStatus);    

    await this.invoiceStatusRepository.save(invoiceStatusData);
    console.info('Seeded invoice Status Data');
  }
}
