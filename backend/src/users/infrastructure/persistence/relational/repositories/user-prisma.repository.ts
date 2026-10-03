import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../database/prisma.service';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { Role, Status, User } from '../../../../domain/user';
import { UserRepository } from '../../user.repository';
import { UserPrismaMapper } from '../mappers/user-prisma.mapper';
import { Prisma, RoleEnum, StatusEnum } from '@prisma/client';

@Injectable()
export class UserPrismaRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'failedLoginAttempts' | 'isTwoFactorEnabled'>): Promise<User> {
    const raw = await this.prisma.user.create({
      data: {
        email: data.email,
        password: data.password ?? null,
        firstName: data.firstName ?? null,
        lastName: data.lastName ?? null,
        role: (data.role as unknown as RoleEnum) || RoleEnum.USER,
        status: (data.status as unknown as StatusEnum) || StatusEnum.ACTIVE,
      },
    });

    return UserPrismaMapper.toDomain(raw);
  }

  async findById(id: string): Promise<NullableType<User>> {
    const raw = await this.prisma.user.findUnique({
      where: { id },
    });

    return raw ? UserPrismaMapper.toDomain(raw) : null;
  }

  async findByEmail(email: string): Promise<NullableType<User>> {
    const raw = await this.prisma.user.findUnique({
      where: { email },
    });

    return raw ? UserPrismaMapper.toDomain(raw) : null;
  }

  async findManyWithPagination({
    page,
    limit,
    search,
    role,
    status,
  }: {
    page: number;
    limit: number;
    search?: string;
    role?: Role;
    status?: Status;
  }): Promise<{ data: User[]; total: number }> {
    const where: Prisma.UserWhereInput = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = role as unknown as RoleEnum;
    }

    if (status) {
      where.status = status as unknown as StatusEnum;
    }

    const [records, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: records.map(UserPrismaMapper.toDomain),
      total,
    };
  }

  async update(id: string, payload: Partial<User>): Promise<NullableType<User>> {
    const updateData: Prisma.UserUpdateInput = {};

    if (payload.email !== undefined) updateData.email = payload.email;
    if (payload.password !== undefined) updateData.password = payload.password;
    if (payload.firstName !== undefined) updateData.firstName = payload.firstName;
    if (payload.lastName !== undefined) updateData.lastName = payload.lastName;
    if (payload.role !== undefined) updateData.role = payload.role as unknown as RoleEnum;
    if (payload.status !== undefined) updateData.status = payload.status as unknown as StatusEnum;
    if (payload.isTwoFactorEnabled !== undefined) updateData.isTwoFactorEnabled = payload.isTwoFactorEnabled;
    if (payload.twoFactorSecret !== undefined) updateData.twoFactorSecret = payload.twoFactorSecret;
    if (payload.failedLoginAttempts !== undefined) updateData.failedLoginAttempts = payload.failedLoginAttempts;
    if (payload.lockoutExpiresAt !== undefined) updateData.lockoutExpiresAt = payload.lockoutExpiresAt;

    const raw = await this.prisma.user.update({
      where: { id },
      data: updateData,
    });

    return UserPrismaMapper.toDomain(raw);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }

  async count(): Promise<number> {
    return this.prisma.user.count();
  }
}
