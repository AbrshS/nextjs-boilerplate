import { Passkey } from '../../domain/passkey';
import { NullableType } from '../../../utils/types/nullable.type';

export abstract class PasskeyRepository {
  abstract create(data: Omit<Passkey, 'createdAt'>): Promise<Passkey>;

  abstract findById(id: string): Promise<NullableType<Passkey>>;

  abstract findManyByUserId(userId: number): Promise<Passkey[]>;

  abstract updateCounter(id: string, counter: number): Promise<Passkey>;

  abstract deleteById(id: string): Promise<void>;
}
