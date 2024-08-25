import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { InvoiceStatus } from "./invoiceStatus.entity";
import { UserEntity } from "./user.entity";

@Entity()
export class Invoice {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable:true})
    number: string;

    @Column({nullable:true})
    path: string;

    @Column({type:'timestamp', nullable:true})
    issueDate: Date; 

    @Column({type:'timestamp', nullable:true})
    dueDate: Date; 

    @Column('decimal', { precision: 10, scale: 2 })
    amount: number;


    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP',   })
    createdAt: Date;

    @Column({type:'timestamp', nullable:true})
    updatedAt: Date;

    @ManyToOne(()=> UserEntity, user => user.invoices)
    user: UserEntity

    @ManyToOne(()=> InvoiceStatus, invoiceStatus => invoiceStatus.invoices)
    invoiceStatus: InvoiceStatus

}
