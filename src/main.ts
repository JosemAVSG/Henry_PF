import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UserSeeder } from './modules/seed/user-seeder';
import { DeliverableSeeder } from './modules/seed/deliverable.seeder';
import { DeliverableTypeSeeder } from './modules/seed/deliverableType.seeder';
import { InvoiceStatusSeeder } from './modules/seed/invoiceStatus.seeder';
import { PermissionTypeSeeder } from './modules/seed/permissionType.seeder';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { DeliverableCategorySeeder } from './modules/seed/deliverableCategory.seeder';
import * as fs from 'fs';
import { PermissionSeeder } from './modules/seed/permission.seeder';
import * as morgan from 'morgan';  // Importa morgan
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { CompanySeeder } from './modules/seed/company-seeder';
import { InvoiceSeeder } from './modules/seed/invoices-seeder';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Configura la carpeta 'uploads' como pública
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });
  
  // Configura morgan para registrar las solicitudes HTTP
  app.use(morgan('dev'));  // 'combined' es un formato predefinido de morgan

  app.enableCors({
    origin:'*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  });
  const companySeeder = app.get(CompanySeeder);
  await companySeeder.seed();

  const userSeeder = app.get(UserSeeder);
  await userSeeder.seed();

  const deliverableTypeSeeder = app.get(DeliverableTypeSeeder)
  await deliverableTypeSeeder.seedDeliverableType();

  const deliverableCategorySeeder = app.get(DeliverableCategorySeeder)
  await deliverableCategorySeeder.seedDeliverableCategory();

  const invoiceStatusSeeder = app.get(InvoiceStatusSeeder)
  await invoiceStatusSeeder.seedInvoiceStatus();

  const permissionTypeSeeder = app.get(PermissionTypeSeeder)
  await permissionTypeSeeder.seedPermissionType();

  const deliverableSeeder = app.get(DeliverableSeeder)
  await deliverableSeeder.seedDeliverable();

  const permissionSeeder = app.get(PermissionSeeder)
  await permissionSeeder.seedPermission();

  const invoiceSeeder = app.get(InvoiceSeeder);
  await invoiceSeeder.seed();

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
