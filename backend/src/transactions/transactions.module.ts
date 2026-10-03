import { Module } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { TransactionsRelationalPersistenceModule } from './infrastructure/persistence/relational/transactions-relational-persistence.module';

@Module({
  imports: [TransactionsRelationalPersistenceModule],
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService, TransactionsRelationalPersistenceModule],
})
export class TransactionsModule {}
