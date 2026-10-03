---
name: 3-create-domain-slice
description: Vertical slice Domain-Driven Design (DDD) scaffolding synchronized across NestJS backend and Next.js frontend.
---

# Skill 3: Synchronized Full-Stack Domain Slices

This skill guides the creation of synchronized vertical slices implementing Domain-Driven Design (DDD) across both directories of the monorepo.

## 1. Vertical Slice Architecture Overview
Every enterprise capability is implemented as a cohesive vertical slice that runs from the database through the backend Hexagonal layers to the frontend UI:

```
[ Database (PostgreSQL 16) ]
          │
[ Prisma 7 Schema (prisma/schema.prisma) ]
          │
[ Relational Repository (relational/repositories/*-prisma.repository.ts) ]
          │ (Two-Way Pure Mapper)
[ Domain Model (domain/*.ts) ] ◄── Abstract Port (*.repository.ts)
          │
[ NestJS Application Service (*.service.ts) ]
          │
[ Express REST Controller (*.controller.ts) ]
          ▼
[ Network Client (@/core/network/api-client.ts) ]
          ▼
[ Frontend Domain Component (@/domains/<feature>/*) ]
```

## 2. Backend Slice Structure
When scaffolding a new domain slice (e.g., `invoices`), establish the following tree in `backend/src/invoices/`:
- `domain/invoice.ts`: Pure TypeScript class or interface. Zero imports from `@prisma/client`.
- `dto/create-invoice.dto.ts`: Input validation contract with `class-validator` and `ApiProperty`.
- `infrastructure/persistence/invoice.repository.ts`: Abstract TypeScript class defining persistence operations.
- `infrastructure/persistence/relational/mappers/invoice-prisma.mapper.ts`: Pure transformation functions (`toDomain`, `toPersistence`).
- `infrastructure/persistence/relational/repositories/invoice-prisma.repository.ts`: Concrete Prisma adapter injecting `PrismaService`.
- `invoices.service.ts`: Business logic injecting `InvoiceRepository`.
- `invoices.controller.ts`: HTTP endpoints with `@Controller("invoices")`.
- `invoices.module.ts`: NestJS module registering providers and exporting services.

## 3. Instant Scaffolding via Hygen
To scaffold a new relational domain slice automatically, run:
```bash
npm --prefix backend run generate:resource
```
Follow the interactive prompts to specify the entity name and properties. The generator will create all Hexagonal persistence layers automatically.

## 4. Frontend Domain Slice Alignment
In `frontend/src/domains/<feature>/`:
- `<feature>-view.tsx`: Top-level composition assembling headers, metrics, and tables.
- `<feature>-table.tsx`: High-density `Table` with `StatusBadge` and search filters.
- Route in `frontend/src/app/[locale]/(root)/<feature>/page.tsx`.
