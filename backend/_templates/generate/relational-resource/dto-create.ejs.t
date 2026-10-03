---
to: src/<%= h.inflection.pluralize(name) %>/dto/create-<%= name %>.dto.ts
---
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class Create<%= h.inflection.camelize(name, false) %>Dto {
  @ApiProperty({ example: 'Sample Title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'ACTIVE', required: false })
  @IsString()
  @IsOptional()
  status?: string;
}
