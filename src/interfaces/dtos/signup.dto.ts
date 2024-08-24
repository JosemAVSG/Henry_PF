import { IsEmail, IsNotEmpty, IsBoolean, IsString, IsOptional } from 'class-validator';

export class SignUpDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  Names: string;

  @IsOptional()
  @IsString()
  LastName: string;

  @IsOptional()
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
