import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { EmailController } from './mail.controller';

@Module({
  imports: [],
  providers: [MailService],
  controllers: [EmailController],
  exports: [MailService], // Export MailService if you want to use it in other modules
})
export class MailModule {}
