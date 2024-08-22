import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../entities/user.entity';
@Injectable()
export class UsersService {
  constructor(@InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>) {}

  async getUsers(
    page: number,
    Limit: number,
  ): Promise<Omit<UserEntity, 'password'>[]> {
    const results = await this.userRepository.find({
      skip: (page - 1) * Limit,
      take: Limit,
    });
    const users = results.map((user) => {
      const { password, ...usuariosinpassword } = user;
      return usuariosinpassword;
    });

    return users;
  }
}
