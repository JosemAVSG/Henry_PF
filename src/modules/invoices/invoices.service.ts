import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Invoice } from '../../entities/invoice.entity';
import { Repository } from 'typeorm';
import { InvoiceStatus } from '../../entities/invoiceStatus.entity';
import { UserEntity } from '../../entities/user.entity';
import { join } from 'path';
import { CreateInvoiceDto } from './dto/create-invoices.dto';
import { existsSync } from 'fs';
import { Response } from 'express';
@Injectable()
export class InvoicesService {      
    constructor(
        @InjectRepository(Invoice)
        private invoiceRepository: Repository<Invoice>,
        @InjectRepository(UserEntity)
        private userRepository: Repository<UserEntity>,
        @InjectRepository(InvoiceStatus)
        private invoiceStatusRepository: Repository<InvoiceStatus>,
        
    ){}
    async checkInvoiceNumberExists(invoiceNumber: string): Promise<boolean> {
        const existingInvoice = await this.invoiceRepository.findOneBy({ number: invoiceNumber });
        return !!existingInvoice;
    }
   
    async createInvoice(createInvoiceDto: CreateInvoiceDto) {
        const {
            invoiceNumber,
            path,
            issueDate,
            dueDate,
            amount,
            userId,
            invoiceStatusId
        } = createInvoiceDto;
    
        // Check if an invoice with the same number already exists
        const existingInvoice = await this.invoiceRepository.findOneBy({ number: invoiceNumber });
        if (existingInvoice) {
            throw new BadRequestException('Ya existe una factura con este número');
        }
    
        // Ensure invoiceStatus and user exist
        const invoiceStatus = await this.invoiceStatusRepository.findOneBy({ id: invoiceStatusId });
        const user = await this.userRepository.findOneBy({ id: userId });
    
        if (!invoiceStatus || !user) {
            throw new Error('invoiceStatus or user not found');
        }
    
        // Create and save the new invoice
        const invoice = this.invoiceRepository.create({
            number: invoiceNumber,
            path,
            issueDate,
            dueDate,
            amount,
            user,
            invoiceStatus
        });
        
        const result = await this.invoiceRepository.save(invoice);
        return result;
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
