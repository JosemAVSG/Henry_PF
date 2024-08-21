import { Controller, Get, HttpCode, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../guards/auth.guards';
import { Request } from 'express';

@Controller('auth')
export class AuthController {

    @Get('/verifyToken')
    @HttpCode(200)
    @UseGuards(AuthGuard)
    async verifyToken(@Req() req: Request){
        console.log(req.user)
        return true
    }
}
