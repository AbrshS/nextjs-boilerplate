# Fanaye Technologies — Backend AI Agent Directives & Guardrails
> **Subsystem Scope**: `backend/` (NestJS 11, Prisma 7, PostgreSQL 16, BullMQ, Redis 7, Argon2id)

---

## 1. Architectural Guardrails & Standards
1. **Dual-Process Isolation**:
   - `main.ts`: Boots the Express HTTP API and Socket.IO WebSocket gateway (port 4000).
   - `main-worker.ts`: Boots a standalone NestJS application context to execute BullMQ queue workers.
   - Never perform heavy asynchronous tasks (email dispatch, PDF generation) inside HTTP request handlers.

2. **Hexagonal Persistence & Domain Purity**:
   - Domain entities in `src/*/domain/*.ts` MUST NEVER import `@prisma/client`.
   - Repository ports in `src/*/infrastructure/persistence/*.repository.ts` must be abstract classes.
   - All transformations between Prisma models and domain entities must occur exclusively in dedicated two-way mappers (`relational/mappers/*-prisma.mapper.ts`).
   - Service classes must inject abstract repository tokens, never `PrismaService` directly.

3. **Security & IAM Defense-in-Depth**:
   - Passwords must be hashed using **Argon2id** (`memoryCost: 19456, timeCost: 2`).
   - Transparently rehash legacy bcrypt hashes (`$2a$`, `$2b$`) to Argon2id on successful user authentication.
   - All new passwords must pass Have I Been Pwned (HIBP) k-anonymity verification (with network fail-open).
   - Multi-device sessions must capture `X-Device-Id` and `User-Agent` through `requestDeviceContext` (`AsyncLocalStorage`).

4. **BullMQ & Redis Invariants**:
   - BullMQ Redis connection options MUST declare `maxRetriesPerRequest: null`.
   - Workers must extend `WorkerHost` and declare appropriate concurrency and backoff settings.

---

## 2. Common Backend Commands
```bash
# Start API dev server with hot reload
npm run start:dev

# Start standalone background queue worker
npm run start:worker:dev

# Generate Prisma Client
npm run prisma:generate

# Execute database migrations
npm run prisma:migrate

# Seed database with sample data
npm run prisma:seed

# Generate new DDD vertical slice via Hygen
npm run generate:resource

# Run TypeScript compilation check
npm run typecheck
```
