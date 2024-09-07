import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
  } from 'typeorm';
  import { UserEntity } from './user.entity';
  import { Invoice } from './invoice.entity';
  
  @Entity({ name: 'companies' })
  export class Company {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ type: 'varchar', length: 100, nullable: false })
    name: string;
  
    @Column({ type: 'varchar', nullable: true })
    address: string;

    @Column({ type: 'bigint', nullable: true })
    cuit: number;
  
    @OneToMany(() => UserEntity, (user) => user.company)
    users: UserEntity[];
  
    @OneToMany(() => Invoice, (invoice) => invoice.company)
    invoices: Invoice[];
  }
  