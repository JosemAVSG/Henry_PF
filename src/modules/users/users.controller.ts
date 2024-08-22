import { Controller, Put, Param, Body, Delete, Get } from '@nestjs/common';
import { UserService } from './users.service';
import { UpdateUserDto } from './dtos/users.update.dto';
import { UserEntity } from 'src/entities/user.entity';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserEntity> {
    return this.userService.updateUser(id, updateUserDto);
  }

  // Endpoint para obtener un usuario por su ID
  @Get(':id')
  async getUserById(@Param('id') id: string): Promise<UserEntity> {
    return this.userService.getUserById(id);
  }

  // Endpoint para eliminar un usuario
  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return this.userService.deleteUser(id);
  }

  // Endpoint para verificar el email de un usuario
  @Put('verify-email/:email')
  async verifyEmail(@Param('email') email: string) {
    return this.userService.verifyEmail(email);
  }
}
