import { Controller, Get, NotFoundException, Query, Res } from '@nestjs/common';
import { UsersService } from './users.service';
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getUsers(@Query() page: number, @Query() Limit: number) {
    const pageNumber = Number(page) || 1;
    const LimitNumber = Number(Limit) || 5;

    try {
      return await this.usersService.getUsers(pageNumber, LimitNumber);
    } catch (error) {
      throw new NotFoundException(error);
    }
  }
}
