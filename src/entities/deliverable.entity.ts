import { Entity, Column, ManyToOne, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { DeliverableType } from "./deliverableType.entity";
import { Permission } from "./permission.entity";

@Entity()
export class Deliverable {
    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    name: string;

    
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP',   })
    createdAt: Date;
    
    @Column({type:'timestamp', nullable:true})
    updatedAt: Date;
    
    @ManyToOne(()=> DeliverableType, deliverableType => deliverableType.deliverables)
    deliverableType: DeliverableType

    @OneToMany(() => Permission, permission => permission.deliverable)
    permissions: Permission[];
}
