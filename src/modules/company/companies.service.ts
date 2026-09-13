import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Company } from 'src/entities/company.entity';
import { Not, Repository } from 'typeorm';
import { CreateCompanyDto } from './dtos/create-company.dto';
import { UpdateCompanyDto } from './dtos/update-company.dto';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {}

  async create(createCompanyDto: CreateCompanyDto): Promise<Company> {
    const { name, cuit } = createCompanyDto;
  
    // Verifica si ya existe una empresa con el mismo nombre
    const existingByName = await this.companyRepository.findOne({ where: { name } });
  
    if (existingByName) {
      throw new ConflictException('Una empresa con este nombre ya existe.');
    }
  
    // Verifica si ya existe una empresa con el mismo CUIT
    const existingByCuit = await this.companyRepository.findOne({ where: { cuit } });
  
    if (existingByCuit) {
      throw new ConflictException('Una empresa con este CUIT ya existe.');
    }
  
    // Si no existe ni el nombre ni el CUIT, crea la empresa
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
    const { name, cuit } = updateCompanyDto;
  
    // Busca la empresa que se va a actualizar
    const company = await this.findOne(id);
  
    // Verifica si ya existe otra empresa con el mismo nombre, excluyendo la empresa actual
    const existingByName = await this.companyRepository.findOne({ 
      where: { name, id: Not(id) }
    });
  
    if (existingByName) {
      throw new ConflictException('Una empresa con este nombre ya existe.');
    }
  
    // Verifica si ya existe otra empresa con el mismo CUIT, excluyendo la empresa actual
    const existingByCuit = await this.companyRepository.findOne({ 
      where: { cuit, id: Not(id) }
    });
  
    if (existingByCuit) {
      throw new ConflictException('Una empresa con este CUIT ya existe.');
    }
  
    // Si no existe ni el nombre ni el CUIT, actualiza la empresa
    Object.assign(company, updateCompanyDto);
    return this.companyRepository.save(company);
  }
  

  async remove(id: number): Promise<void> {
    // Buscamos la empresa con sus relaciones
    const company = await this.companyRepository.findOne({
      where: { id },
      relations: ['users', 'invoices'],
    });

    // Si no existe la empresa, lanzamos una excepción NotFound
    if (!company) {
      throw new NotFoundException(`No se encontró una empresa con el ID: ${id}`);
    }

    const hasUsers = company.users && company.users.length > 0;
    const hasInvoices = company.invoices && company.invoices.length > 0;

    // Verificamos si tiene relaciones con usuarios o facturas
    if (hasUsers || hasInvoices) {
      let relations = [];
      if (hasUsers) relations.push('usuarios');
      if (hasInvoices) relations.push('facturas');

      throw new BadRequestException(
        `No se puede eliminar la empresa porque está relacionada con los siguientes elementos: ${relations.join(' y ')}.`
      );
    }

    // Si no tiene relaciones, procedemos a eliminar
    await this.companyRepository.remove(company);
  }

  
}
