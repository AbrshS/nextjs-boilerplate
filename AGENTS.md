# Fanaye Technologies Enterprise Frontend Next.js Boilerplate
> **Architecture Paradigm**: Next.js 16 (App Router) + React 19 + Tailwind CSS v4 + Shadcn base-nova + Zero-Shadow Tonal Hierarchy  
> **Author & Lead Architect**: Natinael Samuel (2026) | afritioalberts1216@gmail.com | +251904161978

---

## 1. System Invariants & Non-Negotiable Directives

All AI coding assistants (Antigravity, Cursor, Claude Code, Copilot) operating within this repository MUST strictly abide by these directives:

1. **Zero-Shadow Elevation**:
   - Strictly PROHIBIT heavy box shadows (`shadow-md`, `shadow-lg`, `shadow-xl`) on data tables, metric cards, dialogs, and navigation bars.
   - Contrast is achieved exclusively through calibrated OkLCH tones:
     - Viewport Canvas: `--canvas-cream` (`#faf9f7`) -> `bg-canvas-cream`
     - Grouping & Headers: `--surface-ivory` (`#fbfaf7`) -> `bg-surface-ivory`
     - Card & Modal Bodies: `--surface-white` (`#ffffff`) with `shadow-none`
     - Structural Dividers: 1px hairline (`#efefef`) -> `border-border/70`

2. **Modern Primitives (`@base-ui/react`)**:
   - Use Shadcn `base-nova` with `@base-ui/react` and `data-slot` markup.
   - Never use legacy `@radix-ui/react-slot` `asChild`. Base UI uses render props (`render={<button ... />}`).

3. **Responsive Container-Query Forms**:
   - Always compose forms using the container-query enabled `Field` system (`FieldSet`, `FieldGroup`, `Field`, `FieldError`).
   - Adapts seamlessly between narrow sidebars, popovers, dialogs, and full-screen views with built-in accessibility.

4. **Network Layer Invariants**:
   - All HTTP requests route through `src/core/network/api-client.ts`.
   - Device context: captures/persists `X-Device-Id` in localStorage/cookies.
   - Concurrency safety: single in-flight `refreshPromise` deduplication prevents 401 refresh storms.

5. **Memo - Living Memory Governance**:
   - Workspace utilizes the **Memo - Living Memory** extension (`natinaelsamuel.memo-living-memory`).
   - Architectural decisions and milestones are logged in `memory/progress_log.md` and `memory/edit_log.md`.

6. **Git Commit Phrasing**:
   - **Strictly No Robot Prefixes**: Never use conventional commit prefixes (`feat:`, `chore:`, `fix:`, `docs:`, `refactor:`, `agent:`).
   - Write natural, concise human phrases describing what the change achieves.

---

## 2. Core Agent Skills (.agents/skills/)

| Skill | Directory | Core Purpose |
| :--- | :--- | :--- |
| **1-shadcn-base-nova** | `.agents/skills/1-shadcn-base-nova/` | Base UI primitives, `data-slot` markup, container-query forms, DayPicker v10 |
| **2-zero-shadow-elevation** | `.agents/skills/2-zero-shadow-elevation/` | Sunlit Cream canvas, pure white cards, hairline borders, DeltaChip status badges |
| **3-create-domain-slice** | `.agents/skills/3-create-domain-slice/` | Scaffolds synchronized frontend domain views and client state |

---

## 3. Command Cheat Sheet

```bash
# Start Next.js development server
npm run dev

# Build production bundle
npm run build

# Start production server
npm run start

# Validate TypeScript types
npm run type-check

# Run linter
npm run lint

# Format code
npm run format
```
