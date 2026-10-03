import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class AuthEmailLoginDto {
  @ApiProperty({ example: 'admin@fanaye.com', description: 'Registered user email' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Fanaye@Admin2026!', description: 'User password' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
