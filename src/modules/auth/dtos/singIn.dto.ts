import { IsEmail, IsNotEmpty, IsOptional, IsString, Length, Matches } from "class-validator";
export class SingInDto {

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsString() 
    @IsNotEmpty()
    @Length(8, 15)
    @Matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%._^&*])/, 
    { message: 'password must contain at least one lowercase letter, one uppercase letter, one number, and one special character',  })   
    password: string;
    
    @IsOptional()
    @IsString()
    mfa: string
}
