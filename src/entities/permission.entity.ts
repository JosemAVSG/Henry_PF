import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity as User} from "./user.entity";
import { permissionType } from "./permissionType.entity";
import { Deliverable } from "./deliverable.entity";
@Entity()
export class Permission {
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column()
    name: string;
    
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP',   })
    createdAt: Date;

    @Column({type:'timestamp', nullable:true})
    updatedAt: Date;
    
    
    // Relación Many-to-One con User
    @ManyToOne(() => User, user => user.permissions)
    @JoinColumn({ name: 'userId' }) // Especifica el nombre de la columna FK
    user: User;

    @Column()
    userId: string; // FK hacia User


    // Relación Many-to-One con Deliverable
    @ManyToOne(() => Deliverable, deliverable => deliverable.permissions)
    @JoinColumn({ name: 'deliverableId' }) // Especifica el nombre de la columna FK
    deliverable: Deliverable;

    @Column()
    deliverableId: string; // FK hacia Deliverable


    // Relación Many-to-One con PermissionType
    @ManyToOne(()=> permissionType, permissionType => permissionType.permissions )
    @JoinColumn({ name: 'permissionTypeId'}) // Set FK column
    permissionType: permissionType

    @Column()
    permissionTypeId: number

}
