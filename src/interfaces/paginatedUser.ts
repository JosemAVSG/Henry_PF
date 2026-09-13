import { UserEntity } from '../entities/user.entity';

export interface PaginatedUsers {
  users: Omit<UserEntity, 'password'>[];
  totalPages: number;
}
