---
name: 7-safe-db-migration
description: Safe database schema evolution, non-destructive migrations with Prisma 7, and accidental data-loss prevention.
---

# Skill 7: Safe Database Migration & Schema Evolution

This skill establishes strict guardrails for database schema evolution, preventing data corruption or accidental loss in PostgreSQL.

## 1. Absolute Stop-and-Verify Directives
> **CRITICAL RULE**: AI coding assistants MUST NEVER execute destructive database commands (`prisma migrate reset`, `DROP TABLE`, `TRUNCATE`, `DROP DATABASE`) without explicit user permission.

When modifying schemas:
1. Prefer additive changes (e.g. adding nullable columns or columns with defaults).
2. Avoid destructive drops of populated columns in single migration steps.
3. Verify that changes do not break existing mappers or domain entity contracts.

## 2. Standard Schema Migration Workflow
When evolving the schema in `backend/prisma/schema.prisma`:

### Step 1: Update Schema Model
```prisma
model User {
  id          String   @id @default(uuid())
  phoneNumber String?  // Add as optional initially
  // ...
}
```

### Step 2: Generate Migration with Descriptive Human Name
```bash
npm --prefix backend run prisma:migrate -- --name add_phone_number_to_users
```

### Step 3: Regenerate Prisma Client
```bash
npm --prefix backend run prisma:generate
```

### Step 4: Update Hexagonal Persistence Artifacts
1. Update `backend/src/users/domain/user.ts` domain entity.
2. Update `backend/src/users/infrastructure/persistence/relational/mappers/user-prisma.mapper.ts`.
3. Update DTOs and test fixtures.

## 3. Seed Execution & Shadow Verification
- To test migrations with realistic enterprise data:
  ```bash
  npm --prefix backend run prisma:seed
  ```
- All seed scripts must use upsert operations (`prisma.user.upsert`) to remain safely idempotent.
