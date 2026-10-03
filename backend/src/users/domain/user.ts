export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER',
  AUDITOR = 'AUDITOR',
}

export enum Status {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  LOCKED = 'LOCKED',
  PENDING = 'PENDING',
}

export class User {
  id: string;
  email: string;
  password?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  role: Role;
  status: Status;
  isTwoFactorEnabled: boolean;
  twoFactorSecret?: string | null;
  failedLoginAttempts: number;
  lockoutExpiresAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
