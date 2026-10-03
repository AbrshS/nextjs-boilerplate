---
name: 2-zero-shadow-elevation
description: Fanaye signature Zero-Shadow Tonal Hierarchy and Sunlit Cream palette design system playbook.
---

# Skill 2: Zero-Shadow Tonal Elevation & Design System

This skill enforces the signature visual aesthetic of Fanaye Technologies: high-density, crisp, elegant, and free of murky box shadows.

## 1. The 3-Layer Tonal Elevation Hierarchy
Instead of utilizing heavy drop-shadows to indicate elevation and layering, Fanaye applications use calibrated OkLCH tonal contrast:

| Layer | Semantic Role | CSS Variable | Hex Approximation | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Layer 0** | Canvas Background | `--canvas-cream` | `#faf9f7` | Page viewport background (`bg-canvas-cream`) |
| **Layer 1** | Grouping & Headers | `--surface-ivory` | `#fbfaf7` | Table headers, card footers, grouping bars |
| **Layer 2** | Card & Dialog Bodies | `--surface-white` | `#ffffff` | Elevated cards, dialog bodies (`shadow-none`) |
| **Borders** | Hairline Dividers | `--border-hairline` | `#efefef` | 1px hairline structural boundaries |

## 2. Strict Prohibition: Zero Box Shadows
- **Directive**: Strictly **PROHIBIT** `shadow-md`, `shadow-lg`, `shadow-xl`, and `shadow-2xl` on data tables, metric cards, dashboards, and dialogs.
- **Rationale**: In high-density financial platforms, heavy box-shadows introduce visual muddiness, interfere with grid alignment, and degrade readability during prolonged operational auditing.
- **Elevation Mechanism**: Visual separation MUST be achieved exclusively through:
  1. Contrast between `bg-canvas-cream` (Layer 0) and `bg-card` (Layer 2).
  2. 1px hairline borders (`border border-border/70`).
  3. Subtle surface ivory grouping bands (`bg-surface-ivory`).

## 3. DeltaChip Status Badges
Status indicators must use the light-tint DeltaChip specification from `@/shared/ui/status-badge`:
- **Success (`PAID`, `ACTIVE`, `COMPLETED`)**: Light emerald tint (`bg-positive/10 text-positive border-positive/30`).
- **Danger (`OVERDUE`, `DECLINED`, `BLOCKED`)**: Light rose tint (`bg-danger/10 text-danger border-danger/30`).
- **Warning (`PENDING`, `REVIEWING`)**: Light amber tint (`bg-warning/15 text-warning-foreground border-warning/40`).
- **Info / Muted**: Soft slate tint (`bg-muted/40 text-muted-foreground border-border/70`).

## 4. Recharts Financial Palette
When implementing charts, reference the calibrated OKLCH chart tokens:
- `--color-chart-1` (Emerald Inflow): `oklch(0.627 0.194 149.214)`
- `--color-chart-2` (Deep Slate Outflow): `oklch(0.55 0.05 260)`
- `--color-chart-3` (Amber Pending): `oklch(0.769 0.188 70.08)`
- `--color-chart-4` (Indigo Secondary): `oklch(0.585 0.233 277.117)`
- `--color-chart-5` (Teal Neutral): `oklch(0.696 0.17 162.48)`
