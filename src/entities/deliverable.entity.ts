import { Entity, Column, ManyToOne, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { DeliverableType } from "./deliverableType.entity";
import { Permission } from "./permission.entity";

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
    
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP',   })
    createdAt: Date;
    
    @Column({type:'timestamp', nullable:true})
    updatedAt: Date;
    
    @ManyToOne(()=> DeliverableType, deliverableType => deliverableType.deliverables)
    deliverableType: DeliverableType

    @OneToMany(() => Permission, permission => permission.deliverable)
    permissions: Permission[];
    
    // Campos adicionales para compartir
     @Column({ default: false })
     isShared: boolean;       
     @Column({ nullable: true })
     shareToken: string;       
     @Column({ default: false })
     isPublic: boolean;
}
