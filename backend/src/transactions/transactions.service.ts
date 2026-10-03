import { Injectable, NotFoundException } from '@nestjs/common';
import { NullableType } from '../utils/types/nullable.type';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { QueryTransactionDto } from './dto/query-transaction.dto';
import { CashflowPoint, FinancialKPIs, Transaction, TransactionStatus } from './domain/transaction';
import { TransactionRepository } from './infrastructure/persistence/transaction.repository';

@Injectable()
export class TransactionsService {
  constructor(private readonly transactionRepository: TransactionRepository) {}

  async create(createTransactionDto: CreateTransactionDto): Promise<Transaction> {
    return this.transactionRepository.create({
      ...createTransactionDto,
      currency: createTransactionDto.currency ?? 'USD',
      status: createTransactionDto.status ?? TransactionStatus.PENDING,
    });
  }

  async findManyWithPagination(query: QueryTransactionDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const { data, total } = await this.transactionRepository.findManyWithPagination({
      page,
      limit,
      status: query.status,
      search: query.search,
      userId: query.userId,
    });

    return {
      data,
      total,
      page,
      limit,
      hasNextPage: page * limit < total,
    };
  }

  async findById(id: string): Promise<NullableType<Transaction>> {
    const transaction = await this.transactionRepository.findById(id);
    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }
    return transaction;
  }

  async getFinancialKPIs(): Promise<FinancialKPIs> {
    return this.transactionRepository.getFinancialKPIs();
  }

  async getCashflowSeries(): Promise<CashflowPoint[]> {
    return this.transactionRepository.getCashflowSeries();
  }
}
