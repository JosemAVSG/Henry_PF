import { IsEmail, IsNotEmpty, IsBoolean, IsString, IsOptional } from 'class-validator';

export class SignUpDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  Names: string;

  @IsNotEmpty()
  @IsString()
  LastName: string;

  @IsNotEmpty()
  @IsString()
  Position: string;

  @IsOptional()
  @IsBoolean()
  verifiedEmail?: boolean;

  @IsOptional()
  @IsBoolean()
  mfaEnabled?: boolean;

  @IsOptional()
  @IsString()
  mfaBackupCodes?: string;

  @IsOptional()
  @IsString()
  mfaSecret?: string;

  @IsOptional()
  mfaVerified?: Date;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
