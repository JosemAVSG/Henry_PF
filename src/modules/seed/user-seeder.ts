import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

    // Crear 30 usuarios automáticos
    for (let i = 1; i <= 30; i++) {
      const user = new UserEntity();
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

      users.push(user);
    }

    // Agregar el usuario adicional con la información proporcionada
    const additionalUser = new UserEntity();
    additionalUser.email = 'user@example.com';
    additionalUser.password = await bcrypt.hash('password123', 10);
    additionalUser.Names = 'John';
    additionalUser.LastName = 'Doe';
    additionalUser.Position = 'Manager';
    additionalUser.verifiedEmail = true; // O el valor que desees
    additionalUser.mfaEnabled = false; // O el valor que desees
    additionalUser.mfaBackupCodes = '';
    additionalUser.mfaSecret = '';
    additionalUser.mfaVerified = null;
    additionalUser.createdAt = new Date();
    additionalUser.modifiedAt = new Date();

    users.push(additionalUser);

    // Guardar todos los usuarios en la base de datos
    await this.userRepository.save(users);
    console.log('Seeded 31 users');
  }
}
