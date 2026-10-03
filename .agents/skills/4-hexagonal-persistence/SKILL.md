---
name: 4-hexagonal-persistence
description: Hexagonal Architecture persistence playbook decoupling Prisma 7 and PostgreSQL from core business domain logic.
---

# Skill 4: Hexagonal Persistence (Ports & Adapters)

This skill governs the persistence tier in `backend/`, ensuring strict decoupling between Prisma 7 ORM models and domain entities.

## 1. The Core Invariant
> **Strict Directive**: Domain entities located in `src/*/domain/*.ts` MUST NEVER import from `@prisma/client` or any ORM library.

Domain entities represent core business rules. They must be pure TypeScript structures that remain unaffected if the underlying database engine or ORM is replaced.

## 2. The Three Persistence Components

### A. The Abstract Port (`infrastructure/persistence/*.repository.ts`)
Declare an abstract TypeScript class to serve as both the interface contract and the NestJS runtime dependency injection token:

```typescript
import { User } from '../../domain/user';
import { NullableType } from '../../../utils/types/nullable.type';

export abstract class UserRepository {
  abstract create(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
  abstract findById(id: string): Promise<NullableType<User>>;
  abstract findByEmail(email: string): Promise<NullableType<User>>;
  abstract update(id: string, payload: Partial<User>): Promise<NullableType<User>>;
  abstract remove(id: string): Promise<void>;
}
```

### B. The Pure Two-Way Mapper (`relational/mappers/*-prisma.mapper.ts`)
All data transformations occur in static pure functions. No business logic belongs in mappers:

```typescript
import { User as PrismaUser } from '@prisma/client';
import { User } from '../../../../domain/user';

export class UserPrismaMapper {
  static toDomain(raw: PrismaUser): User {
    const user = new User();
    user.id = raw.id;
    user.email = raw.email;
    user.firstName = raw.firstName;
    user.lastName = raw.lastName;
    user.createdAt = raw.createdAt;
    user.updatedAt = raw.updatedAt;
    return user;
  }

  static toPersistence(entity: User): Partial<PrismaUser> {
    return {
      email: entity.email,
      firstName: entity.firstName,
      lastName: entity.lastName,
    };
  }
}
```

### C. The Concrete Adapter (`relational/repositories/*-prisma.repository.ts`)
The adapter injects `PrismaService`, executes queries, and transforms results using the mapper:

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../database/prisma.service';
import { UserRepository } from '../../user.repository';
import { User } from '../../../../domain/user';
import { UserPrismaMapper } from '../mappers/user-prisma.mapper';

@Injectable()
export class UserPrismaRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({ where: { email } });
    return record ? UserPrismaMapper.toDomain(record) : null;
  }
}
```

## 3. Module Dependency Injection Binding
In the domain module (e.g. `users.module.ts`), bind the abstract port to the concrete adapter:

```typescript
@Module({
  providers: [
    UsersService,
    {
      provide: UserRepository,
      useClass: UserPrismaRepository,
    },
  ],
  exports: [UsersService, UserRepository],
})
export class UsersModule {}
```
