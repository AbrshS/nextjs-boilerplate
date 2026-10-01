import { User } from '../../users/domain/user';

export class Passkey {
  id: string; // Credential ID
  userId: number;
  publicKey: string;
  counter: number;
  transports?: string | null;
  createdAt: Date;
  user?: User;
}
