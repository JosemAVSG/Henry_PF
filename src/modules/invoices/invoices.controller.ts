import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { DefaultDeserializer } from 'v8';
import { CreateInvoiceDto } from './dto/create-invoices.dto';

@Controller('invoices')
export class InvoicesController {
    constructor(
        private readonly deliverablesService: InvoicesService
    ) {}

    @Get(':userId')
    async getInvoicesByUser(
        @Param('userId') userId:number,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
    ){
        const idsInvoiceStatus = [1,2,3]
        return this.deliverablesService.getInvoicesByUser(userId, idsInvoiceStatus, page, limit)
    }

    @Post()
    async createInvoice(
        @Body() createInvoiceDto:CreateInvoiceDto){
        return this.deliverablesService.createInvoice(createInvoiceDto)
    }

}
