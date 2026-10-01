# Living Progress Log & Technical Decisions Log

## 1. Project Milestone Tracker

| Phase | Milestone Name | Status | Completion Date | Notes / Artifacts |
|---|---|---|---|---|
| **Phase 0** | **Living Memory & Engineering Governance Setup** | **COMPLETED** | 2026-10-01 | Initialized `memory/` architecture and governance rules. |
| **Phase 1** | **Repository Ingestion & Baseline Ingestion** | **COMPLETED** | 2026-10-01 | Ingested `https://github.com/AbrshS/nextjs-boilerplate.git` onto branch `fanaye-technologies-boiler-plate`. |
| **Phase 2** | **Baseline Boilerplate Deep Analysis** | **COMPLETED** | 2026-10-01 | Analyzed `AbrshS/nextjs-boilerplate`, cataloged gaps in `analysis/nextjs-boilerplate/`. |
| **Phase 3** | **Company Flagship Projects Analysis** | **COMPLETED** | 2026-10-01 | Analyzed `fanaye_job_os_platform` (TefTef), `fin-core`, `modrn-frontend`, and `modrn-backend`. Extracted Auth, Onboarding, Zero-Shadow UI, Financial Dashboards, Shadcn `base-nova`, Dual-Process NestJS 11, Prisma 7 Hexagonal Persistence, Argon2id, BullMQ, and Hygen generators. |
| **Phase 4** | **Global Best-of-Breed Boilerplate Benchmarking** | **COMPLETED** | 2026-10-01 | Benchmarked `oNo500/nestjs-boilerplate`, 2026 Dev.to AI-ready standards, Base UI vs Radix UI, Drizzle vs Prisma, and Agentic Skills governance. Documented in `analysis/global_benchmarks/` and `analysis/company_architecture_synthesis.md`. |
| **Phase 5** | **Synthesis & Unified Boilerplate Assembly** | READY TO START | - | Consolidate extracted components into the definitive Fanaye Boilerplate (`frontend/` + `backend/`). |
| **Phase 6** | **Hardening, Type-Safety, Verification & Docs** | PENDING | - | End-to-end tests, Dockerization, Swagger validation, developer onboarding guide. |

---

## 2. Technical Decisions Log (TDL)

### [TDL-001] Strict Multi-Repo Analysis Before Code Refinement
- **Date**: 2026-10-01
- **Status**: APPROVED
- **Context**: The CTO mandate requires eliminating redundant architectural buildup across company projects. Jumping directly into coding the boilerplate without analyzing all company and industry benchmarks risks missed components and architectural drift.
- **Decision**: No boilerplate code mutation will occur until all candidate repositories are analyzed and cataloged into `analysis/<repo_name>/` directories.
- **Consequences**: Guarantees comprehensive capture of company-specific business logic, auth requirements, and utility modules.

### [TDL-002] Modular Architecture with Pluggable Core Subsystems
- **Date**: 2026-10-01
- **Status**: APPROVED
- **Context**: Different company projects may require varying combinations of features (e.g., some need WebSockets, some need queues, some need multi-tenancy).
- **Decision**: The master architecture is structured around 10 distinct, loosely-coupled pillars adhering to Clean / Hexagonal Architecture principles.
- **Consequences**: Modules can be enabled or configured without rewiring the entire application core.

### [TDL-003] Human-Centric Git Commit Message Protocol
- **Date**: 2026-10-01
- **Status**: APPROVED
- **Context**: Team preference mandates natural, human-written commit messages and eliminates robotic prefixes (`feat:`, `chore:`, `agent:`).
- **Decision**: All commits must use clear, concise human phrasing (e.g., "Add initial memory architecture and guidelines").
- **Consequences**: Clearer commit history aligned with team workflow standards.

### [TDL-004] Standardized Multi-Repo Analysis Schema
- **Date**: 2026-10-01
- **Status**: APPROVED
- **Context**: To compare disparate company repositories and global boilerplates systematically, analysis directories must adhere to a uniform structure.
- **Decision**: Every analyzed repository gets `analysis/<repo_name>/` containing `<repo_name>_analysis.md`, `arch_analysis.md`, and `extracted_components/`.
- **Consequences**: Streamlines final synthesis phase and component reusability.

