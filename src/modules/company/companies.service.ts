import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Company } from 'src/entities/company.entity';
import { Repository } from 'typeorm';
import { CreateCompanyDto } from './dtos/create-company.dto';
import { UpdateCompanyDto } from './dtos/update-company.dto';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {}

  async create(createCompanyDto: CreateCompanyDto): Promise<Company> {
    const company = this.companyRepository.create(createCompanyDto);
    return this.companyRepository.save(company);
  }

  async findAll(): Promise<Company[]> {
    return this.companyRepository.find({
      relations: ['users', 'invoices'],
      order: {
        id: 'ASC', // Ordenar por ID en orden ascendente. Puedes usar 'DESC' si prefieres descendente.
      },
    });
  }

  async findOne(id: number): Promise<Company> {
    const company = await this.companyRepository.findOne({
      where: { id },
      relations: ['users', 'invoices', "invoices.invoiceStatus"],
    });
  
    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }
  
    // Ordenar usuarios e invoices por id
    company.users.sort((a, b) => a.id - b.id);
    company.invoices.sort((a, b) => a.id - b.id);
  
    return company;
  }
  

  async update(id: number, updateCompanyDto: UpdateCompanyDto): Promise<Company> {
    const company = await this.findOne(id);
    Object.assign(company, updateCompanyDto);
    return this.companyRepository.save(company);
  }

  async remove(id: number): Promise<void> {
    console.log("id",id)
    const company = await this.findOne(id);
    await this.companyRepository.remove(company);
  }
}
