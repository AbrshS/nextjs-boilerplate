import { NullableType } from '../../../utils/types/nullable.type';
import { CashflowPoint, FinancialKPIs, Transaction, TransactionStatus } from '../../domain/transaction';

export abstract class TransactionRepository {
  abstract create(data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction>;

  abstract findById(id: string): Promise<NullableType<Transaction>>;

  abstract findManyWithPagination(options: {
    page: number;
    limit: number;
    status?: TransactionStatus;
    search?: string;
    userId?: string;
  }): Promise<{ data: Transaction[]; total: number }>;

  abstract getFinancialKPIs(): Promise<FinancialKPIs>;

  abstract getCashflowSeries(): Promise<CashflowPoint[]>;
}
