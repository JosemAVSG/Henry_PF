import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST, // Dirección del servidor SMTP
      port: Number(process.env.EMAIL_PORT), // Puerto del servidor SMTP
      secure: process.env.EMAIL_PORT === '465', // true para 465, false para otros puertos (TLS)
      auth: {
        user: process.env.EMAIL_USER, // Tu dirección de correo
        pass: process.env.EMAIL_PASS, // Tu contraseña o contraseña específica para aplicaciones
      },
      tls: {
        rejectUnauthorized: false, // Configuración opcional para aceptar certificados autofirmados
      },
    });
  }

  async sendMail(to: string, subject: string, text: string, html?: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `"Equipo de BP Ventures" <${process.env.EMAIL_USER}>`, // Dirección del remitente
        to, // Dirección del destinatario
        subject, // Asunto del correo
        text, // Texto plano del correo
        html, // (Opcional) Contenido HTML del correo
      });
      console.log(`Email sent to ${to}`);
    } catch (error) {
      console.error(`Failed to send email: ${error.message}`);
      throw new Error('Email sending failed');
    }
  }
}
