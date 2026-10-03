import { createHash } from 'crypto';
import { HttpStatus, UnprocessableEntityException } from '@nestjs/common';

const MIN_PASSWORD_LENGTH = 8;
const SEQUENCE_LEN = 4;

export function assertPasswordLength(password: string): void {
  if (!password || password.length < MIN_PASSWORD_LENGTH) {
    throw new UnprocessableEntityException({
      status: HttpStatus.UNPROCESSABLE_ENTITY,
      errors: {
        password: 'passwordTooShort',
      },
    });
  }
}

/** Reject if new password shares 4+ consecutive chars (same order) with prior password. */
export function assertPasswordSequenceRule(
  newPassword: string,
  previousPasswordPlain?: string | null,
): void {
  if (!previousPasswordPlain) return;

  const a = newPassword.toLowerCase();
  const b = previousPasswordPlain.toLowerCase();

  for (let i = 0; i <= a.length - SEQUENCE_LEN; i++) {
    const seq = a.slice(i, i + SEQUENCE_LEN);
    if (b.includes(seq)) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          password: 'passwordTooSimilar',
        },
      });
    }
  }
}

/**
 * Have I Been Pwned k-anonymity check.
 * On network failure or offline mode, allow the password (fail open) so signup is never blocked.
 */
export async function assertPasswordNotBreached(password: string): Promise<void> {
  const sha1 = createHash('sha1').update(password).digest('hex').toUpperCase();
  const prefix = sha1.slice(0, 5);
  const suffix = sha1.slice(5);

  try {
    const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: { 'Add-Padding': 'true' },
    });
    if (!res.ok) return;
    const body = await res.text();
    const hit = body.split('\n').some((line) => line.startsWith(suffix));
    if (hit) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          password: 'passwordBreached',
        },
      });
    }
  } catch (err) {
    if (err instanceof UnprocessableEntityException) throw err;
    // Fail open on network / DNS timeout errors
  }
}

export const PASSWORD_MIN_LENGTH = MIN_PASSWORD_LENGTH;
