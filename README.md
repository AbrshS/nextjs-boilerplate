# Fanaye Technologies Enterprise Boilerplate (2026 Edition)
> **The Definitive Full-Stack Dual-Directory Monorepo for High-Assurance Enterprise Platforms**  
> *Next.js 16 (React 19) + NestJS 11 + Prisma 7 (PostgreSQL 16) + BullMQ (Redis 7) + Argon2id IAM Defense + Zero-Shadow Tonal Hierarchy*

---

## 1. System Architecture Overview

```
                                  FANAYE ENTERPRISE MONOREPO
                                 (Dual-Directory Architecture)
                                               │
               ┌───────────────────────────────┴───────────────────────────────┐
               ▼                                                               ▼
       frontend/ (Next.js 16)                                          backend/ (NestJS 11)
  ├── React 19 + App Router                                       ├── Express HTTP REST API (:4000)
  ├── Tailwind CSS v4 + @theme inline                             ├── Socket.IO Clustered Gateway
  ├── Shadcn base-nova (@base-ui/react)                           ├── Standalone BullMQ WorkerHost (:main-worker)
  ├── Zero-Shadow Sunlit Cream Palette                            ├── Hexagonal Persistence (Prisma 7 + PG)
  ├── Container-Query Responsive Forms                            ├── Argon2id + HIBP Breach Verification
  └── Single In-Flight refreshPromise                             └── WebAuthn Passkeys & TOTP 2FA
```

---

## 2. Monorepo Directory Boundaries

| Directory | Core Purpose & Stack | Isolation Rules |
| :--- | :--- | :--- |
| **`frontend/`** | Next.js 16 (App Router), React 19, Tailwind CSS v4, Base UI Nova (`@base-ui/react`), Recharts, DayPicker v10. | Strictly isolated. Communicates with backend exclusively via `@/core/network/api-client` REST endpoints and WebSockets. Never imports `@prisma/client`. |
| **`backend/`** | NestJS 11, Prisma 7 with native PostgreSQL adapter, BullMQ, Redis 7, Argon2id, WebAuthn, Resend, Handlebars. | Strictly isolated. HTTP server runs in `main.ts`; background queues run in `main-worker.ts`. Domain models never import `@prisma/client`. |
| **`.agents/skills/`** | Seven Core Fanaye Skills playbooks (`1-shadcn-base-nova` through `7-safe-db-migration`). | Executable playbooks read by AI coding agents to preserve engineering standards. |
| **`memory/`** | Living architectural logs (`edit_log.md`, `progress_log.md`, `development_guidelines.md`). | Immutable audit trail for technical decisions (TDLs) and verified commits. |
| **`analysis/`** | Architectural deep-dive audits from flagship company systems and global industry benchmarks. | Historical synthesis reference repository. |

---

## 3. Quick Start Guide

### Prerequisites
- **Node.js**: `v20.x` or `v22.x` (LTS)
- **Docker & Docker Compose**: For local PostgreSQL 16 and Redis 7 containers

### Step 1: Start Infrastructure Containers
```bash
# Start PostgreSQL 16 (port 5432) and Redis 7 (port 6379)
npm run docker:up
```

### Step 2: Install Monorepo Dependencies
```bash
npm install
```

### Step 3: Run Database Migrations & Seeds
```bash
# Generate Prisma Client
npm --prefix backend run prisma:generate

# Apply migrations
npm --prefix backend run prisma:migrate

# Seed database with sample users and ledger transactions
npm --prefix backend run prisma:seed
```

### Step 4: Start Development Servers
```bash
# Launch both Frontend (http://localhost:3000) and Backend (http://localhost:4000) concurrently
npm run dev
```

---

## 4. Default Seed Credentials & Testing Roles

The seed script (`backend/prisma/seed.ts`) automatically populates the following accounts:

| Role | Email | Password | Features / Permissions |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@fanaye.com` | `Secret123!` | Full IAM administrative access, ledger controls, audit logs, 2FA enabled. |
| **Developer** | `dev@fanaye.com` | `Secret123!` | Financial dashboard access, transaction queries, active node session. |
| **Locked User** | `locked@fanaye.com` | `Secret123!` | Suspended operator account for testing 5-attempt account lockout guardrails. |

> **Pro-Tip**: The frontend Sign-In view (`/sign-in`) includes **Quick-Fill Demo Role buttons** to authenticate with one click during development.

---

## 5. Architectural Invariants & Standards

### A. Zero-Shadow Tonal Hierarchy
- **Strict Prohibition**: Never use heavy drop-shadows (`shadow-md`, `shadow-lg`, `shadow-xl`) on data tables, metric cards, or dialogs.
- **Tonal Elevation**:
  - `Layer 0` (`#faf9f7`): Sunlit Cream viewport canvas (`bg-canvas-cream`).
  - `Layer 1` (`#fbfaf7`): Surface Ivory grouping bars, table headers, and card footers (`bg-surface-ivory`).
  - `Layer 2` (`#ffffff`): Pure white card bodies (`bg-card shadow-none`).
  - `Borders` (`#efefef`): 1px hairline boundary dividers (`border-border/70`).
