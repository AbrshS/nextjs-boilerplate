import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Role, Status } from '../domain/user';

export class QueryUserDto {
  @ApiPropertyOptional({ default: 1 })
  @Transform(({ value }) => (value ? Number(value) : 1))
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ default: 10 })
  @Transform(({ value }) => (value ? Number(value) : 10))
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Filter by search term in email, firstName, or lastName' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ enum: Role })
  @IsEnum(Role)
  @IsOptional()
  role?: Role;

  @ApiPropertyOptional({ enum: Status })
  @IsEnum(Status)
  @IsOptional()
  status?: Status;
}
