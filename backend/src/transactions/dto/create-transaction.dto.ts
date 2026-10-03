import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, IsUUID } from 'class-validator';
import { TransactionStatus } from '../domain/transaction';

export class CreateTransactionDto {
  @ApiProperty({ description: 'Target User UUID' })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ example: 450.00, description: 'Transaction monetary amount' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount: number;

  @ApiPropertyOptional({ example: 'USD', default: 'USD' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({ enum: TransactionStatus, default: TransactionStatus.PENDING })
  @IsEnum(TransactionStatus)
  @IsOptional()
  status?: TransactionStatus;

  @ApiProperty({ example: 'TX-2026-98124', description: 'Unique transaction reference code' })
  @IsString()
  @IsNotEmpty()
  reference: string;

  @ApiPropertyOptional({ example: 'Enterprise Annual Cloud License', description: 'Transaction description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'Subscription', description: 'Transaction category' })
  @IsString()
  @IsOptional()
  category?: string;
}
