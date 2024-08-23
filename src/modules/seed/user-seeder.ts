import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import * as bcrypt from 'bcrypt';
import { UserEntity } from 'src/entities/user.entity';

@Injectable()
export class UserSeeder {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async seed() {
    const users = [];

    for (let i = 1; i <= 30; i++) {
      const user = new UserEntity();
      // user.id = uuid();
      user.email = `user${i}@example.com`;
      user.password = await bcrypt.hash('password123', 10);
      user.Names = `User${i}`;
      user.LastName = `LastName${i}`;
      user.Position = `Position${i}`;
      user.verifiedEmail = Math.random() > 0.5;
      user.mfaEnabled = Math.random() > 0.5;
      user.mfaBackupCodes = '';
      user.mfaSecret = '';
      user.mfaVerified = null;
      user.createdAt = new Date();
      user.modifiedAt = new Date();
      user.statusId = true;

      users.push(user);
    }

    await this.userRepository.save(users);
    console.log('Seeded 30 users');
  }
}
