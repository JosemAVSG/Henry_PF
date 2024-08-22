import {
  Controller,
  Post,
  Body,
  Get,
  BadRequestException,
  Res,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { SingInDto } from '../../interfaces/singIn.dto';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { SignUpDto } from 'src/interfaces/signup.dto';
// import { SignUpDto } from 'src/entities/signup.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('signin')
  async signIn(@Body() Crendential: SingInDto, @Res() res: Response) {
    const { email, password } = Crendential;
    try {
      if (!email || !password)
        throw new BadRequestException('No credentials provided!');

      const result = await this.authService.signIn(email, password);

      if (!result) {
        res.status(400).send({ message: 'Invalid credentials!' });
      }

      const userPayload = {
        id: result.id,
        sub: result.id,
        email: result.email,
        //   roles:[result.isAdmin ? Roles.ADMIN : Roles.USER]
      };
      const token = this.jwtService.sign(userPayload);

      res.status(200).send({ message: 'You are authenticated!', token });
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @Post('signup')
  async signUp(@Body() body: SignUpDto) {
    try {
      return await this.authService.signUpService(body);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
