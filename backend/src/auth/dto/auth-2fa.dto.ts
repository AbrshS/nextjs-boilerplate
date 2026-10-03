import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, Length } from 'class-validator';

export class Auth2FaVerifyDto {
  @ApiProperty({ description: 'User UUID returned by 2FA challenge' })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ example: '123456', description: '6-digit TOTP authenticator code' })
  @IsString()
  @Length(6, 6)
  @IsNotEmpty()
  code: string;
}
