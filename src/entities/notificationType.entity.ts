import { Entity, Column, ManyToOne, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { DeliverableType } from "./deliverableType.entity";
import { Permission } from "./permission.entity";
import { DeliverableCategory } from "./deliverableCategory.entity";
import { Notification } from "./notification.entity";

@Entity()
export class NotificationType {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable:true})
    name: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP',   })
    createdAt: Date;
    
    @Column({type:'timestamp', nullable:true})
    updatedAt: Date;

    @Column({ type: 'int', default: 1 })
    statusId: number;
    
    @OneToMany(() => Notification, notification => notification.notificationType)
    notifications: Notification[];

}