### [TDL-005] Shadcn UI Exclusivity and Modernization Mandate
- **Date**: 2026-10-01
- **Status**: APPROVED
- **Context**: Direct requirement from project leadership (Abrsh) mandates using exclusively Shadcn UI, updated to the newest practices (Radix UI primitives + CVA + Tailwind CSS v4 tokens).
- **Decision**: Discard all ad-hoc UI libraries. Standardize the boilerplate UI layer strictly around modern Shadcn UI primitives located under `src/components/ui/`.
- **Consequences**: Unifies styling, ensures high accessibility compliance, and simplifies component maintenance across company projects.

### [TDL-006] Component Decoupling & Independent Composability
- **Date**: 2026-10-01
- **Status**: APPROVED
- **Context**: Flagship projects (like TefTef) have tight couplings between UI components and domain-specific Redux slices or routes.
- **Decision**: Harvested components (e.g., `DataTable`, `PaginationControls`, `ProfilePreparingWait`, `MatchScore`, `AnimatedGlassPageBackground`) will be decoupled into self-contained components with pure TypeScript props during the final synthesis phase.
- **Consequences**: Any new Fanaye project will be able to import and use these components without requiring domain-specific state baggage.

### [TDL-007] Zero-Shadow Tonal Hierarchy & Border-Led Elevation
- **Date**: 2026-10-01
- **Status**: APPROVED
- **Context**: High-density financial applications suffer from visual clutter and muddy interfaces when heavy drop shadows are applied to dense grids and cards.
- **Decision**: Standardize on `fin-core`'s zero-shadow architecture: warm canvas cream (`#faf9f7`) background, pure white (`#ffffff`) card bodies with `shadow-none`, surface ivory (`#fbfaf7`) grouping headers/footers, and crisp 1px hairline (`#efefef`) borders.
- **Consequences**: Clean, modern, editorial aesthetic with zero blur lag and superior optical legibility.

### [TDL-008] Refresh Token Single In-Flight Promise Deduplication
- **Date**: 2026-10-01
- **Status**: APPROVED
- **Context**: When a token expires, multiple parallel client requests trigger simultaneous refresh calls. With single-use refresh tokens, the second call fails, logging the user out.
- **Decision**: Implement a single module-level `refreshPromise` in the auth network layer that all concurrent callers await until resolution.
- **Consequences**: Eliminates 401 refresh race conditions and prevents premature session invalidation.

### [TDL-009] Tailwind v4 Spacing Injection Constraint
- **Date**: 2026-10-01
- **Status**: APPROVED
- **Context**: In Tailwind CSS v4, defining custom spacing like `--spacing-8: 8px` under `@theme` overrides all standard sizing utilities (e.g., `h-8`, `w-8`, `size-8`), breaking Shadcn sidebars and avatars.
- **Decision**: Custom spacing scale variables must strictly live in `:root` as plain CSS properties and never be declared under `@theme`.
- **Consequences**: Prevents catastrophic layout collapses across all Shadcn UI components.

### [TDL-010] Modern Shadcn `base-nova` & Container-Query Form System
- **Date**: 2026-10-01
- **Status**: APPROVED
- **Context**: Traditional form layouts break when placed in sidebars, popovers, or narrow modals. Moreover, classic Radix primitives add runtime bulk compared to newer Base UI implementations.
- **Decision**: Adopt Shadcn `base-nova` with `@base-ui/react` primitives and standardized `data-slot` markup. Standardize form composition on the container-query enabled `Field` system (`FieldSet`, `FieldGroup`, `Field`, `FieldError`) for automatic responsiveness across all contexts.
- **Consequences**: Provides seamless responsiveness inside modals, sidebars, and full-screen layouts with built-in accessible error deduplication.

### [TDL-011] Dual-Process NestJS Architecture & Thread-Local Device Context
- **Date**: 2026-10-01
- **Status**: APPROVED
- **Context**: Monolithic Node.js backends that handle heavy asynchronous tasks (emails, PDF contract generation, license verification) alongside HTTP requests suffer latency spikes and API timeouts under load.
- **Decision**: Separate the backend into dual processes: `main.ts` (API Web Server) and `main-worker.ts` (BullMQ Standalone Application Context). Capture client device metadata at the Express boundary using Node.js `AsyncLocalStorage` (`requestDeviceContext`) for multi-device session tracking without parameter pollution.
- **Consequences**: Zero HTTP latency degradation during asynchronous spikes; effortless multi-device session auditing across all services.

