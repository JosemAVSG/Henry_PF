import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserEntity } from 'src/entities/user.entity';
import { Company } from 'src/entities/company.entity';

@Injectable()
export class UserSeeder {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {}

  async seed() {
    if (await this.userRepository.count() > 0) {
      return;
    }

    const companies = await this.companyRepository.find();

    const users = [];

    for (let i = 1; i <= 18; i++) {
      const user = new UserEntity();
      user.email = `user${i}@gmail.com`;
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
      user.company = companies[i % companies.length - 1]; // Asignar una compañía aleatoria
      user.imgProfile = "https://i.postimg.cc/7hR9Z5NW/avatardashboard.png";

      users.push(user);
    }

    // Agregar usuarios adicionales con la información proporcionada
    const additionalUser = new UserEntity();
    additionalUser.email = 'user@gmail.com';
    additionalUser.password = await bcrypt.hash(additionalUser.email, 10); // Contraseña = email
    additionalUser.Names = 'User';
    additionalUser.LastName = 'Example';
    additionalUser.Position = 'Manager';
    additionalUser.verifiedEmail = true;
    additionalUser.mfaEnabled = false;
    additionalUser.mfaBackupCodes = '';
    additionalUser.mfaSecret = '';
    additionalUser.mfaVerified = null;
    additionalUser.createdAt = new Date();
    additionalUser.modifiedAt = new Date();
    additionalUser.isAdmin = true;
    additionalUser.company = companies[0]; // Asignar la primera compañía
    additionalUser.imgProfile = "https://i.postimg.cc/7hR9Z5NW/avatardashboard.png";


    users.push(additionalUser);

    const UserAdmin = new UserEntity();
    UserAdmin.email = 'admin@gmail.com';
    UserAdmin.password = await bcrypt.hash(UserAdmin.email, 10); // Contraseña = email
    UserAdmin.Names = 'Admin';
    UserAdmin.LastName = 'Example';
    UserAdmin.Position = 'Admin';
    UserAdmin.verifiedEmail = true;
    UserAdmin.mfaEnabled = false;
    UserAdmin.mfaBackupCodes = '';
    UserAdmin.mfaSecret = '';
    UserAdmin.mfaVerified = null;
    UserAdmin.createdAt = new Date();
    UserAdmin.modifiedAt = new Date();
    UserAdmin.isAdmin = true;
    UserAdmin.company = companies[1]; // Asignar la segunda compañía
    UserAdmin.imgProfile = "https://i.postimg.cc/7hR9Z5NW/avatardashboard.png";


    users.push(UserAdmin);

    const caroAdmin = new UserEntity();
    caroAdmin.email = 'carotobarj@gmail.com';
    caroAdmin.password = await bcrypt.hash(caroAdmin.email, 10); // Contraseña = email
    caroAdmin.Names = 'Carolina';
    caroAdmin.LastName = 'Tobar Jaramillo';
    caroAdmin.Position = 'Admin';
    caroAdmin.verifiedEmail = true;
    caroAdmin.mfaEnabled = false;
    caroAdmin.mfaBackupCodes = '';
    caroAdmin.mfaSecret = '';
    caroAdmin.mfaVerified = null;
    caroAdmin.createdAt = new Date();
    caroAdmin.modifiedAt = new Date();
    caroAdmin.isAdmin = true;
    caroAdmin.company = companies[6]; // Asignar la segunda compañía
    caroAdmin.imgProfile = "https://i.postimg.cc/wBhCjW4F/hello-kitty.jpg";

    users.push(caroAdmin);

    const frankAdmin = new UserEntity();
    frankAdmin.email = 'franklingomez.pe@gmail.com';
    frankAdmin.password = await bcrypt.hash(frankAdmin.email, 10); // Contraseña = email
    frankAdmin.Names = 'Frank';
    frankAdmin.LastName = 'GP';
    frankAdmin.Position = 'Admin';
    frankAdmin.verifiedEmail = true;
    frankAdmin.mfaEnabled = false;
    frankAdmin.mfaBackupCodes = '';
    frankAdmin.mfaSecret = '';
    frankAdmin.mfaVerified = null;
    frankAdmin.createdAt = new Date();
    frankAdmin.modifiedAt = new Date();
    frankAdmin.isAdmin = true;
    frankAdmin.company = companies[6]; // Asignar la segunda compañía
    frankAdmin.imgProfile = "https://i.postimg.cc/15c4wxR6/frank.jpg";

    users.push(frankAdmin);

    const gioAdmin = new UserEntity();
    gioAdmin.email = 'giovannamartinezrusso@gmail.com';
    gioAdmin.password = await bcrypt.hash(gioAdmin.email, 10); // Contraseña = email
    gioAdmin.Names = 'Gio';
    gioAdmin.LastName = 'MR';
    gioAdmin.Position = 'Admin';
    gioAdmin.verifiedEmail = true;
    gioAdmin.mfaEnabled = false;
    gioAdmin.mfaBackupCodes = '';
    gioAdmin.mfaSecret = '';
    gioAdmin.mfaVerified = null;
    gioAdmin.createdAt = new Date();
    gioAdmin.modifiedAt = new Date();
    gioAdmin.isAdmin = true;
    gioAdmin.company = companies[6]; // Asignar la segunda compañía
    gioAdmin.imgProfile = "https://i.postimg.cc/bwmJVQtw/gio.jpg";

    users.push(gioAdmin);

    const vaneAdmin = new UserEntity();
    vaneAdmin.email = 'buchervanesa@gmail.com';
    vaneAdmin.password = await bcrypt.hash(vaneAdmin.email, 10); // Contraseña = email
    vaneAdmin.Names = 'Vane';
    vaneAdmin.LastName = 'Bucher';
    vaneAdmin.Position = 'Admin';
    vaneAdmin.verifiedEmail = true;
    vaneAdmin.mfaEnabled = false;
    vaneAdmin.mfaBackupCodes = '';
    vaneAdmin.mfaSecret = '';
    vaneAdmin.mfaVerified = null;
    vaneAdmin.createdAt = new Date();
    vaneAdmin.modifiedAt = new Date();
    vaneAdmin.isAdmin = true;
    vaneAdmin.company = companies[6]; // Asignar la segunda compañía
    vaneAdmin.imgProfile = "https://i.postimg.cc/rFcw8hGp/vane.jpg";

    users.push(vaneAdmin);

    const feliAdmin = new UserEntity();
    feliAdmin.email = 'fhdzleon@gmail.com';
    feliAdmin.password = await bcrypt.hash(feliAdmin.email, 10); // Contraseña = email
    feliAdmin.Names = 'Felipe';
    feliAdmin.LastName = 'Leon';
    feliAdmin.Position = 'Admin';
    feliAdmin.verifiedEmail = true;
    feliAdmin.mfaEnabled = false;
    feliAdmin.mfaBackupCodes = '';
    feliAdmin.mfaSecret = '';
    feliAdmin.mfaVerified = null;
    feliAdmin.createdAt = new Date();
    feliAdmin.modifiedAt = new Date();
    feliAdmin.isAdmin = true;
    feliAdmin.company = companies[6]; // Asignar la segunda compañía
    feliAdmin.imgProfile = "https://i.postimg.cc/L6MnJ4S2/feli.jpg";

    users.push(feliAdmin);

    const ricardoAdmin = new UserEntity();
    ricardoAdmin.email = 'ricardoaot@gmail.com';
    ricardoAdmin.password = await bcrypt.hash(ricardoAdmin.email, 10); // Contraseña = email
    ricardoAdmin.Names = 'Ricardo';
    ricardoAdmin.LastName = 'AOT';
    ricardoAdmin.Position = 'Admin';
    ricardoAdmin.verifiedEmail = true;
    ricardoAdmin.mfaEnabled = false;
    ricardoAdmin.mfaBackupCodes = '';
    ricardoAdmin.mfaSecret = '';
    ricardoAdmin.mfaVerified = null;
    ricardoAdmin.createdAt = new Date();
    ricardoAdmin.modifiedAt = new Date();
    ricardoAdmin.isAdmin = true;
    ricardoAdmin.company = companies[6]; // Asignar la segunda compañía
    ricardoAdmin.imgProfile = "https://i.postimg.cc/y60NCqZ5/ricardo.jpg";

    users.push(ricardoAdmin);

    const joseAdmin = new UserEntity();
    joseAdmin.email = 'jmgg.95n@gmail.com';
    joseAdmin.password = await bcrypt.hash(joseAdmin.email, 10); // Contraseña = email
    joseAdmin.Names = 'Jose';
    joseAdmin.LastName = 'Miguel';
    joseAdmin.Position = 'Admin';
    joseAdmin.verifiedEmail = true;
    joseAdmin.mfaEnabled = false;
    joseAdmin.mfaBackupCodes = '';
    joseAdmin.mfaSecret = '';
    joseAdmin.mfaVerified = null;
    joseAdmin.createdAt = new Date();
    joseAdmin.modifiedAt = new Date();
    joseAdmin.isAdmin = true;
    joseAdmin.company = companies[6]; // Asignar la segunda compañía
    joseAdmin.imgProfile = "https://i.postimg.cc/P5XJM6N7/jose.jpg";

    users.push(joseAdmin);

    const fedeAdmin = new UserEntity();
    fedeAdmin.email = 'federico.giusti@bpventures.com.ar';
    fedeAdmin.password = await bcrypt.hash(fedeAdmin.email, 10); // Contraseña = email
    fedeAdmin.Names = 'Federico';
    fedeAdmin.LastName = 'Giusti';
    fedeAdmin.Position = 'Admin';
    fedeAdmin.verifiedEmail = true;
    fedeAdmin.mfaEnabled = false;
    fedeAdmin.mfaBackupCodes = '';
    fedeAdmin.mfaSecret = '';
    fedeAdmin.mfaVerified = null;
    fedeAdmin.createdAt = new Date();
    fedeAdmin.modifiedAt = new Date();
    fedeAdmin.isAdmin = true;
    fedeAdmin.company = companies[6]; // Asignar la segunda compañía
    fedeAdmin.imgProfile = "https://i.postimg.cc/Qx312GfY/fede.jpg";

    users.push(fedeAdmin);

    // Guardar todos los usuarios en la base de datos
    await this.userRepository.save(users);
    console.info('Seeded 27 users');
  }
}
