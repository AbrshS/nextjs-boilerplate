---
to: src/<%= h.inflection.pluralize(name) %>/<%= h.inflection.pluralize(name) %>.module.ts
---
import { Module } from '@nestjs/common';
import { <%= h.inflection.camelize(h.inflection.pluralize(name), false) %>Service } from './<%= h.inflection.pluralize(name) %>.service';
import { <%= h.inflection.camelize(h.inflection.pluralize(name), false) %>Controller } from './<%= h.inflection.pluralize(name) %>.controller';
import { <%= h.inflection.camelize(name, false) %>Repository } from './infrastructure/persistence/<%= name %>.repository';
import { <%= h.inflection.camelize(name, false) %>PrismaRepository } from './infrastructure/persistence/relational/repositories/<%= name %>-prisma.repository';

@Module({
  controllers: [<%= h.inflection.camelize(h.inflection.pluralize(name), false) %>Controller],
  providers: [
    <%= h.inflection.camelize(h.inflection.pluralize(name), false) %>Service,
    {
      provide: <%= h.inflection.camelize(name, false) %>Repository,
      useClass: <%= h.inflection.camelize(name, false) %>PrismaRepository,
    },
  ],
  exports: [<%= h.inflection.camelize(h.inflection.pluralize(name), false) %>Service, <%= h.inflection.camelize(name, false) %>Repository],
})
export class <%= h.inflection.camelize(h.inflection.pluralize(name), false) %>Module {}
