import { Transaction as PrismaTransaction, TransactionStatus as PrismaTransactionStatus, Prisma } from '@prisma/client';
import { Transaction, TransactionStatus } from '../../../../domain/transaction';

export class TransactionPrismaMapper {
  static toDomain(raw: PrismaTransaction): Transaction {
    const domainEntity = new Transaction();
    domainEntity.id = raw.id;
    domainEntity.userId = raw.userId;
    domainEntity.amount = Number(raw.amount);
    domainEntity.currency = raw.currency;
    domainEntity.status = raw.status as unknown as TransactionStatus;
    domainEntity.reference = raw.reference;
    domainEntity.description = raw.description;
    domainEntity.category = raw.category;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;
    return domainEntity;
  }

  static toPersistence(domainEntity: Transaction): PrismaTransaction {
    return {
      id: domainEntity.id,
      userId: domainEntity.userId,
      amount: new Prisma.Decimal(domainEntity.amount),
      currency: domainEntity.currency,
      status: domainEntity.status as unknown as PrismaTransactionStatus,
      reference: domainEntity.reference,
      description: domainEntity.description ?? null,
      category: domainEntity.category ?? null,
      createdAt: domainEntity.createdAt || new Date(),
      updatedAt: domainEntity.updatedAt || new Date(),
    };
  }
}
