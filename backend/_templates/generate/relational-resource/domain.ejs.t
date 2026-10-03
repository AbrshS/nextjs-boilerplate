---
to: src/<%= h.inflection.pluralize(name) %>/domain/<%= name %>.ts
---
import { ApiProperty } from '@nestjs/swagger';

export class <%= h.inflection.camelize(name, false) %> {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'Standard Resource Title' })
  title: string;

  @ApiProperty({ example: 'ACTIVE' })
  status: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
