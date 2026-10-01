# Architectural Analysis: `modrn-frontend`

## 1. Domain-Driven Feature Folder Organization

`modrn-frontend` uses a hybrid App Router + Domain-Driven Design (DDD) directory structure:
```
src/
├── app/                  # Next.js App Router (pages, layouts, route handlers)
├── config/               # App configuration & environment validation
├── core/                 # Core network client, interceptors, error boundaries
├── domains/              # Isolated business verticals
│   ├── admin/            # Administrative management surfaces
│   ├── agreements/       # Legal agreements & e-signatures
│   ├── auth/             # Authentication & session verification
│   ├── memberships/      # Tiered subscription management
│   ├── notifications/    # Push notifications & real-time alerts
│   └── students/         # Student portal workflows
├── i18n/                 # Next-Intl routing, locales, request config
├── providers/            # React context & theme providers
├── shared/               # Cross-cutting design system & utilities
│   ├── components/       # Shared composite components (AppShell, GlobalSearch, etc.)
│   ├── hooks/            # Custom reusable React hooks
│   ├── ui/               # Pure Shadcn base-nova UI primitives
│   └── utils/            # Shared pure utility functions (`cn`, `share`, etc.)
└── store/                # Redux Toolkit global client state
```

### Architectural Benefits:
1. **Vertical Slice Isolation**: Business rules and components for a single vertical (e.g. `agreements` or `memberships`) live inside `src/domains/<domain>/` rather than polluting global folders.
2. **Strict Shared Hierarchy**: Global reusables live strictly inside `src/shared/`, clearly demarcating primitives (`ui/`) from composite building blocks (`components/`).

---

## 2. Component Composition & Accessibility Patterns

### The Modern Shadcn `data-slot` Standard
Unlike older Shadcn primitives which depended solely on CSS utility cascade, the modern `base-nova` implementation annotates all interactive children with `data-slot`:
- `data-slot="field"`
- `data-slot="field-label"`
- `data-slot="field-content"`
- `data-slot="field-error"`
- `data-slot="card-content"`

This allows high-level parent components to control child typography, spacing, and variant states cleanly using Tailwind v4 arbitrary child selectors:
```tsx
// Automatically adapts child input border and error coloring without prop drilling
className="group/field flex w-full gap-2 data-[invalid=true]:text-destructive *:data-[slot=field-label]:flex-auto"
```

---

## 3. Responsive Container Queries (`@container`)

`modrn-frontend` makes extensive use of container queries (`@container/field-group`) instead of relying solely on viewport breakpoints (`md:`, `lg:`).
- When a form or card is placed in a narrow modal or sidebar, container queries trigger mobile-stacked layouts regardless of window width.
- When placed in a wide main canvas, they automatically expand to side-by-side labels and multi-column inputs.
- Syntax utilized:
  ```css
  @container/field-group flex w-full flex-col gap-5 @md/field-group:flex-row @md/field-group:items-center
  ```

---

## 4. Internationalization (i18n) Engine

Built with `next-intl`:
- Localized routing (`/en/...`, `/es/...`) managed via `src/i18n/routing.ts`.
- Server-side translation loader in `src/i18n/request.ts`.
- Type-safe navigation primitives (`Link`, `useRouter`, `usePathname`, `redirect`) exported from `@/i18n/routing`.
- Eliminates hardcoded strings and allows multi-lingual deployment out of the box.
