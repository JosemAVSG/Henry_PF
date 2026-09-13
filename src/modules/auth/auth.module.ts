import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../../entities/user.entity';
import { MailService } from '../mail/mail.service';
import { Company } from 'src/entities/company.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, Company]), // Incluir Company en los imports
  ],
  controllers: [AuthController],
  providers: [AuthService, MailService],
})
export class AuthModule {}
