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
  @PrimaryGeneratedColumn('uuid')
  id: string = uuid();

  @Column({ type: 'varchar', unique: true })
  email: string;
  @Column({ type: 'varchar' })
  password: string;

  @Column({ type: 'varchar', length: 100 })
  Names: string;

  @Column({ type: 'varchar', length: 100 })
  LastName: string;

  @Column({ type: 'varchar', length: 100 })
  Position: string;

  @Column({ type: 'boolean' })
  verifiedEmail: boolean;

  @Column({ type: 'boolean' })
  mfaEnabled: boolean;

  @Column({ type: 'varchar'})
  mfaBackupCodes: string;

  @Column({ type: 'varchar' })
  mfaSecret: string;

  @Column({ type: 'timestamp', nullable: true })
  mfaVerified: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  modifiedAt: Date;

  @Column({ type: 'boolean' })
  isAdmin: boolean;
}
