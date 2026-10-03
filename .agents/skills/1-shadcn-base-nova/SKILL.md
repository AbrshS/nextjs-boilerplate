---
name: 1-shadcn-base-nova
description: Modern Shadcn base-nova UI playbook with Base UI primitives, data-slot markup, container-query forms, and DayPicker v10.
---

# Skill 1: Shadcn Base-Nova & Modern UI Primitives

This skill governs the construction, extension, and maintenance of frontend UI components in the Fanaye Technologies ecosystem.

## 1. Core Principles & Philosophy
- **Style Archetype**: Shadcn `base-nova`.
- **Headless Engine**: Built on `@base-ui/react` (MUI Base UI v1) rather than legacy Radix UI wherever possible.
- **Composition Standard**: Use Base UI's native `render` prop (e.g. `<TooltipTrigger render={<button ... />} />`) or direct element wrapping. Strictly **REJECT** legacy `@radix-ui/react-slot` `asChild`.
- **Inspection Markup**: Every primitive MUST include a descriptive `data-slot="..."` attribute for semantic DOM inspection, automated testing, and CSS targeting (e.g., `data-slot="card"`, `data-slot="dialog-content"`).

## 2. Container-Query Form System
All form inputs MUST use the responsive `Field` architecture from `@/shared/ui/field`:
- `<FieldSet>`: Groups related form sections.
- `<FieldGroup>`: Container-query aware group (`@container/field-group`).
- `<Field orientation="vertical | horizontal">`: Houses the input, label, description, and error.
- `<FieldError>`: Automatic error deduplication and accessibility announcement (`role="alert"`).

### Example Usage:
```tsx
import { FieldSet, FieldGroup, Field, FieldError } from "@/shared/ui/field";
import { Label } from "@/shared/ui/label";
import { Input } from "@/shared/ui/input";

export function UserProfileForm() {
  return (
    <FieldSet>
      <FieldGroup>
        <Field>
          <Label htmlFor="username">Username</Label>
          <Input id="username" placeholder="john.doe" />
        </Field>
      </FieldGroup>
    </FieldSet>
  );
}
```

## 3. Date & Calendar Primitives
- Use `react-day-picker` v9/v10 as implemented in `@/shared/ui/calendar`.
- Full RTL and locale support via `next-intl`.
- No inline style overrides; style entirely via Tailwind v4 utilities.

## 4. Anti-Patterns to Avoid
1. Never import `@radix-ui/react-slot` `Slot` or use `asChild`.
2. Never attach ad-hoc box shadows to form inputs or dialog popups.
3. Never use pixel values in component classes when theme tokens are available (`bg-card`, `border-border/70`, `text-foreground`).
