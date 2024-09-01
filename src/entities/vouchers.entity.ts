import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Invoice } from './invoice.entity';

@Entity()
export class Voucher {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  number: string;

  @Column({ nullable: true })
  path: string;

  @Column({ type: 'timestamp', nullable: true })
  issueDate: Date; // Fecha de Emisión

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @ManyToOne(() => Invoice)
  invoiceId: Invoice;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  updatedAt: Date;
}
