import { Entity, Column, ManyToOne, PrimaryGeneratedColumn, OneToMany, Timestamp } from "typeorm";
import { NotificationType } from "./notificationType.entity";
import { UserEntity } from "./user.entity";
import { Deliverable } from "./deliverable.entity";
import { Invoice } from "./invoice.entity";

@Entity()
export class Notification {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable:true})
    note: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP',   })
    createdAt: Date;
    
    @Column({ type: 'int', default: 1 })
    statusId: number; 
    
    @ManyToOne(()=> NotificationType, notificationType => notificationType.notifications)
    notificationType: NotificationType
    
    @ManyToOne(()=> Deliverable, deliverable => deliverable.notifications, {nullable: true})
    deliverable: Deliverable

    @ManyToOne(()=> Invoice, invoice => invoice.notifications, {nullable: true})
    invoice: Invoice

    @ManyToOne(()=> UserEntity, user => user.impactedNotifications)
    impactedUser: UserEntity

    @ManyToOne(()=> UserEntity, user => user.triggeredNotifications)
    triggerUser: UserEntity

}
