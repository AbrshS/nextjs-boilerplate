---
to: src/<%= h.inflection.pluralize(name) %>/infrastructure/persistence/relational/repositories/<%= name %>-prisma.repository.ts
---
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../database/prisma.service';
import { <%= h.inflection.camelize(name, false) %>Repository } from '../../<%= name %>.repository';
import { <%= h.inflection.camelize(name, false) %> } from '../../../../domain/<%= name %>';
import { <%= h.inflection.camelize(name, false) %>PrismaMapper } from '../mappers/<%= name %>-prisma.mapper';
import { NullableType } from '../../../../../utils/types/nullable.type';

@Injectable()
export class <%= h.inflection.camelize(name, false) %>PrismaRepository implements <%= h.inflection.camelize(name, false) %>Repository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: Omit<<%= h.inflection.camelize(name, false) %>, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<<%= h.inflection.camelize(name, false) %>> {
    const raw = await (this.prisma as any).<%= name %>.create({
      data: <%= h.inflection.camelize(name, false) %>PrismaMapper.toPersistence(data as any),
    });
    return <%= h.inflection.camelize(name, false) %>PrismaMapper.toDomain(raw);
  }

  async findById(id: string): Promise<NullableType<<%= h.inflection.camelize(name, false) %>>> {
    const raw = await (this.prisma as any).<%= name %>.findUnique({ where: { id } });
    return raw ? <%= h.inflection.camelize(name, false) %>PrismaMapper.toDomain(raw) : null;
  }

  async findAll(): Promise<<%= h.inflection.camelize(name, false) %>[]> {
    const records = await (this.prisma as any).<%= name %>.findMany();
    return records.map((r: any) => <%= h.inflection.camelize(name, false) %>PrismaMapper.toDomain(r));
  }

  async update(
    id: string,
    payload: Partial<<%= h.inflection.camelize(name, false) %>>,
  ): Promise<NullableType<<%= h.inflection.camelize(name, false) %>>> {
    const raw = await (this.prisma as any).<%= name %>.update({
      where: { id },
      data: payload,
    });
    return raw ? <%= h.inflection.camelize(name, false) %>PrismaMapper.toDomain(raw) : null;
  }

  async remove(id: string): Promise<void> {
    await (this.prisma as any).<%= name %>.delete({ where: { id } });
  }
}
