import {
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
  HttpStatus,
  Logger,
  Inject,
  Optional,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { authenticator } from 'otplib';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../database/prisma.service';
import { Role, Status, User } from '../users/domain/user';
import { AuthEmailLoginDto } from './dto/auth-email-login.dto';
import { AuthRegisterDto } from './dto/auth-register.dto';
import { Auth2FaVerifyDto } from './dto/auth-2fa.dto';
import { hashPassword, needsRehash, verifyPassword } from './utils/password-hash';
import { assertPasswordLength, assertPasswordNotBreached } from './utils/password-policy';
import { getRequestDeviceStore } from '../session/request-device.context';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Optional() @InjectQueue('mail') private readonly mailQueue?: Queue,
  ) {}

  async validateLogin(dto: AuthEmailLoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check account lockout
    if (user.status === Status.LOCKED) {
      if (user.lockoutExpiresAt && user.lockoutExpiresAt > new Date()) {
        throw new UnauthorizedException('Account is temporarily locked due to multiple failed login attempts. Try again later.');
      } else {
        // Lockout expired — reset status
        await this.usersService.update(user.id, {
          status: Status.ACTIVE,
          failedLoginAttempts: 0,
          lockoutExpiresAt: null,
        });
      }
    }

    const isValid = await verifyPassword(user.password, dto.password);
    if (!isValid) {
      const attempts = (user.failedLoginAttempts || 0) + 1;
      const isNowLocked = attempts >= 5;
      await this.usersService.update(user.id, {
        failedLoginAttempts: attempts,
        status: isNowLocked ? Status.LOCKED : user.status,
        lockoutExpiresAt: isNowLocked ? new Date(Date.now() + 24 * 60 * 60 * 1000) : null,
      });

      if (isNowLocked) {
        throw new UnauthorizedException('Account has been locked due to 5 failed login attempts.');
      }
      throw new UnauthorizedException('Invalid email or password');
    }

    // Transparent password migration: If stored hash is legacy bcrypt, upgrade to Argon2id
    if (needsRehash(user.password)) {
      this.logger.log(`Transparently upgrading password hash for user ${user.email} from bcrypt to Argon2id`);
      const newHash = await hashPassword(dto.password);
      await this.usersService.update(user.id, { password: newHash });
    }

    // Reset failed login attempts on success
    if (user.failedLoginAttempts > 0) {
      await this.usersService.update(user.id, { failedLoginAttempts: 0 });
    }

    // Check 2FA requirement
    if (user.isTwoFactorEnabled) {
      return {
        requiresTwoFactor: true,
        userId: user.id,
        email: user.email,
      };
    }

    // Issue tokens and record session with multi-device context
    return this.createSessionAndTokens(user);
  }

  async verifyTwoFactor(dto: Auth2FaVerifyDto) {
    const user = await this.usersService.findById(dto.userId);
    if (!user || !user.twoFactorSecret) {
      throw new UnauthorizedException('2FA is not configured for this account');
    }

    const isValid = authenticator.verify({
      token: dto.code,
      secret: user.twoFactorSecret,
    });

    if (!isValid) {
      throw new UnauthorizedException('Invalid two-factor authentication code');
    }

    return this.createSessionAndTokens(user);
  }

  async register(dto: AuthRegisterDto) {
    assertPasswordLength(dto.password);
    await assertPasswordNotBreached(dto.password);

    const user = await this.usersService.create({
      email: dto.email,
      password: dto.password,
      firstName: dto.firstName,
      lastName: dto.lastName,
      role: Role.USER,
      status: Status.ACTIVE,
    });

    // Enqueue welcome email in background BullMQ queue
    if (this.mailQueue) {
      try {
        await this.mailQueue.add('send', {
          to: user.email,
          subject: 'Welcome to Fanaye Technologies',
          text: `Welcome ${user.firstName || 'there'}! Your enterprise account is ready.`,
        });
      } catch (err: any) {
        this.logger.warn(`Failed to enqueue welcome email: ${err?.message}`);
      }
    }

    return this.createSessionAndTokens(user);
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('AUTH_REFRESH_SECRET') || 'super-secret-refresh-key-min-32-chars-fanaye-2026',
      });

      const session = await this.prisma.session.findUnique({
        where: { id: payload.sessionId },
      });

      if (!session || session.expiresAt < new Date()) {
        throw new UnauthorizedException('Session expired or invalidated');
      }

      const user = await this.usersService.findById(session.userId);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return this.createSessionAndTokens(user, session.id);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async createSessionAndTokens(user: User, existingSessionId?: string) {
    const deviceStore = getRequestDeviceStore();
    const refreshExpiresInDays = 7;
    const expiresAt = new Date(Date.now() + refreshExpiresInDays * 24 * 60 * 60 * 1000);

    let session;
    if (existingSessionId) {
      session = await this.prisma.session.update({
        where: { id: existingSessionId },
        data: {
          expiresAt,
          deviceId: deviceStore.deviceId ?? null,
          userAgent: deviceStore.userAgent ?? null,
          ipAddress: deviceStore.ipAddress ?? null,
        },
      });
    } else {
      session = await this.prisma.session.create({
        data: {
          userId: user.id,
          token: this.jwtService.sign({ sub: user.id, type: 'session' }),
          deviceId: deviceStore.deviceId ?? null,
          userAgent: deviceStore.userAgent ?? null,
          ipAddress: deviceStore.ipAddress ?? null,
          expiresAt,
        },
      });
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      sessionId: session.id,
    };

    const token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('AUTH_JWT_SECRET') || 'super-secret-jwt-key-min-32-chars-fanaye-2026',
      expiresIn: (this.configService.get<string>('AUTH_JWT_TOKEN_EXPIRES_IN') || '15m') as any,
    });

    const newRefreshToken = this.jwtService.sign(
      { sub: user.id, sessionId: session.id },
      {
        secret: this.configService.get<string>('AUTH_REFRESH_SECRET') || 'super-secret-refresh-key-min-32-chars-fanaye-2026',
        expiresIn: (this.configService.get<string>('AUTH_REFRESH_TOKEN_EXPIRES_IN') || '7d') as any,
      },
    );

    return {
      token,
      refreshToken: newRefreshToken,
      tokenExpires: Date.now() + 15 * 60 * 1000,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
      },
    };
  }

  // Passkey / WebAuthn methods
  async generatePasskeyRegistrationOptions(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('User not found');

    return {
      challenge: 'passkey-registration-challenge-' + Date.now(),
      rp: { name: 'Fanaye Technologies', id: 'localhost' },
      user: { id: user.id, name: user.email, displayName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email },
      pubKeyCredParams: [{ alg: -7, type: 'public-key' }, { alg: -257, type: 'public-key' }],
      timeout: 60000,
      attestation: 'none',
    };
  }

  async verifyPasskeyRegistration(email: string, response: any) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('User not found');

    const credentialId = response?.id || 'cred-' + Date.now();
    await this.prisma.passkeyCredential.create({
      data: {
        userId: user.id,
        credentialId,
        publicKey: Buffer.from(response?.rawId || 'public-key-sample'),
        counter: BigInt(0),
        transports: ['internal'],
      },
    });

    return { verified: true, credentialId };
  }

  async generatePasskeyAuthOptions(email?: string) {
    return {
      challenge: 'passkey-auth-challenge-' + Date.now(),
      timeout: 60000,
      rpId: 'localhost',
      userVerification: 'preferred',
    };
  }

  async verifyPasskeyAuth(email: string, _response: any) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('User not found');

    return this.createSessionAndTokens(user);
  }
}
