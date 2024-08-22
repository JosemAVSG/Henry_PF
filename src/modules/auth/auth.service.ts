import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../entities/user.entity';
import { isValidPassword } from '../../utils/hash';

@Injectable()
export class AuthService {
    constructor(@InjectRepository(UserEntity) private userRepository: Repository<UserEntity> ) {
    }

    async signIn(email: string, password: string): Promise<UserEntity | null> {
 
    const user = await this.userRepository.findOne({where: {email: email}});
    
    if(!user) throw new BadRequestException('Verification Failed');

     const validPassword = await isValidPassword(password, user.password);
    if(!validPassword) throw new BadRequestException('Verification Failed');
    
    return user;
    }


}
