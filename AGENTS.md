# Fanaye Technologies Enterprise AI Agent Briefing & Guardrails
> **Target Active Branch**: `fanaye-technologies-boiler-plate`  
> **Architecture Paradigm**: Dual-Directory Full-Stack Monorepo (`frontend/` + `backend/`)  
> **Engineering Standard**: Hexagonal Persistence + Zero-Shadow Tonal Hierarchy + Enterprise IAM + Asynchronous Queues

---

## 1. System Invariants & Non-Negotiable Rules

All AI coding assistants (Antigravity, Cursor, Claude Code, Copilot) operating within this repository MUST strictly abide by these directives:

1. **Dual-Stack Directory Boundary**:
   - `frontend/`: Next.js 16 (App Router), React 19, Tailwind CSS v4, Shadcn `base-nova` (`@base-ui/react`), Redux Toolkit / RTK Query.
   - `backend/`: NestJS 11, Prisma 7 with PostgreSQL adapter, BullMQ, Redis, Argon2id, WebAuthn/Passkeys, Resend, Socket.IO.
   - Never cross-contaminate dependencies or import paths between frontend and backend.

2. **Frontend UI & Visual Aesthetics**:
   - **Zero-Shadow Elevation**: Strictly PROHIBIT heavy box shadows (`shadow-md`, `shadow-lg`, `shadow-xl`) on data tables and cards.
   - **Tonal Palette**: Sunlit Cream (`#faf9f7`) canvas, pure white (`#ffffff`) card bodies with `shadow-none`, surface ivory (`#fbfaf7`) grouping bars, and 1px hairline (`#efefef`) borders.
   - **Modern Primitives**: Use Shadcn `base-nova` with `@base-ui/react` and `data-slot` attributes. Never use legacy `@radix-ui/react-slot` `asChild`.
   - **Responsive Forms**: Use the container-query enabled `Field` system (`FieldSet`, `FieldGroup`, `Field`, `FieldError`) for automatic responsiveness across modals and sidebars.

3. **Backend Architecture & Persistence**:
   - **Dual-Process Isolation**: `main.ts` handles the Express HTTP REST API and WebSocket gateway; `main-worker.ts` handles BullMQ background queue workers. Never run heavy asynchronous processing directly within HTTP request handlers.
   - **Hexagonal Persistence**: Domain models (`domain/*.ts`) must NEVER import `@prisma/client`. Repository ports must be abstract TypeScript interfaces. Data transformations occur exclusively in dedicated mappers (`*-prisma.mapper.ts`).
   - **Async Device Context**: Multi-device sessions are tracked using Node.js `AsyncLocalStorage` (`requestDeviceContext`), capturing BFF-forwarded headers (`X-Device-Id`, `User-Agent`).

4. **Security & IAM Defense-in-Depth**:
   - Passwords must be hashed using **Argon2id** (`memoryCost: 19456, timeCost: 2`). Legacy bcrypt hashes must automatically rehash to Argon2id on successful login.
   - All password changes and registrations must pass Have I Been Pwned (HIBP) k-anonymity breach verification (with network fail-open).
   - Single in-flight promise deduplication (`refreshPromise`) is enforced on the frontend to prevent 401 refresh storms.

5. **Git Commit Phrasing**:
   - **Strictly No Robot Prefixes**: Never use conventional commit prefixes (`feat:`, `chore:`, `fix:`, `docs:`, `refactor:`, `agent:`).
   - Write natural, concise human phrases describing what the change achieves (e.g., *"Set up initial monorepo foundation and workspace reorganization"*).

---

## 2. The Seven Core Fanaye Skills (.agents/skills/)

When performing tasks in this repository, reference the dedicated playbooks under `.agents/skills/`:

| Skill | Directory | Core Purpose |
| :--- | :--- | :--- |
| **1-shadcn-base-nova** | `.agents/skills/1-shadcn-base-nova/` | Base UI primitives, `data-slot` markup, container-query forms, DayPicker v10 |
| **2-zero-shadow-elevation** | `.agents/skills/2-zero-shadow-elevation/` | Sunlit Cream canvas, pure white cards, hairline borders, DeltaChip status badges |
| **3-create-domain-slice** | `.agents/skills/3-create-domain-slice/` | Scaffolds synchronized full-stack DDD vertical slices (Next.js + NestJS + Hygen) |
| **4-hexagonal-persistence** | `.agents/skills/4-hexagonal-persistence/` | Decouples Prisma 7 from domain logic via abstract ports and pure mappers |
| **5-enterprise-iam-defense** | `.agents/skills/5-enterprise-iam-defense/` | Argon2id, HIBP k-anonymity, 2FA TOTP, WebAuthn/Passkeys, refreshPromise deduplication |
| **6-async-bullmq-worker** | `.agents/skills/6-async-bullmq-worker/` | Standalone BullMQ WorkerHost, Redis resilience (`maxRetriesPerRequest: null`) |
| **7-safe-db-migration** | `.agents/skills/7-safe-db-migration/` | Non-destructive schema evolution, accidental data-loss prevention, shadow verification |

---

## 3. Common Development Commands

### Full Stack Orchestration
```bash
# Run both frontend and backend concurrently
npm run dev

# Run individual services
npm run dev:frontend   # Next.js on http://localhost:3000
npm run dev:backend    # NestJS on http://localhost:4000

# Build both applications
npm run build

# Type check across the full monorepo
npm run typecheck

# Lint across the full monorepo
npm run lint
```

### Backend & Database
```bash
# Generate Prisma Client
npm --prefix backend run prisma:generate

# Apply Database Migrations
npm --prefix backend run prisma:migrate

# Seed Database with Sample Records
npm --prefix backend run prisma:seed

# Start Standalone BullMQ Background Worker
npm --prefix backend run start:worker:dev

# Generate New Relational Domain Slice via Hygen
npm --prefix backend run generate:resource
```

### Docker Infrastructure
```bash
# Start PostgreSQL 16 and Redis 7 in background
npm run docker:up

# Stop infrastructure
npm run docker:down

# View logs
npm run docker:logs
```
