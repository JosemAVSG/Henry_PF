import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './modules/auth/auth.controller';
import { AuthModule } from './modules/auth/auth.module';
import {ConfigModule, ConfigService} from '@nestjs/config';
import typeorm from './config/typeOrm';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load:[typeorm]
    }),TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => config.get('typeorm'),
    }),
    AuthModule],
  controllers: [AppController, AuthController],
  providers: [AppService],
})
export class AppModule {}
