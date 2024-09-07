import { IsEmail, IsOptional, IsString, IsBoolean, IsDate, IsNumber } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  Names?: string;

  @IsOptional()
  @IsString()
  LastName?: string;

  @IsOptional()
  @IsString()
  Position?: string;

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
  @IsDate()
  mfaVerified?: Date;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsBoolean()
  isAdmin?: boolean;

  @IsOptional()
  @IsNumber()
  companyId?: number; // Si quieres actualizar la empresa asociada al usuario
}
