import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { v4 as uuid } from 'uuid';
@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: any;
 
  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar' })
  password: string;

  @Column({ type: 'varchar', length: 100 })
  Names: string;

  @Column({ type: 'varchar', length: 100 })
  LastName: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  Position: string;

  @Column({ type: 'boolean', nullable: true })
  verifiedEmail: boolean;

  @Column({ type: 'boolean', nullable: true })
  mfaEnabled: boolean;

  @Column({ type: 'varchar', nullable: true })
  mfaBackupCodes: string;

  @Column({ type: 'varchar', nullable: true })
  mfaSecret: string;

  @Column({ type: 'timestamp', nullable: true })
  mfaVerified: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  modifiedAt: Date;

  @Column({ type: 'boolean', default: 1 })
  statusId: boolean;
}

/*
1 activo
2 bloqueado
3 eliminado

*/
