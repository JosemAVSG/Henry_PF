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

    if (await this.userRepository.count() > 0) {
      return;
    }
    // Crear 30 usuarios automáticos

    for (let i = 1; i <= 30; i++) {
      const user = new UserEntity();
      user.email = `user${i}@example.com`;
      user.password = await bcrypt.hash(user.email, 10); // Contraseña = email
      user.Names = `User${i}`;
      user.LastName = `LastName${i}`;
      user.Position = `Position${i}`;
      user.verifiedEmail = false;
      user.mfaEnabled = false;
      user.mfaBackupCodes = '';
      user.mfaSecret = '';
      user.mfaVerified = null;
      user.createdAt = new Date();
      user.modifiedAt = new Date();
      user.isAdmin = i <= 10; // Hacer que los primeros 10 usuarios sean administradores

      users.push(user);
    }

    // Agregar usuarios adicionales con la información proporcionada
    const additionalUser = new UserEntity();
    additionalUser.email = 'user@example.com';
    additionalUser.password = await bcrypt.hash(additionalUser.email, 10); // Contraseña = email
    additionalUser.Names = 'John';
    additionalUser.LastName = 'Doe';
    additionalUser.Position = 'Manager';
    additionalUser.verifiedEmail = true;
    additionalUser.mfaEnabled = false;
    additionalUser.mfaBackupCodes = '';
    additionalUser.mfaSecret = '';
    additionalUser.mfaVerified = null;
    additionalUser.createdAt = new Date();
    additionalUser.modifiedAt = new Date();
    additionalUser.isAdmin = true;

    users.push(additionalUser);

    const UserAdmin = new UserEntity();
    UserAdmin.email = 'admin@example.com';
    UserAdmin.password = await bcrypt.hash(UserAdmin.email, 10); // Contraseña = email
    UserAdmin.Names = 'John Admin';
    UserAdmin.LastName = 'Doe';
    UserAdmin.Position = 'Admin';
    UserAdmin.verifiedEmail = true;
    UserAdmin.mfaEnabled = false;
    UserAdmin.mfaBackupCodes = '';
    UserAdmin.mfaSecret = '';
    UserAdmin.mfaVerified = null;
    UserAdmin.createdAt = new Date();
    UserAdmin.modifiedAt = new Date();
    UserAdmin.isAdmin = true;

    users.push(UserAdmin);

    // Guardar todos los usuarios en la base de datos
    await this.userRepository.save(users);
    console.info('Seeded 32 users');
  }
}
