import { Passkey as PrismaPasskey, User as PrismaUser } from '@prisma/client';
import { Passkey } from '../../../../domain/passkey';
import { UserPrismaMapper } from '../../../../../users/infrastructure/persistence/relational/mappers/user-prisma.mapper';

export class PasskeyPrismaMapper {
  static toDomain(raw: PrismaPasskey & { user?: PrismaUser | null }): Passkey {
    const domainEntity = new Passkey();
    domainEntity.id = raw.id;
    domainEntity.userId = raw.userId;
    domainEntity.publicKey = raw.publicKey;
    domainEntity.counter = Number(raw.counter);
    domainEntity.transports = raw.transports;
    domainEntity.createdAt = raw.createdAt;

    if (raw.user) {
      domainEntity.user = UserPrismaMapper.toDomain(raw.user as any);
    }

    return domainEntity;
  }

  static toPersistence(domainEntity: Passkey): PrismaPasskey {
    return {
      id: domainEntity.id,
      userId: domainEntity.userId,
      publicKey: domainEntity.publicKey,
      counter: BigInt(domainEntity.counter),
      transports: domainEntity.transports ?? null,
      createdAt: domainEntity.createdAt || new Date(),
    };
  }
}
