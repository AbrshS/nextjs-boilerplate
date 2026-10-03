---
to: src/<%= h.inflection.pluralize(name) %>/<%= h.inflection.pluralize(name) %>.service.ts
---
import { Injectable, NotFoundException } from '@nestjs/common';
import { <%= h.inflection.camelize(name, false) %>Repository } from './infrastructure/persistence/<%= name %>.repository';
import { Create<%= h.inflection.camelize(name, false) %>Dto } from './dto/create-<%= name %>.dto';
import { <%= h.inflection.camelize(name, false) %> } from './domain/<%= name %>';

@Injectable()
export class <%= h.inflection.camelize(h.inflection.pluralize(name), false) %>Service {
  constructor(private readonly repository: <%= h.inflection.camelize(name, false) %>Repository) {}

  async create(dto: Create<%= h.inflection.camelize(name, false) %>Dto): Promise<<%= h.inflection.camelize(name, false) %>> {
    return this.repository.create({
      title: dto.title,
      status: dto.status || 'ACTIVE',
    });
  }

  async findAll(): Promise<<%= h.inflection.camelize(name, false) %>[]> {
    return this.repository.findAll();
  }

  async findOne(id: string): Promise<<%= h.inflection.camelize(name, false) %>> {
    const item = await this.repository.findById(id);
    if (!item) {
      throw new NotFoundException(`Resource with ID ${id} not found`);
    }
    return item;
  }

  async remove(id: string): Promise<void> {
    await this.repository.remove(id);
  }
}
