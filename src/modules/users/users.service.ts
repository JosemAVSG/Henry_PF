import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateUserDto } from './dtos/users.update.dto';
import { UserEntity } from 'src/entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async updateUser(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserEntity> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const updatedUser = Object.assign(user, updateUserDto);
    updatedUser.modifiedAt = new Date(); // Actualizar la fecha de modificación

    return this.userRepository.save(updatedUser);
  }

  // Método para obtener un usuario por su ID
  async getUserById(id: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  // Método para eliminar un usuario
  async deleteUser(id: string) {
    const result = await this.userRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return result;
  }

  // Método para verificar un email
  async verifyEmail(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    user.verifiedEmail = true;
    return await this.userRepository.save(user);
  }
}
