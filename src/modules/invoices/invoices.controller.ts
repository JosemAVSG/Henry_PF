import { Body, Controller, Get, Param, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs-extra';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoices.dto';

@Controller('invoices')
export class InvoicesController {
    constructor(
        private readonly invoicesService: InvoicesService
    ) {}

    @Get(':userId')
    async getInvoicesByUser(
        @Param('userId') userId:number,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
    ){
        const idsInvoiceStatus = [1,2,3];
        return this.invoicesService.getInvoicesByUser(userId, idsInvoiceStatus, page, limit);
    }

    @Post()
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: async (req, file, callback) => {
                    const uploadPath = './uploads/invoices';
                    await fs.ensureDir(uploadPath); // Crea el directorio si no existe
                    callback(null, uploadPath);
                },
                filename: (req, file, callback) => {
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                    const ext = extname(file.originalname);
                    const filename = `${uniqueSuffix}${ext}`;
                    callback(null, filename);
                },
            }),
        }),
    )
    async createInvoice(
        @UploadedFile() file: Express.Multer.File,
        @Body() createInvoiceDto: CreateInvoiceDto
    ) {
        // Asigna el path del archivo al DTO
        createInvoiceDto.path = file ? file.path : null;
        return this.invoicesService.createInvoice(createInvoiceDto);
    }
}
