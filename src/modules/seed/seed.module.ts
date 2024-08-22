import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserSeeder } from './user-seeder';
import { UserEntity } from 'src/entities/user.entity';
// import { UserEntity } from './user.entity';
// import { UserSeeder } from './seeders/user-seeder';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  providers: [UserSeeder],
})
export class SeedModule {}
