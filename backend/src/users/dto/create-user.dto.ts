import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { Role, Status } from '../domain/user';

export class CreateUserDto {
  @ApiProperty({ example: 'developer@fanaye.com', description: 'Unique user email address' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({ example: 'SecurePassword123!', description: 'User password (optional for SSO/Passkeys)' })
  @IsString()
  @IsOptional()
  @MinLength(8)
  password?: string;

  @ApiPropertyOptional({ example: 'Abebe', description: 'User first name' })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Kebede', description: 'User last name' })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({ enum: Role, default: Role.USER, description: 'Assigned system role' })
  @IsEnum(Role)
  @IsOptional()
  role?: Role;

  @ApiPropertyOptional({ enum: Status, default: Status.ACTIVE, description: 'Initial account status' })
  @IsEnum(Status)
  @IsOptional()
  status?: Status;
}
