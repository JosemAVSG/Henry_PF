import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        const timestamp = new Date().toLocaleDateString();
        console.log(`Request: ${timestamp} ${req.method} ${req.url}`);
        next();
    }
}