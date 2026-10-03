# Fanaye Technologies — Frontend AI Agent Directives & Guardrails
> **Subsystem Scope**: `frontend/` (Next.js 16 App Router, React 19, Tailwind CSS v4, Base UI Nova)

---

## 1. Architectural Guardrails & Standards
1. **Directory Isolation**:
   - All code in `frontend/` must remain completely decoupled from `backend/`.
   - Never import `@prisma/client`, NestJS modules, or backend services.
   - Communicate with the backend strictly through HTTP REST and WebSockets using `@/core/network/api-client.ts`.

2. **Visual Standards — Zero-Shadow Tonal Hierarchy**:
   - **Strictly PROHIBIT** heavy drop shadows (`shadow-md`, `shadow-lg`, `shadow-xl`) on data tables, cards, and modal dialogs.
   - Use the 3-Layer Tonal Elevation system:
     - `bg-canvas-cream` (`#faf9f7`) for the viewport canvas.
     - `bg-surface-ivory` (`#fbfaf7`) for grouping headers, footers, and table headings.
     - `bg-card` (`#ffffff`) for elevated card and dialog bodies.
     - `1px` `#efefef` (`border-border/70`) hairline borders for structural boundary definition.
   - Use DeltaChip light-tint status badges (`StatusBadge` with `STATUS_TONE`).

3. **Modern Shadcn `base-nova` Primitives**:
   - Use Base UI (`@base-ui/react`) primitives.
   - Never use legacy `@radix-ui/react-slot` `asChild`; use Base UI `render` prop.
   - Ensure all UI primitives expose semantic `data-slot` attributes (e.g. `data-slot="card"`).

4. **Container-Query Form Fields**:
   - Forms must use the responsive container-query `Field` architecture (`FieldSet`, `FieldGroup`, `Field`, `FieldError`).
   - Ensures forms automatically adapt inside slide-over sheets, modals, and full pages.

5. **Network Resilience & IAM**:
   - Every outbound request MUST include `X-Device-Id` for multi-device session governance.
   - Use single in-flight `refreshPromise` deduplication in `apiFetch` to prevent 401 refresh storms.

---

## 2. Common Frontend Commands
```bash
# Start Next.js development server
npm run dev

# Run TypeScript compiler check
npm run type-check

# Run ESLint validation
npm run lint

# Format codebase with Prettier
npm run format
```
