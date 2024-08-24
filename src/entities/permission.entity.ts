import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity } from "./user.entity";
@Entity()
export class Permission {
    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    name: string;

//    @ManyToOne(()=> UserEntity,  user => user.permissions )
//    user : UserEntity

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP',   })
    createdAt: Date;

    @Column({type:'timestamp', nullable:true})
    updatedAt: Date;

}
