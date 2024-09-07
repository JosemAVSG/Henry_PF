import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { Permission } from './permission.entity';
import { Invoice } from './invoice.entity';
import { Company } from './company.entity';
@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar', nullable: true })
  password: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  Names: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  LastName: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  Position: string;

  @Column({type: 'varchar', nullable: true})
  empresa: string;

  @Column({ type: 'bigint', nullable: true })
  cuit:number;

  @Column({ type: 'varchar', nullable: true })
  domicilio:string;

  @Column({ type: 'boolean', nullable: true })
  verifiedEmail: boolean;

  @Column({ type: 'boolean', nullable: true })
  mfaEnabled: boolean;

  @Column({ type: 'varchar', nullable: true })
  mfaBackupCodes: string;

  @Column({ type: 'varchar', nullable: true })
  mfaSecret: string;

  @Column({ type: 'timestamp', nullable: true })
  mfaVerified: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  modifiedAt: Date;

  @Column({ type: 'int', default: 1 })
  statusId: number;

  @OneToMany(() => Permission, (permission) => permission.user)
  permissions: Permission[];

  @OneToMany(() => Invoice, (invoice) => invoice.user)
  invoices: Invoice[];

  @Column({ type: 'boolean', default: false })
  isAdmin: boolean;

  @ManyToOne(() => Company, (company) => company.users, { nullable: true })
  company: Company;
}
