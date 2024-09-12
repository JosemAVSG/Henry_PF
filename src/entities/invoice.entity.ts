import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { InvoiceStatus } from "./invoiceStatus.entity";
import { UserEntity } from "./user.entity";
import { Permission } from "./permission.entity";
import { Company } from "./company.entity";

@Entity()
export class Invoice {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable:true, unique:true})
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

    @ManyToOne(() => Company, (company) => company.invoices, { nullable: true })
    company: Company;
}
