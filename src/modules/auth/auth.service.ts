import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../entities/user.entity';
import { hashPassword, isValidPassword } from '../../utils/hash';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import { MailService } from '../mail/mail.service';
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

    const validPassword = await isValidPassword(password, user.password);
    if (!validPassword) throw new BadRequestException('Verification Failed');

    return user;
    }


  async signUpService(body: any) {
    const userExists = await this.userRepository.findOne({
      where: { email: body.email },
    });
    if (userExists) throw new BadRequestException('User already exists');
    const password = await hashPassword(body.password);
    body.password = password;
    const user = this.userRepository.create(body);
    const userSave = await this.userRepository.save(user);


    const email = btoa(body.email);

    const resetLink = `http://localhost:3000/auth/reset-password?token=${email}`;

     // Send a registration confirmation email
     await this.mailService.sendMail(
      body.email,
      'Welcome to BP Ventures - Password Reset',
      `Hello ${body.firstName},\n\nThank you for registering with BP Ventures! You can reset your password using the following link:\n\n${resetLink}\n\nBest regards,\nBP Ventures Team`
    );

    return userSave
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const email = atob(token);
    const user = await this.userRepository.findOne({
      where: { email: email },
    });
    if (!user) throw new BadRequestException('Invalid token');
    user.password = await hashPassword(newPassword);
    await this.userRepository.save(user);
  }
  
   validateMfa(token: string, secret:string):boolean {
    return speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
    })
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
