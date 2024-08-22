
import { Controller, Post, Body, BadRequestException, Req, Get, UseGuards } from '@nestjs/common';
import { SingInDto } from '../../interfaces/dtos/singIn.dto';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { SignUpDto } from '../../interfaces/dtos/signup.dto';
import { AuthGuard } from '../../guards/auth.guards';
import { Request } from 'express';
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('signin')
  async signIn(@Body() Crendential: SingInDto) {
    const { email, password } = Crendential;
    try {
      if (!email || !password)
        throw new BadRequestException('No credentials provided!');

      const result = await this.authService.signIn(email, password);

      if (!result) {
        throw new BadRequestException('Invalid credentials!');
      }

      const userPayload = {
        id: result.id,
        sub: result.id,
        email: result.email,
        //   roles:[result.isAdmin ? Roles.ADMIN : Roles.USER]
      };
      const token = this.jwtService.sign(userPayload);

      return { message: 'You are authenticated!', token };
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

  @Get('verifyToken')
  @UseGuards(AuthGuard)
  async verifyToken(@Req() req: Request){
        const user = req.user;
        return user;
    }
}
