import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from "typeorm";
import { UserEntity } from "./user.entity";

@Entity({ name: "profile" })
export class ProfileEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => UserEntity, (user) => user.profile)
    userID: UserEntity;

    @Column({type: "varchar", length: 100})
    Names: string;

    @Column({type: "varchar", length: 100})
    LastName: string;

    @Column({type: "varchar", length: 100})
    Position: string;
    
}