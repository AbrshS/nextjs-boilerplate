import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({ description: 'Enable or disable 2FA status' })
  @IsBoolean()
  @IsOptional()
  isTwoFactorEnabled?: boolean;

  @ApiPropertyOptional({ description: 'TOTP 2FA secret' })
  @IsString()
  @IsOptional()
  twoFactorSecret?: string;

  @ApiPropertyOptional({ description: 'Consecutive failed login attempts' })
  @IsOptional()
  failedLoginAttempts?: number;

  @ApiPropertyOptional({ description: 'Account lockout expiration timestamp' })
  @IsOptional()
  lockoutExpiresAt?: Date | null;
}
