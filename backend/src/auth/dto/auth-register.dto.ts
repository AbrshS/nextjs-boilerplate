import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class AuthRegisterDto {
  @ApiProperty({ example: 'newuser@fanaye.com', description: 'User corporate or personal email' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'StrongP@ssword2026!', minLength: 8, description: 'Secure password' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiPropertyOptional({ example: 'Dawit', description: 'First name' })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Haile', description: 'Last name' })
  @IsString()
  @IsOptional()
  lastName?: string;
}
