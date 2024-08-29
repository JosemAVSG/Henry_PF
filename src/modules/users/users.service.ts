import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateUserDto } from '../../interfaces/dtos/users.update.dto';
import { UserEntity } from '../../entities/user.entity';
import {PaginatedUsers} from '../../interfaces/paginatedUser';
import { hashPassword, isValidPassword } from 'src/utils/hash';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

    // Metodo para obtener todos los usuarios
   async getUsers(
    page?: number,
    Limit?: number,
  ) {

    if(page === undefined || Limit === undefined) {
      const results = await this.userRepository.find({ 
        order: { id: 'ASC' } // Ordenar por nombre ascendente
      });
      const users = results.map((user) => {
        const { password, ...usuariosinpassword } = user;
        return usuariosinpassword;
      });
      const filteredUsers = users.filter(user => user.statusId === 1 || user.statusId === 2);

      return filteredUsers;
    }

    const results = await this.userRepository.find({
      skip: (page - 1) * Limit,
      take: Limit,
      order: { id: 'ASC' } // Ordenar por nombre ascendente
    });

    const users = results.map((user) => {
      const { password, ...usuariosinpassword } = user;
      return usuariosinpassword;
    });

    const totalPages = Math.ceil((await this.userRepository.count()) / Limit);
    const filteredUsers = users.filter(user => user.statusId === 1 || user.statusId === 2);

    const data = { users: filteredUsers, totalPages };
    return data;
    }
  
    async updateUser(
      id: number,
      updateUser: UpdateUserDto,
    ) {
      const user = await this.userRepository.findOne({ where: { id } });
    console.log('update user',user)
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
    
      const updatedUser = { ...user, ...updateUser };
      updatedUser.modifiedAt = new Date(); // Actualizar la fecha de modificación
    
      // if (updateUser.oldPassword) {
      //   const validPassword = await isValidPassword(updateUser.oldPassword, user.password);
      //   if (!validPassword) {
      //     throw new UnauthorizedException(`Invalid old password`);
      //   }
      // }
    
      if (updateUser.password) {
        updatedUser.password = await hashPassword(updateUser.password);
      }
    
      const savedUser = await this.userRepository.save(updatedUser);
      
      const { password, ...userWithoutPassword } = savedUser;
      console.log(userWithoutPassword);
      
      const filteredUser = userWithoutPassword;

      return filteredUser;
    }
    

  // Método para obtener un usuario por su ID
  async getUserById(id: number): Promise<Omit<UserEntity, 'password'>> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    const { password, ...usuariosinpassword } = user;
    return usuariosinpassword;
  }

  
  // Método para actualizar el estado de un usuario
  async updateUserStatus(userId: number, statusId: number) {
    const result = await this.userRepository.update(userId, {statusId: statusId});

    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return {message:"User status updated"};
  }


  // Método para eliminar un usuario
  async deleteUser(id: number) {
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
