import { Module } from '@nestjs/common';
import { UserRepository } from '../user.repository';
import { UserPrismaRepository } from './repositories/user-prisma.repository';

@Module({
  providers: [
    {
      provide: UserRepository,
      useClass: UserPrismaRepository,
    },
  ],
  exports: [UserRepository],
})
export class UsersRelationalPersistenceModule {}
