import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from '../../entities/invoice.entity';
import { InvoiceStatus } from '../../entities/invoiceStatus.entity';
import { UserEntity } from '../../entities/user.entity';
import { Company } from '../../entities/company.entity';

@Injectable()
export class InvoiceSeeder {
  private readonly logger = new Logger(InvoiceSeeder.name);

  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(InvoiceStatus)
    private readonly invoiceStatusRepository: Repository<InvoiceStatus>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {}

  async seed(): Promise<void> {
    try {
      // Obtén datos necesarios
      const invoiceStatuses = await this.invoiceStatusRepository.find();
      const users = await this.userRepository.find();
      const companies = await this.companyRepository.find();

      if (invoiceStatuses.length === 0 || users.length === 0 || companies.length === 0) {
        this.logger.warn('Faltan datos necesarios para el seeder.');
        return;
      }

      // Define las facturas de ejemplo
      const invoices = [
        {
          number: 'INV-0001',
          path: 'path/to/invoice1.pdf',
          issueDate: new Date('2024-01-01'),
          dueDate: new Date('2024-02-01'),
          amount: 100.00,
          user: users[0],
          invoiceStatus: invoiceStatuses[0],
          company: companies[0],
        },
        {
          number: 'INV-0002',
          path: 'path/to/invoice2.pdf',
          issueDate: new Date('2024-02-01'),
          dueDate: new Date('2024-03-01'),
          amount: 150.00,
          user: users[1],
          invoiceStatus: invoiceStatuses[1],
          company: companies[1],
        },
        {
          number: 'INV-0003',
          path: 'path/to/invoice3.pdf',
          issueDate: new Date('2024-03-01'),
          dueDate: new Date('2024-04-01'),
          amount: 200.00,
          user: users[2],
          invoiceStatus: invoiceStatuses[2],
          company: companies[2],
        },
        {
          number: 'INV-0004',
          path: 'path/to/invoice4.pdf',
          issueDate: new Date('2024-04-01'),
          dueDate: new Date('2024-05-01'),
          amount: 250.00,
          user: users[0],
          invoiceStatus: invoiceStatuses[0],
          company: companies[0],
        },
        {
          number: 'INV-0005',
          path: 'path/to/invoice5.pdf',
          issueDate: new Date('2024-05-01'),
          dueDate: new Date('2024-06-01'),
          amount: 300.00,
          user: users[1],
          invoiceStatus: invoiceStatuses[1],
          company: companies[1],
        },
        {
          number: 'INV-0006',
          path: 'path/to/invoice6.pdf',
          issueDate: new Date('2024-06-01'),
          dueDate: new Date('2024-07-01'),
          amount: 350.00,
          user: users[2],
          invoiceStatus: invoiceStatuses[2],
          company: companies[2],
        },
      ];

      // Inserta las facturas en la base de datos
      await this.invoiceRepository.save(invoices);
      this.logger.log('Facturas seeding completo');
      console.info("Facturas seeding completo");
    } catch (error) {
      this.logger.error('Error al ejecutar el seeder de facturas', error.stack);
    }
  }
}
