import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UserSeeder } from './modules/seed/user-seeder';
import { DeliverableTypeSeeder } from './modules/seed/deliverableType.seeder';
import { InvoiceStatusSeeder } from './modules/seed/invoiceStatus.seeder';
import { PermissionTypeSeeder } from './modules/seed/permissionType.seeder';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';

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

  const config = new DocumentBuilder()
  .setTitle('BP Ventures API')
  .setDescription('Endpoints de BP Ventures')
  .setVersion('1.0')
  .addServer('https://api.1rodemayo.com')  // Reemplaza con tu dominio
  .build();

  const document = SwaggerModule.createDocument(app, config);

   // Configura la ruta para acceder a Swagger
   SwaggerModule.setup('api', app, document);

   // Guarda la especificación en un archivo JSON
   fs.writeFileSync('./swagger-spec.json', JSON.stringify(document, null, 2));
 

  await app.listen(3000);
}
bootstrap();
