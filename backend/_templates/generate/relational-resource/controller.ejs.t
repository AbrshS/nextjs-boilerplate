---
to: src/<%= h.inflection.pluralize(name) %>/<%= h.inflection.pluralize(name) %>.controller.ts
---
import { Controller, Get, Post, Body, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { <%= h.inflection.camelize(h.inflection.pluralize(name), false) %>Service } from './<%= h.inflection.pluralize(name) %>.service';
import { Create<%= h.inflection.camelize(name, false) %>Dto } from './dto/create-<%= name %>.dto';
import { <%= h.inflection.camelize(name, false) %> } from './domain/<%= name %>';

@ApiTags('<%= h.inflection.camelize(h.inflection.pluralize(name), false) %>')
@Controller('<%= h.inflection.pluralize(name) %>')
export class <%= h.inflection.camelize(h.inflection.pluralize(name), false) %>Controller {
  constructor(private readonly service: <%= h.inflection.camelize(h.inflection.pluralize(name), false) %>Service) {}

  @Post()
  @ApiOperation({ summary: 'Create new <%= name %>' })
  @ApiResponse({ status: HttpStatus.CREATED, type: <%= h.inflection.camelize(name, false) %> })
  async create(@Body() dto: Create<%= h.inflection.camelize(name, false) %>Dto): Promise<<%= h.inflection.camelize(name, false) %>> {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all <%= h.inflection.pluralize(name) %>' })
  @ApiResponse({ status: HttpStatus.OK, type: [<%= h.inflection.camelize(name, false) %>] })
  async findAll(): Promise<<%= h.inflection.camelize(name, false) %>[]> {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get <%= name %> by id' })
  @ApiResponse({ status: HttpStatus.OK, type: <%= h.inflection.camelize(name, false) %> })
  async findOne(@Param('id') id: string): Promise<<%= h.inflection.camelize(name, false) %>> {
    return this.service.findOne(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete <%= name %> by id' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}
