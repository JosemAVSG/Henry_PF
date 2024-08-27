import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UserSeeder } from './modules/seed/user-seeder';
import { DeliverableTypeSeeder } from './modules/seed/deliverableType.seeder';
import { InvoiceStatusSeeder } from './modules/seed/invoiceStatus.seeder';
import { PermissionTypeSeeder } from './modules/seed/permissionType.seeder';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin:'*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  });
  const userSeeder = app.get(UserSeeder);
  await userSeeder.seed();

  const deliverableTypeSeeder = app.get(DeliverableTypeSeeder)
  await deliverableTypeSeeder.seedDeliverableType();

  const invoiceStatusSeeder = app.get(InvoiceStatusSeeder)
  await invoiceStatusSeeder.seedInvoiceStatus();

  const permissionTypeSeeder = app.get(PermissionTypeSeeder)
  await permissionTypeSeeder.seedPermissionType();

  await app.listen(3000);
}
bootstrap();
