import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {ConfigModule, ConfigService} from '@nestjs/config';
import typeorm from './config/typeOrm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from './interfaces/dtos/users.module';

@Module({
  imports: [AuthModule, UserModule,
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
    ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
