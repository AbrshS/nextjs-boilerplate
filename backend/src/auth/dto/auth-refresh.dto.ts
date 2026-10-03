import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AuthRefreshDto {
  @ApiProperty({ description: 'Valid JWT refresh token' })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
