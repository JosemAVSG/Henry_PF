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
  
    @Column({ type: 'varchar', length: 100, unique:true })
    name: string;
    
    @Column({ type: 'bigint', unique:true })
    cuit: number;

    @Column({ type: 'varchar', nullable: true })
    address: string;
  
    @OneToMany(() => UserEntity, (user) => user.company)
    users: UserEntity[];
  
    @OneToMany(() => Invoice, (invoice) => invoice.company)
    invoices: Invoice[];
  }
  