import * as argon2 from 'argon2';
import bcrypt from 'bcryptjs';

export function isBcryptHash(hash: string): boolean {
  return /^\$2[aby]\$/.test(hash);
}

export function needsRehash(hash: string): boolean {
  return isBcryptHash(hash);
}

export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  });
}

export async function verifyPassword(
  hash: string,
  password: string,
): Promise<boolean> {
  if (!hash || !password) return false;
  if (isBcryptHash(hash)) {
    return bcrypt.compare(password, hash);
  }
  try {
    return await argon2.verify(hash, password);
  } catch {
    return false;
  }
}
