import { Entity, Column, ManyToOne, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { DeliverableType } from "./deliverableType.entity";
import { Permission } from "./permission.entity";
import { DeliverableCategory } from "./deliverableCategory.entity";

@Entity()
export class Deliverable {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable:true})
    name: string;

    @Column({nullable:true})
    path: string;
    
    @Column({nullable:true})
    parentId: number;

    @Column()
    isFolder: boolean;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP',   })
    createdAt: Date;
    
    @Column({type:'timestamp', nullable:true})
    updatedAt: Date;

    @Column({ type: 'int', default: 1 })
    statusId: number;
    
    @ManyToOne(()=> DeliverableType, deliverableType => deliverableType.deliverables)
    deliverableType: DeliverableType
    
    @ManyToOne(()=> DeliverableCategory, deliverableCategory => deliverableCategory.deliverables)
    deliverableCategory: DeliverableCategory
    
    @OneToMany(() => Permission, permission => permission.deliverable)
    permissions: Permission[];
}
