import { Controller, Get, NotFoundException, Query, Param, Body, Delete,Put} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from '../../interfaces/dtos/users.update.dto';
import { UserEntity } from 'src/entities/user.entity';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UsersService) {}

  @Get()
  async getUsers(@Query() page: number, @Query() Limit: number) {
    const pageNumber = Number(page) || 1;
    const LimitNumber = Number(Limit) || 5;

    try {
      return await this.userService.getUsers(pageNumber, LimitNumber);
    } catch (error) {
      throw new NotFoundException(error);
    }
  }

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

  //Endpoint para actualizar el estado del usuario
  @Put('status/:userId/:statusId')
  async updateUserStatus(
    @Param('userId') userId: string, 
    @Param('statusId') statusId: number, 
  ) {
    return this.userService.updateUserStatus(userId, statusId);
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
