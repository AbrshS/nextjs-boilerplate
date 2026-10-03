import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { TransactionStatus } from '../domain/transaction';

export class QueryTransactionDto {
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

  @ApiPropertyOptional({ enum: TransactionStatus })
  @IsEnum(TransactionStatus)
  @IsOptional()
  status?: TransactionStatus;

  @ApiPropertyOptional({ description: 'Filter by search term across reference, description, category' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by specific user UUID' })
  @IsUUID()
  @IsOptional()
  userId?: string;
}
