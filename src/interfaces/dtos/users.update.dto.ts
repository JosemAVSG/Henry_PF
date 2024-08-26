import { IsOptional, IsString, IsBoolean, IsDateString } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  oldPassword?: string;

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
  @IsDateString()
  mfaVerified?: Date;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
