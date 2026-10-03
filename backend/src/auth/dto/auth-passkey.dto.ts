import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class PasskeyRegisterOptionsDto {
  @ApiProperty({ example: 'admin@fanaye.com', description: 'User email to associate passkey with' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class PasskeyRegisterVerifyDto {
  @ApiProperty({ example: 'admin@fanaye.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'WebAuthn navigator.credentials.create() response JSON' })
  @IsNotEmpty()
  response: any;
}

export class PasskeyAuthOptionsDto {
  @ApiPropertyOptional({ example: 'admin@fanaye.com', description: 'Optional user email for targeted challenge' })
  @IsEmail()
  @IsOptional()
  email?: string;
}

export class PasskeyAuthVerifyDto {
  @ApiProperty({ example: 'admin@fanaye.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'WebAuthn navigator.credentials.get() response JSON' })
  @IsNotEmpty()
  response: any;
}
