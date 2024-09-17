import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { InvoiceStatus } from "./invoiceStatus.entity";
import { UserEntity } from "./user.entity";
import { Permission } from "./permission.entity";
import { Company } from "./company.entity";
import { Notification } from "./notification.entity";
import { Voucher } from "./vouchers.entity";

@Entity()
export class Invoice {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: 'varchar', length: 255, nullable:true, unique:true})
    number: string;

    @Column({nullable:true})
    path: string;

    @Column({type:'date', nullable:true})
    issueDate: Date; 

    @Column({type:'date', nullable:true})
    dueDate: Date; 

    @Column('decimal', { precision: 10, scale: 2 })
    amount: number;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP',   })
    createdAt: Date;

    @Column({type:'timestamp', nullable:true})
    updatedAt: Date;

    @ManyToOne(() => UserEntity, user => user.invoices, { nullable: true })
    user: UserEntity;
    
    @ManyToOne(()=> InvoiceStatus, invoiceStatus => invoiceStatus.invoices)
    invoiceStatus: InvoiceStatus

    @OneToMany(() => Permission, permission => permission.invoice)
    permissions: Permission[];

    @OneToMany(() => Notification, notification => notification.invoice)
    notifications: Notification[];

    @ManyToOne(() => Company, (company) => company.invoices, { nullable: true })
    company: Company;

    @OneToOne(() => Voucher, voucher => voucher.invoiceId, { nullable: true })
    @JoinColumn() // Esto asegura que "Invoice" es el lado propietario de la relación
    voucher: Voucher;
}
