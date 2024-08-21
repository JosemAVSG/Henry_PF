import {Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn} from 'typeorm';
import {v4 as uuid} from 'uuid';
import { ProfileEntity } from './profile.entity';
@Entity({name: 'users'})
export class UserEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string=uuid();
    @Column()
    userName: string;
    @Column()
    email: string;
    @Column()
    password: string;

    @Column()
    verifiedEmail: boolean;
    @Column()
    mfaEnabled: boolean;

    @Column()
    mfaBackupCodes: string[];

    @Column()
    mfaSecret: string;

    @Column( {type: "timestamp", nullable: true} )
    mfaVerified: Date;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    createdAt: Date;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    modifiedAt: Date;

    @Column({type:'boolean'})
    active: boolean

    @OneToOne(() => ProfileEntity, (profile) => profile.userID)
    @JoinColumn()
    profile: ProfileEntity
}