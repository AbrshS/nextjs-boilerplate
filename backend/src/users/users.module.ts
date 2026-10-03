import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersRelationalPersistenceModule } from './infrastructure/persistence/relational/users-relational-persistence.module';

@Module({
  imports: [UsersRelationalPersistenceModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService, UsersRelationalPersistenceModule],
})
export class UsersModule {}
