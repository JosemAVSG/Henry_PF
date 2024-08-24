import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Invoice } from '../../entities/invoice.entity';
import { Repository } from 'typeorm';

@Injectable()
export class InvoicesService {      
    constructor(
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>
    ){}

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
            'invoice.issueDate AS invoice_issueDate',
            'invoice.dueDate AS invoice_dueDate',
            'invoice.amount AS invoice_amount',
            'invoiceStatus.name AS invoiceStatus',
        ])
        .orderBy('"invoice.dueDate"', 'DESC') // 3=Payed, 2=Canceled, 1=Pending 
        .orderBy('"invoiceStatus.id"', 'DESC') // 3=Payed, 2=Canceled, 1=Pending 
        .limit(pageSize)
        .offset(offset)

        if(idsInvoiceStatus){
            queryBuilder.where('invoice_status.id IN (:...statusIds)', { statusIds: idsInvoiceStatus }) // Maneja el array de IDs
        }

        //.where('invoiceStatus.id = 1') // Only Pending of payment
        
        if (userId) {
            queryBuilder.where('users.id = :userId', { userId });
        }
        const result = await queryBuilder.getRawMany();
        
        return result;

    }
}
