import { NullableType } from '../../../utils/types/nullable.type';
import { Role, Status, User } from '../../domain/user';

export abstract class UserRepository {
  abstract create(data: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'failedLoginAttempts' | 'isTwoFactorEnabled'>): Promise<User>;

  abstract findById(id: string): Promise<NullableType<User>>;

  abstract findByEmail(email: string): Promise<NullableType<User>>;

  abstract findManyWithPagination(options: {
    page: number;
    limit: number;
    search?: string;
    role?: Role;
    status?: Status;
  }): Promise<{ data: User[]; total: number }>;

  abstract update(id: string, payload: Partial<User>): Promise<NullableType<User>>;

  abstract delete(id: string): Promise<void>;

  abstract count(): Promise<number>;
}
