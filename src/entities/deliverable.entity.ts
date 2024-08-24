import { Entity, Column, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { DeliverableType } from "./deliverableType.entity";

@Entity()
export class Deliverable {
    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    name: string;

    @ManyToOne(()=> DeliverableType, deliverableType => deliverableType.deliverables)
    deliverableType: DeliverableType

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP',   })
    createdAt: Date;
    
    @Column({type:'timestamp', nullable:true})
    updatedAt: Date;

}
