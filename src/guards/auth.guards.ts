import { CanActivate,  ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Observable } from "rxjs";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService){}

    canActivate(
        context: ExecutionContext
    ): boolean | Promise<boolean> | Observable<boolean> {
        
        const request = context.switchToHttp().getRequest();

        const token = request.headers['authorization']?.split(' ')[1] ?? '';
    
        if(!token){
            throw new UnauthorizedException('Bearer Token not found')
        }

        try {
            const secret = process.env.TOKEN_SECRET;
            const payLoad =  this.jwtService.verify(
                token,
                {secret: secret}
            )
            request.user = payLoad
            return true
        }
        catch(error){
            throw new UnauthorizedException('Invalid Bearer Token')
        }
    }
}
