
import { Controller, Post, Body, BadRequestException, Req, Get, UseGuards, Query } from '@nestjs/common';
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
    const { email, password, mfa } = Crendential;
    try {
      if (!email || !password)
        throw new BadRequestException('No credentials provided!');

      const result = await this.authService.signIn(email, password);

      if (!result) {
        throw new BadRequestException('Invalid credentials!');
      }

      if(result.mfaEnabled){
        if(!mfa) throw new BadRequestException('Two factor code is required!');
        const isValidate=  this.authService.validateMfa(mfa, result.mfaSecret);
        if(!isValidate) throw new BadRequestException('Invalid MFA code!');
      }

      const userPayload = {
        id: result.id,
        sub: result.id,
        email: result.email,
        //   roles:[result.isAdmin ? Roles.ADMIN : Roles.USER]
      };
      const token = this.jwtService.sign(userPayload);

      return { message: 'You are authenticated!', token, userPayload };
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

  @Post('reset-password')
  async resetPassword(
    @Query('token') token: string,
    @Body('newPassword') newPassword: string
  ) {
    // return  atob(token)
    console.log('token',token)
    console.log('password',newPassword);
    
    
    await this.authService.resetPassword(token, newPassword);
    return { message: 'Password has been reset successfully' };
  }

  @Get('verifyToken')
  @UseGuards(AuthGuard)
  async verifyToken(@Req() req: Request){
        const user = req.user;
        return user;
  }

  @UseGuards(AuthGuard)
  @Post('enable-mfa')
  async enableMfa(@Req() req: Request){
    try{
      const user = req.user; // suponiendo que el usuario esta logueado
      if(!user) throw new BadRequestException('No user found!');

      const secret = await this.authService.generateMfaSecret(user.email,user.id);

      const qrCode = await this.authService.generateMfaQrCode(secret);

      return { message: 'MFA enabled!', qrCode,secret:secret.base32};
    }catch(error){
      throw new BadRequestException(error);
    }

  }

  @Post('forgotPassword')
  async forgotPassword (@Body() body:{email:string}) {
    const {email} = body;
    try {
       await this.authService.forgotMyPassword(email);
      return { message: 'Password reset link has been sent to your email!' };
    } catch (error) {
      console.log(error);
      
        throw new BadRequestException(error)
    }
  }


}