### [TDL-012] Enterprise IAM Defense-in-Depth & Password Lifecycle
- **Date**: 2026-10-01
- **Status**: APPROVED
- **Context**: Legacy applications often rely on outdated bcrypt hashing without breach detection or sequence checking, exposing user accounts to credential stuffing.
- **Decision**: Standardize on Argon2id with automatic transparent re-hashing of legacy bcrypt hashes upon login. Enforce Have I Been Pwned (HIBP) k-anonymity breach verification with network fail-open, sequence similarity checks, and native WebAuthn/Passkey registration.
- **Consequences**: Bank-grade password security and friction-free user authentication.

### [TDL-013] PostgreSQL & Prisma 7 Hexagonal Persistence as Fanaye Standard
- **Date**: 2026-10-01
- **Status**: APPROVED
- **Context**: Global benchmarks explore Drizzle, TypeORM, and Prisma. However, analysis of Fanaye's production codebases confirms that PostgreSQL managed through Prisma 7 (`@prisma/client` + `@prisma/adapter-pg`) under a strict Hexagonal / Clean Architecture (pure domain entities, abstract repository ports, and dedicated two-way mappers) is the company standard.
- **Decision**: Standardize backend persistence exclusively on PostgreSQL + Prisma 7 within a Hexagonal repository structure. Business domains must never import `@prisma/client` directly.
- **Consequences**: Type-safe migrations, zero ORM vendor lock-in in business logic, and consistency across all company engineering teams.

### [TDL-014] Three-Tier Agentic Guidance & Skill Architecture
- **Date**: 2026-10-01
- **Status**: APPROVED
- **Context**: Modern engineering teams rely on AI coding assistants (Antigravity, Cursor, Claude Code, Copilot). Without explicit structuring, AI assistants invent ad-hoc patterns or violate architectural constraints.
- **Decision**: Structure the boilerplate with a 3-tier AI guidance architecture:
  1. Root `AGENTS.md` (universal briefing & guardrails).
  2. Modular Antigravity `.agents/skills/` (on-demand capability playbooks for domain generation, UI components, and safe migrations).
  3. Scoped `frontend/AGENTS.md` and `backend/AGENTS.md` to prevent cross-stack confusion.
- **Consequences**: Ensures AI agents generate consistent, production-grade code adhering strictly to Fanaye conventions.

### [TDL-015] The Seven Core Fanaye Agent Skills Suite
- **Date**: 2026-10-01
- **Status**: APPROVED
- **Context**: Drawing from global skill directories (skills.sh, AgenticSkills, VoltAgent, finfin/awesome-frontend-skills, jakubkrehel/skills), AI agents require domain-specific operational skills rather than generic prompts to avoid architectural regressions.
- **Decision**: Define and standardize seven company-specific skills under `.agents/skills/`:
  1. `1-shadcn-base-nova` (Base UI, data-slot, container-query forms, DayPicker v10)
  2. `2-zero-shadow-elevation` (Sunlit Cream, pure white cards, hairline borders, no muddy drop shadows)
  3. `3-create-domain-slice` (Full-stack DDD vertical slices synchronized across frontend and backend)
  4. `4-hexagonal-persistence` (Prisma 7 domain isolation via ports and mappers)
  5. `5-enterprise-iam-defense` (Argon2id, HIBP k-anonymity, 2FA TOTP, Passkeys, refresh promise deduplication)
  6. `6-async-bullmq-worker` (Dedicated BullMQ worker, Redis resilience with maxRetriesPerRequest: null)
  7. `7-safe-db-migration` (Accidental data-loss prevention, non-destructive schema migrations)
- **Consequences**: Guarantees that any AI coding assistant automatically adheres to Fanaye Technologies' engineering, UI/UX, security, and persistence standards.

---

## 3. Current Sprint Status & Immediate Blockers
- **Current Step**: Completed deep analysis of the AI Agent Skills ecosystem and defined the Seven Core Fanaye Skills. Documented in `analysis/skills_and_agentic_ecosystem.md`.
- **Next Step**: Await user direction to begin Phase 5 (Synthesis & Master Monorepo Assembly: reorganizing into `frontend/` and `backend/`, and assembling all extracted subsystems).
- **Immediate Blocker**: None.



