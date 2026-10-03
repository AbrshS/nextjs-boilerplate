import { User as PrismaUser, RoleEnum, StatusEnum } from '@prisma/client';
import { Role, Status, User } from '../../../../domain/user';

export class UserPrismaMapper {
  static toDomain(raw: PrismaUser): User {
    const domainEntity = new User();
    domainEntity.id = raw.id;
    domainEntity.email = raw.email;
    domainEntity.password = raw.password;
    domainEntity.firstName = raw.firstName;
    domainEntity.lastName = raw.lastName;
    domainEntity.role = raw.role as unknown as Role;
    domainEntity.status = raw.status as unknown as Status;
    domainEntity.isTwoFactorEnabled = raw.isTwoFactorEnabled;
    domainEntity.twoFactorSecret = raw.twoFactorSecret;
    domainEntity.failedLoginAttempts = raw.failedLoginAttempts;
    domainEntity.lockoutExpiresAt = raw.lockoutExpiresAt;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;
    return domainEntity;
  }

  static toPersistence(domainEntity: User): PrismaUser {
    return {
      id: domainEntity.id,
      email: domainEntity.email,
      password: domainEntity.password ?? null,
      firstName: domainEntity.firstName ?? null,
      lastName: domainEntity.lastName ?? null,
      role: domainEntity.role as unknown as RoleEnum,
      status: domainEntity.status as unknown as StatusEnum,
      isTwoFactorEnabled: domainEntity.isTwoFactorEnabled ?? false,
      twoFactorSecret: domainEntity.twoFactorSecret ?? null,
      failedLoginAttempts: domainEntity.failedLoginAttempts ?? 0,
      lockoutExpiresAt: domainEntity.lockoutExpiresAt ?? null,
      createdAt: domainEntity.createdAt || new Date(),
      updatedAt: domainEntity.updatedAt || new Date(),
    };
  }
}
