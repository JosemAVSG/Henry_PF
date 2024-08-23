import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true })
  email: string;
  
  @Column({ type: 'varchar' })
  password: string;

  @Column({ type: 'varchar', length: 100 })
  Names: string;

  @Column({ type: 'varchar', length: 100 })
  LastName: string;

  @Column({ type: 'varchar', length: 100, nullable: true  })
  Position: string;

  @Column({ type: 'boolean', nullable: true  })
  verifiedEmail: boolean;

  @Column({ type: 'boolean', nullable: true  })
  mfaEnabled: boolean;

  @Column({ type: 'varchar', nullable: true})
  mfaBackupCodes: string;

  @Column({ type: 'varchar', nullable: true  })
  mfaSecret: string;

  @Column({ type: 'timestamp', nullable: true  })
  mfaVerified: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP',   })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP',   })
  modifiedAt: Date;

  @Column({ type: 'int', default: 1 })
  statusId: number;

}
