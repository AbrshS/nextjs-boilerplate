import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../database/prisma.service';
import { PasskeyRepository } from '../../passkey.repository';
import { Passkey } from '../../../../domain/passkey';
import { PasskeyPrismaMapper } from '../mappers/passkey-prisma.mapper';
import { NullableType } from '../../../../../utils/types/nullable.type';

@Injectable()
export class PasskeyPrismaRepository implements PasskeyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Passkey): Promise<Passkey> {
    const persistenceModel = PasskeyPrismaMapper.toPersistence(data);
    const newEntity = await this.prisma.passkey.create({
      data: persistenceModel,
    });
    return PasskeyPrismaMapper.toDomain(newEntity);
  }

  async findById(id: string): Promise<NullableType<Passkey>> {
    const entity = await this.prisma.passkey.findUnique({
      where: { id },
      include: { user: true },
    });
    return entity ? PasskeyPrismaMapper.toDomain(entity) : null;
  }

  async findManyByUserId(userId: number): Promise<Passkey[]> {
    const entities = await this.prisma.passkey.findMany({
      where: { userId },
    });
    return entities.map((entity) => PasskeyPrismaMapper.toDomain(entity));
  }

  async updateCounter(id: string, counter: number): Promise<Passkey> {
    const updated = await this.prisma.passkey.update({
      where: { id },
      data: { counter: BigInt(counter) },
    });
    return PasskeyPrismaMapper.toDomain(updated);
  }

  async deleteById(id: string): Promise<void> {
    await this.prisma.passkey.delete({
      where: { id },
    });
  }
}
