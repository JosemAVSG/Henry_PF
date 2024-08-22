import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UserSeeder } from './modules/seed/user-seeder';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const userSeeder = app.get(UserSeeder);
  await userSeeder.seed();
  await app.listen(3000);
}
bootstrap();
