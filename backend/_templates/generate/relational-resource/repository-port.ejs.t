---
to: src/<%= h.inflection.pluralize(name) %>/infrastructure/persistence/<%= name %>.repository.ts
---
import { <%= h.inflection.camelize(name, false) %> } from '../../domain/<%= name %>';
import { NullableType } from '../../../utils/types/nullable.type';

export abstract class <%= h.inflection.camelize(name, false) %>Repository {
  abstract create(
    data: Omit<<%= h.inflection.camelize(name, false) %>, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<<%= h.inflection.camelize(name, false) %>>;

  abstract findById(id: string): Promise<NullableType<<%= h.inflection.camelize(name, false) %>>>;

  abstract findAll(): Promise<<%= h.inflection.camelize(name, false) %>[]>;

  abstract update(
    id: string,
    payload: Partial<<%= h.inflection.camelize(name, false) %>>,
  ): Promise<NullableType<<%= h.inflection.camelize(name, false) %>>>;

  abstract remove(id: string): Promise<void>;
}
