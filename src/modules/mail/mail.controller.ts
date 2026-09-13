import { Controller, Post, Body } from '@nestjs/common';
import { MailService } from './mail.service';

@Controller('email')
export class EmailController {
  constructor(private readonly mailService: MailService) {}

  @Post('/send')
  async sendEmail(@Body() body: { to: string; subject: string; text: string }) {
    const { to, subject, text } = body;
    await this.mailService.sendMail(to, subject, text);
    return { message: 'Email sent successfully' };
  }
}