- **DeltaChip Badges**: Light-tint status pills (`StatusBadge`) for `PAID`, `PENDING`, `OVERDUE`, `DECLINED`, and `ACTIVE`.

### B. Hexagonal Persistence (Ports & Adapters)
- Domain entities (`backend/src/*/domain/*.ts`) **MUST NEVER** import `@prisma/client`.
- Application services inject abstract repository class tokens.
- All transformations between Prisma records and domain entities occur exclusively in dedicated pure mappers (`relational/mappers/*-prisma.mapper.ts`).

### C. Enterprise IAM Defense-in-Depth
- **Argon2id Hashing**: Configured with `memoryCost: 19456`, `timeCost: 2`, `parallelism: 1`.
- **Automatic Migration**: Legacy bcrypt hashes (`$2a$`, `$2b$`) transparently upgrade to Argon2id upon successful user authentication.
- **HIBP k-Anonymity**: All password changes and registrations are checked against Have I Been Pwned breach registries (with network fail-open fallback).
- **Session Deduplication**: Frontend `apiFetch` uses single in-flight `refreshPromise` deduplication to prevent 401 refresh storms.

### D. Dual-Process Backend & Queue Isolation
- `main.ts`: Express REST API + Socket.IO WebSockets on port 4000.
- `main-worker.ts`: Standalone BullMQ WorkerHost application context.
- **Redis Invariant**: All BullMQ Redis connections MUST set `maxRetriesPerRequest: null`.

---

## 6. The Seven Core Agent Skills (`.agents/skills/`)

| Skill | Directory | Playbook Purpose |
| :--- | :--- | :--- |
| **`1-shadcn-base-nova`** | `.agents/skills/1-shadcn-base-nova/` | Base UI primitives, `data-slot` markup, container-query forms, DayPicker v10. |
| **`2-zero-shadow-elevation`** | `.agents/skills/2-zero-shadow-elevation/` | Sunlit Cream canvas, pure white cards, hairline borders, DeltaChip badges. |
| **`3-create-domain-slice`** | `.agents/skills/3-create-domain-slice/` | Scaffolds synchronized full-stack DDD vertical slices. |
| **`4-hexagonal-persistence`** | `.agents/skills/4-hexagonal-persistence/` | Decouples Prisma 7 from domain logic via abstract ports and pure mappers. |
| **`5-enterprise-iam-defense`** | `.agents/skills/5-enterprise-iam-defense/` | Argon2id, HIBP k-anonymity, 2FA TOTP, WebAuthn/Passkeys, refresh deduplication. |
| **`6-async-bullmq-worker`** | `.agents/skills/6-async-bullmq-worker/` | Standalone BullMQ WorkerHost, Redis resilience (`maxRetriesPerRequest: null`). |
| **`7-safe-db-migration`** | `.agents/skills/7-safe-db-migration/` | Non-destructive schema evolution, accidental data-loss prevention, shadow checks. |

---

## 7. Scaffolding New Domain Slices with Hygen

Generate a synchronized, production-grade Hexagonal domain slice in seconds:

```bash
npm --prefix backend run generate:resource
```
Follow the interactive prompt (e.g. `invoice`). The generator automatically creates:
- Pure Domain Entity (`domain/invoice.ts`)
- Validation DTOs (`dto/create-invoice.dto.ts`)
- Abstract Repository Port (`infrastructure/persistence/invoice.repository.ts`)
- Two-Way Prisma Mapper (`infrastructure/persistence/relational/mappers/invoice-prisma.mapper.ts`)
- Concrete Prisma Repository (`infrastructure/persistence/relational/repositories/invoice-prisma.repository.ts`)
- Application Service (`invoices.service.ts`)
- REST Controller (`invoices.controller.ts`)
- NestJS Module (`invoices.module.ts`)

---

## 8. Development Command Matrix

### Full Stack Orchestration
```bash
npm run dev             # Concurrently runs frontend (:3000) and backend (:4000)
npm run build           # Compiles both frontend and backend bundles
npm run typecheck       # Validates TypeScript compilation across the entire monorepo
npm run lint            # Runs ESLint across both directories
npm run format          # Formats all files with Prettier
```

### Docker Infrastructure
```bash
npm run docker:up       # Starts PostgreSQL 16 and Redis 7 in detached mode
npm run docker:down     # Stops containers and preserves volume data
npm run docker:logs     # Follows container logs
```

### Backend & Database
```bash
npm --prefix backend run start:dev          # Start NestJS API dev server
npm --prefix backend run start:worker:dev   # Start BullMQ queue worker
npm --prefix backend run prisma:migrate     # Execute database migrations
npm --prefix backend run prisma:seed        # Populate sample users and transactions
npm --prefix backend run prisma:studio      # Open Prisma Web Studio GUI
```

### Frontend
```bash
npm --prefix frontend run dev               # Start Next.js development server
npm --prefix frontend run type-check        # Check frontend TypeScript types
npm --prefix frontend run lint              # Lint frontend files
```

---

## 9. License & Governance
Proprietary © 2026 Fanaye Technologies. Built for internal engineering teams and partner enterprise platforms. All rights reserved.
