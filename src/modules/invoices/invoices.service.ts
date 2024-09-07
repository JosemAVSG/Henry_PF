import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Invoice } from '../../entities/invoice.entity';
import { Repository } from 'typeorm';
import { InvoiceStatus } from '../../entities/invoiceStatus.entity';
import { UserEntity } from '../../entities/user.entity';
import { join } from 'path';
import { CreateInvoiceDto } from './dto/create-invoices.dto';
import { existsSync } from 'fs';
import { Response } from 'express';
import { Company } from 'src/entities/company.entity';
@Injectable()
export class InvoicesService {      
    constructor(
        @InjectRepository(Invoice)
        private invoiceRepository: Repository<Invoice>,
        @InjectRepository(UserEntity)
        private userRepository: Repository<UserEntity>,
        @InjectRepository(Company)
        private companyRepository: Repository<Company>,
        @InjectRepository(InvoiceStatus)
        private invoiceStatusRepository: Repository<InvoiceStatus>,
        
    ){}
    // =====================================
    async checkInvoiceNumberExists(invoiceNumber: string): Promise<boolean> {
        const existingInvoice = await this.invoiceRepository.findOneBy({ number: invoiceNumber });
        return !!existingInvoice;
    }
   
    // =====================================
    async createInvoice(createInvoiceDto: CreateInvoiceDto) {
        const {
          invoiceNumber,
          path,
          issueDate,
          dueDate,
          amount,
          userId,
          invoiceStatusId,
          companyId // Añadido para la relación con Company
        } = createInvoiceDto;
    
        const existingInvoice = await this.invoiceRepository.findOneBy({ number: invoiceNumber });
        if (existingInvoice) {
          throw new BadRequestException('Ya existe una factura con este número');
        }
    
        const invoiceStatus = await this.invoiceStatusRepository.findOneBy({ id: invoiceStatusId });
        const user = await this.userRepository.findOneBy({ id: userId });
        const company = companyId ? await this.companyRepository.findOneBy({ id: companyId }) : null;
    
        if (!invoiceStatus || !user) {
          throw new BadRequestException('invoiceStatus o user no encontrado');
        }
    
        const invoice = this.invoiceRepository.create({
          number: invoiceNumber,
          path,
          issueDate,
          dueDate,
          amount,
          user,
          invoiceStatus,
          company
        });
    
        return this.invoiceRepository.save(invoice);
      }
    
    // =====================================
      async updateInvoice(id: number, updateInvoiceDto: CreateInvoiceDto): Promise<Invoice> {
        const {
          invoiceNumber,
          path,
          issueDate,
          dueDate,
          amount,
          userId,
          invoiceStatusId,
          companyId // Añadido para la relación con Company
        } = updateInvoiceDto;
    
        const invoice = await this.invoiceRepository.findOneBy({ id });
        if (!invoice) {
          throw new BadRequestException('Invoice not found');
        }
    
        if (invoiceNumber && invoiceNumber !== invoice.number) {
          const existingInvoice = await this.invoiceRepository.findOneBy({ number: invoiceNumber });
          if (existingInvoice) {
            throw new BadRequestException('Ya existe una factura con este número');
          }
        }
    
        const invoiceStatus = await this.invoiceStatusRepository.findOneBy({ id: invoiceStatusId });
        const user = await this.userRepository.findOneBy({ id: userId });
        const company = companyId ? await this.companyRepository.findOneBy({ id: companyId }) : null;
    
        if (!invoiceStatus || !user) {
          throw new BadRequestException('invoiceStatus o user no encontrado');
        }
    
        invoice.number = invoiceNumber || invoice.number;
        invoice.path = path || invoice.path;
        invoice.issueDate = issueDate || invoice.issueDate;
        invoice.dueDate = dueDate || invoice.dueDate;
        invoice.amount = amount || invoice.amount;
        invoice.user = user;
        invoice.invoiceStatus = invoiceStatus;
        invoice.company = company;
    
        return this.invoiceRepository.save(invoice);
      }
    
    // =====================================
    async getInvoiceById(id: number): Promise<Invoice> {
        const invoice = await this.invoiceRepository.findOne({
            where: { id },
            relations: ['user', 'invoiceStatus'], // Adjust if needed
        });
        
        if (!invoice) {
            throw new NotFoundException(`Invoice with ID ${id} not found`);
        }

        return invoice;
    }


    async getInvoicesByUser(
        userId: number = null, 
        idsInvoiceStatus: number[],
        page:number=1, pageSize: number=10
    ): Promise<Invoice[]> {

        const offset = (page - 1) * pageSize
        
        const queryBuilder = this.invoiceRepository
        .createQueryBuilder('invoice')
        .leftJoinAndSelect('invoice.invoiceStatus', 'invoiceStatus')
        .leftJoinAndSelect('invoice.user', 'users')
        .select([
            'invoice.id AS "id"',
            'invoice.path AS "invoicePath"',
            'invoice.number AS "invoiceNumber"',
            `TO_CHAR(invoice.issueDate, 'DD-MM-YYYY') AS "invoiceIssueDate"`,
            `TO_CHAR(invoice.dueDate, 'DD-MM-YYYY') AS "invoiceDueDate"`,
            'invoice.amount AS "invoiceAmount"',
            'invoiceStatus.name AS "invoiceStatus"',
            `CASE 
                WHEN invoice.dueDate < CURRENT_DATE THEN true 
                ELSE false 
             END AS "overdueIndicator"`
        ])
        .orderBy('"invoiceDueDate"', 'DESC')  
        .limit(pageSize)
        .offset(offset)

        if(idsInvoiceStatus){
            queryBuilder.where('invoiceStatus.id IN (:...statusIds)', { statusIds: idsInvoiceStatus }) // Maneja el array de IDs
        }

        if (userId) {
            queryBuilder.where('users.id = :userId', { userId });
        }
        const result = await queryBuilder.getRawMany();
        
        return result;

    }

    async getDonwloadInvoicesCopy(userId: number,invoiceId: number, res: Response) {

        const user = await this.userRepository.findOneBy({ id: userId });
        if (!user) throw new Error('User does not exist');
    
        const invoiceCopy = await this.invoiceRepository.findOneBy({ id: invoiceId });
        if (!invoiceCopy) throw new Error('Invoice does not exist');
    
        const filePath = join(__dirname, '../../upload/invoices', invoiceCopy.path);
    
        if (!existsSync(filePath)) {
            throw new Error('Invoice file not found');
        }
    
        // Enviar el archivo directamente como respuesta
        return res.download(filePath, invoiceCopy.number);

    }

    async deleteInvoice(id: number): Promise<void> {
        
        const invoice = await this.invoiceRepository.findOneBy({id: id});
        await this.invoiceRepository.remove(invoice);
    }

}
