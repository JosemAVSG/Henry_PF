import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../entities/user.entity';
import { hashPassword, isValidPassword } from '../../utils/hash';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import { MailService } from '../mail/mail.service';
import { SignUpDto } from 'src/modules/auth/dtos/signup.dto';
import { Company } from 'src/entities/company.entity';
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    private mailService: MailService, // Inject MailService

  ) {}

  // Método para verificar si el correo electrónico ya existe
  async checkEmailExists(email: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { email: email } });
    return !!user;
  }

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
  
    // Verificar si el usuario ya existe
    const userExists = await this.userRepository.findOne({
      where: { email: body.email },
    });
    if (userExists) throw new BadRequestException('User already exists');
  
    // Verificar si la compañía existe si se proporciona companyId
    let company = null;
    if (body.companyId) {
      company = await this.companyRepository.findOne({ where: { id: body.companyId } });
      if (!company) {
        throw new BadRequestException('Company not found');
      }
    }
  
    // Guardar la contraseña sin cifrar para el correo
    const plainPassword = body.password; 
    const hashedPassword = await hashPassword(body.password);
    body.password = hashedPassword;
  
    // Crear el usuario y asignar la compañía si está presente
    const user = this.userRepository.create({
      ...body,
      company: company,  // Asignar la compañía al usuario
    });
  
    // Guardar el usuario en la base de datos
    const userSave = await this.userRepository.save(user);
  
    // Función para cifrar un mensaje usando XOR y convertirlo a hexadecimal
    function encryptToHex(text: string, key: string) {
      let encryptedHex = '';
      for (let i = 0; i < text.length; i++) {
        const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
        encryptedHex += charCode.toString(16).padStart(2, '0');
      }
      return encryptedHex;
    }
  
    // Cifrar el mensaje
    const encryptedHexMessage = encryptToHex(body.email, 'secretkey');
  
    // Utilizar el dominio recibido desde el frontend
    const resetLink = `${body.domain}/forgotPassword/${encryptedHexMessage}`;
  
    // URL de la imagen del logo
    const logoUrl = 'https://i.postimg.cc/BZ5YWZCk/bpventures-logo.png';
  
    // Contenido HTML del correo
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">
        <img src="${logoUrl}" alt="BP Ventures" style="max-width: 600px; margin-top: 20px;">
        <h1>Registro Exitoso!</h1>
        <p>Hola ${body.Names},</p>
        <p>¡Gracias por registrarte en <strong>BP Ventures</strong>! A continuación, encontrarás tus datos de inicio de sesión:</p>
        <p>
        <strong>Web:</strong> ${body.domain}<br><br>
         <strong>Email:</strong> ${body.email}<br>
         <strong>Contraseña:</strong> ${plainPassword}<br>
        </p>
        <p>Puedes restablecer tu contraseña utilizando el siguiente enlace:</p>
        
        <a href="${resetLink}"
        style="font-family: 'Futura', sans-serif; background-color: #2b4168; color: white; font-weight: bold; padding: 0.5rem 1rem; border-radius: 9999px; width: 100%; outline: none; box-shadow: 0 0 0 0.2rem rgba(255, 255, 255, 0); cursor: pointer; max-width: 20em; text-decoration: none; font-size: 1em; text-align: center; display: inline-block;"
        onmouseover="this.style.backgroundColor='#1e2a44'"
        onmouseout="this.style.backgroundColor='#2b4168'"
        onfocus="this.style.boxShadow='0 0 0 0.2rem rgba(43, 65, 104, 0.5)'"
        onblur="this.style.boxShadow='0 0 0 0.2rem rgba(255, 255, 255, 0)'"
        >
        Restablecer Contraseña
        </a>
  
        <p>¡Bienvenido a nuestro equipo!</p>
        <p>Saludos cordiales,<br>Equipo de BP Ventures</p>
      </div>
    `;
  
    // Versión de texto plano del correo
    const textContent = `
      Hola ${body.Names},
  
      ¡Gracias por registrarte en BP Ventures! A continuación, te proporcionamos tus datos de acceso:
  
      Correo electrónico: ${body.email}
      Contraseña: ${plainPassword}
  
      Puedes restablecer tu contraseña utilizando el siguiente enlace:
      ${resetLink}
  
      Saludos cordiales,
      Equipo de BP Ventures
    `;
  
    // Enviar el correo electrónico
    await this.mailService.sendMail(
      body.email,
      'Bienvenido a BP Ventures - Sus datos de inicio de sesión',
      textContent,
      htmlContent,
    );
  
    return { userSave, encryptedHexMessage };
  }
  

  async forgotMyPassword(email: string, domain: string) {
    try {
      const userExists = await this.userRepository.findOne({
        where: { email: email },
      });
      if (!userExists) throw new BadRequestException('El usuario no existe');

      // Función para cifrar un mensaje usando XOR y convertirlo a hexadecimal
      function encryptToHex(text: string, key: string) {
        let encryptedHex = '';
        for (let i = 0; i < text.length; i++) {
          const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
          encryptedHex += charCode.toString(16).padStart(2, '0');
        }
        return encryptedHex;
      }

      const encryptedHexMessage = encryptToHex(email, 'secretkey');
      const resetLink = `${domain}/forgotPassword/${encryptedHexMessage}`;

      // Contenido en texto plano
      const textContent = `Hola ${userExists.Names},\n\nPuedes restablecer tu contraseña utilizando el siguiente enlace:\n\n${resetLink}\n\nSi no solicitaste un restablecimiento de contraseña, ignora este correo.\n\nSaludos cordiales,\nEquipo de BP Ventures`;

      // Contenido HTML
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">
          <img src="https://i.postimg.cc/BZ5YWZCk/bpventures-logo.png" alt="BP Ventures" style="max-width: 600px; margin-top: 20px;">

          <h1>Solicitud de Restablecimiento de Contraseña</h1>
          <p>Hola ${userExists.Names},</p>
          <p>Puedes restablecer tu contraseña utilizando el siguiente enlace:</p>

          <a href="${resetLink}"
          style="font-family: 'Futura', sans-serif; background-color: #2b4168; color: white; font-weight: bold; padding: 0.5rem 1rem; border-radius: 9999px; width: 100%; outline: none; box-shadow: 0 0 0 0.2rem rgba(255, 255, 255, 0); cursor: pointer; max-width: 20em; text-decoration: none; font-size: 1em; text-align: center; display: inline-block;"
          onmouseover="this.style.backgroundColor='#1e2a44'"
          onmouseout="this.style.backgroundColor='#2b4168'"
          onfocus="this.style.boxShadow='0 0 0 0.2rem rgba(43, 65, 104, 0.5)'"
          onblur="this.style.boxShadow='0 0 0 0.2rem rgba(255, 255, 255, 0)'"
          >
          Restablecer Contraseña
          </a>

          <p>Si no solicitaste un restablecimiento de contraseña, ignora este correo.</p>
          <p>Saludos cordiales,<br>Equipo de BP Ventures</p>
        </div>
      `;

      await this.mailService.sendMail(
        email,
        'BP Ventures - Restablecimiento de Contraseña',
        textContent, // Texto plano
        htmlContent, // Contenido HTML
      );

      return {
        message:
          '¡El enlace para restablecer la contraseña ha sido enviado a tu correo electrónico!',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
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
