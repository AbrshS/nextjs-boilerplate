---
to: src/<%= h.inflection.pluralize(name) %>/infrastructure/persistence/relational/mappers/<%= name %>-prisma.mapper.ts
---
import { <%= h.inflection.camelize(name, false) %> } from '../../../../domain/<%= name %>';

export class <%= h.inflection.camelize(name, false) %>PrismaMapper {
  static toDomain(raw: any): <%= h.inflection.camelize(name, false) %> {
    const domain = new <%= h.inflection.camelize(name, false) %>();
    domain.id = raw.id;
    domain.title = raw.title;
    domain.status = raw.status;
    domain.createdAt = raw.createdAt;
    domain.updatedAt = raw.updatedAt;
    return domain;
  }

  static toPersistence(entity: <%= h.inflection.camelize(name, false) %>): any {
    return {
      title: entity.title,
      status: entity.status,
    };
  }
}
