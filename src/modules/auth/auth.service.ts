import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../entities/user.entity';
import { hashPassword, isValidPassword } from '../../utils/hash';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import { MailService } from '../mail/mail.service';
import { SignUpDto } from 'src/interfaces/dtos/signup.dto';
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private mailService: MailService, // Inject MailService
  ) {}

  async signIn(email: string, password: string): Promise<UserEntity | null> {
    const user = await this.userRepository.findOne({ where: { email: email } });

    if (!user) throw new BadRequestException('Verification Failed');
    if (user.statusId === 1) {
      const validPassword = await isValidPassword(password, user.password);
      if (!validPassword) throw new BadRequestException('Verification Failed');
      return user;
    } else {
      throw new BadRequestException('User no Active');
    }
  }

  async signUpService(body: SignUpDto) {
    console.log('body', body);
    const userExists = await this.userRepository.findOne({
      where: { email: body.email },
    });
    if (userExists) throw new BadRequestException('User already exists');
    const password = await hashPassword(body.password);
    body.password = password;
    const user = this.userRepository.create(body);
    const userSave = await this.userRepository.save(user);
    // Función para cifrar un mensaje usando XOR y convertirlo a hexadecimal
    function encryptToHex(text, key) {
      let encryptedHex = '';
      for (let i = 0; i < text.length; i++) {
        const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
        encryptedHex += charCode.toString(16).padStart(2, '0'); // Convierte a hexadecimal y rellena con ceros si es necesario
      }
      return encryptedHex;
    }
    // Cifrar el mensaje
    const encryptedHexMessage = encryptToHex(body.email, 'secretkey');
    // Utiliza el dominio recibido desde el frontend
    const resetLink = `${body.domain}/forgotPassword/${encryptedHexMessage}`;
    await this.mailService.sendMail(
      body.email,
      'Welcome to BP Ventures - Password Reset',
      `Hello ${body.Names},\n\nThank you for registering with BP Ventures! You can reset your password using the following link:\n\n${resetLink}\n\nBest regards,\nBP Ventures Team`,
    );
    return { userSave, encryptedHexMessage };
  }

  async forgotMyPassword(email: string, domain: string) {
    try {
      const userExists = await this.userRepository.findOne({
        where: { email: email },
      });
      if (!userExists) throw new BadRequestException('User does not exists');
      // Función para cifrar un mensaje usando XOR y convertirlo a hexadecimal
      function encryptToHex(text, key) {
        let encryptedHex = '';
        for (let i = 0; i < text.length; i++) {
          const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
          encryptedHex += charCode.toString(16).padStart(2, '0'); // Convierte a hexadecimal y rellena con ceros si es necesario
        }
        return encryptedHex;
      }

      // Cifrar el mensaje
      const encryptedHexMessage = encryptToHex(email, 'secretkey');
      const resetLink = `${domain}/forgotPassword/${encryptedHexMessage}`; // Usar el dominio del frontend
      await this.mailService.sendMail(
        email,
        'BP Ventures - Password Reset',
        `Hello ${userExists.Names},\n\nYou can reset your password using the following link:\n\n${resetLink}\n\nBest regards,\nBP Ventures Team`,
      );
      return { message: 'Password reset link has been sent to your email!' };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    function decryptFromHex(encryptedHex: string, key: string) {
      let decryptedText = '';
      for (let i = 0; i < encryptedHex.length; i += 2) {
        const hexPair = encryptedHex.slice(i, i + 2);
        const charCode =
          parseInt(hexPair, 16) ^ key.charCodeAt((i / 2) % key.length);
        decryptedText += String.fromCharCode(charCode);
      }
      return decryptedText;
    }

    const decryptedMessage = decryptFromHex(token.toString(), 'secretkey');

    const user = await this.userRepository.findOne({
      where: { email: decryptedMessage },
    });

    if (!user) throw new BadRequestException('Invalid token');
    user.password = await hashPassword(newPassword);
    await this.userRepository.save(user);
  }

  validateMfa(token: string, secret: string): boolean {
    return speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
    });
  }

  async generateMfaSecret(email: string, userId: string) {
    const secret = speakeasy.generateSecret({
      name: `BP Ventures (${email})`,
      length: 20,
    });

    await this.userRepository.update(userId, {
      mfaSecret: secret.base32,
      mfaEnabled: true,
    });

    return secret;
  }

  async generateMfaQrCode(secret: speakeasy.GeneratedSecret) {
    const otpAuthUrl = secret.otpauth_url;
    return await qrcode.toDataURL(otpAuthUrl);
  }
}
