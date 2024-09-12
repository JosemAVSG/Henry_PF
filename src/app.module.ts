import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {ConfigModule, ConfigService} from '@nestjs/config';
import typeorm from './config/typeOrm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from './modules/users/users.module';
import { SeedModule } from './modules/seed/seed.module';
import { MailModule } from './modules/mail/mail.module';
import { DeliverablesModule } from './modules/deliverables/deliverables.module';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { VouchersModule } from './modules/vouchers/vouchers.module';
import { CompaniesModule } from './modules/company/companies.module';
import { NotificationsModule } from './websockets/notifications/notifications.module';

@Module({
  imports: [CompaniesModule, AuthModule, UserModule, SeedModule,MailModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load:[typeorm]
    }),TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => config.get('typeorm'),
    }),
    JwtModule.register({
      secret:  process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
      global: true
    }),
    DeliverablesModule,
    VouchersModule,
    InvoicesModule,
    NotificationsModule,    
    ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
