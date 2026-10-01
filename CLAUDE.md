# Quick Reference: Fanaye Technologies Monorepo

## Stack Overview
- **Monorepo**: Root orchestrator + `frontend/` (Next.js 16) + `backend/` (NestJS 11)
- **Active Branch**: `fanaye-technologies-boiler-plate`
- **Frontend**: Next.js 16 App Router, React 19, Tailwind CSS v4, Shadcn `base-nova`, Redux Toolkit
- **Backend**: NestJS 11, Prisma 7 + PostgreSQL, BullMQ + Redis, Argon2id + 2FA + Passkeys
- **Skills**: `.agents/skills/` (The Seven Core Fanaye Skills)

## Quick Commands
```bash
# Development
npm run dev             # Start both services concurrently
npm run dev:frontend    # Next.js (port 3000)
npm run dev:backend     # NestJS (port 4000)

# Build & Quality
npm run build           # Build backend then frontend
npm run typecheck       # Full-stack TypeScript typecheck
npm run lint            # Full-stack ESLint check
npm run format          # Prettier format all files

# Database & Workers
npm --prefix backend run prisma:generate
npm --prefix backend run prisma:migrate
npm --prefix backend run prisma:seed
npm --prefix backend run start:worker:dev

# Infrastructure
npm run docker:up       # Spin up Postgres 16 & Redis 7
npm run docker:down     # Tear down containers
```

## Architectural Guardrails
1. **Zero-Shadow Elevation**: Sunlit Cream (`#faf9f7`) canvas, pure white cards, hairline 1px borders, no `shadow-md`/`shadow-lg`.
2. **Hexagonal Persistence**: Domain models must never import `@prisma/client`.
3. **Dual-Process Backend**: Web API (`main.ts`) vs BullMQ Worker (`main-worker.ts`).
4. **Git Commits**: Human-centric natural phrases without robot prefixes (`feat:`, `chore:`, etc.).
