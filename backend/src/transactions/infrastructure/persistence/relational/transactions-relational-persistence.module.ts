import { Module } from '@nestjs/common';
import { TransactionRepository } from '../../transaction.repository';
import { TransactionPrismaRepository } from './repositories/transaction-prisma.repository';

@Module({
  providers: [
    {
      provide: TransactionRepository,
      useClass: TransactionPrismaRepository,
    },
  ],
  exports: [TransactionRepository],
})
export class TransactionsRelationalPersistenceModule {}
