import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from 'src/entities/company.entity';

@Injectable()
export class CompanySeeder {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {}

  async seed() {
    if (await this.companyRepository.count() > 0) {
      return;
    }

    const companies = [];

    // Crear 4 compañías automáticas
    for (let i = 1; i <= 4; i++) {
      const company = new Company();
      company.name = `Company${i}`;
      company.address = `Address${i}`;
      company.cuit = 200000000 + i; // Just a sample value

      companies.push(company);
    }

    // Agregar compañías adicionales con información específica
    const additionalCompany = new Company();
    additionalCompany.name = 'Tech Innovations';
    additionalCompany.address = '123 Innovation Blvd';
    additionalCompany.cuit = 300000000; // Just a sample value

    companies.push(additionalCompany);

    const additionalCompany2 = new Company();
    additionalCompany2.name = 'Creative Solutions';
    additionalCompany2.address = '456 Creativity Lane';
    additionalCompany2.cuit = 400000000; // Just a sample value

    companies.push(additionalCompany2);

    // Guardar todas las compañías en la base de datos
    await this.companyRepository.save(companies);
    console.info('Seeded 6 companies');
  }
}
