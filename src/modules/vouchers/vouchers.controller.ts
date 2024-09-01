import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UploadedFile,
  UseInterceptors,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { VouchersService } from './vouchers.service';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';
import { Voucher } from 'src/entities/vouchers.entity';
// import { Voucher } from '../../entities/voucher.entity';

@Controller('vouchers')
export class VouchersController {
  constructor(private readonly vouchersService: VouchersService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
          cb(null, filename);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|pdf)$/)) {
          return cb(new Error('Only image and PDF files are allowed!'), false);
        }
        cb(null, true);
      },
    }),
  )
  async createVoucher(
    @Body() createVoucherDto: CreateVoucherDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Voucher> {
    if (file) {
      createVoucherDto.path = file.path;
    }
    return this.vouchersService.createVoucher(createVoucherDto);
  }

  @Get()
  async getAllVouchers(): Promise<Voucher[]> {
    return this.vouchersService.getAllVouchers();
  }

  @Get(':id')
  async getVoucherById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Voucher> {
    return this.vouchersService.getVoucherById(id);
  }

  @Get('invoice/:invoiceId')
  async getVouchersByInvoiceId(
    @Param('invoiceId') invoiceId: number,
  ): Promise<Voucher[]> {
    return this.vouchersService.getVouchersByInvoiceId(invoiceId);
  }

  @Put(':id')
  async updateVoucher(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateVoucherDto: UpdateVoucherDto,
  ): Promise<Voucher> {
    return this.vouchersService.updateVoucher(id, updateVoucherDto);
  }

  @Delete(':id')
  async deleteVoucher(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.vouchersService.deleteVoucher(id);
  }
}
