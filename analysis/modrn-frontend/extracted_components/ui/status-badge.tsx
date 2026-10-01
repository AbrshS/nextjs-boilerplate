"use client";

import { Badge } from "@/shared/ui/badge";
import { cn } from "@/shared/utils/cn";

/** Shared outline-badge color tokens used across admin/partner tables. */
export const STATUS_TONE = {
  success: "border-primary/30 bg-primary/5 text-primary",
  danger: "border-destructive/30 bg-destructive/5 text-destructive",
  warning: "border-amber-500/30 bg-amber-500/5 text-amber-600",
  muted: "border-border text-muted-foreground",
} as const;

export type StatusTone = keyof typeof STATUS_TONE;

/**
 * Tone map for commission / service-request style statuses
 * (paid, converted, overdue, declined, new, …).
 */
export function toneForOpsStatus(status: string): StatusTone {
  const s = status.toLowerCase();
  if (s === "paid" || s === "converted" || s === "closed" || s === "active") {
    return "success";
  }
  if (
    s === "overdue" ||
    s === "declined" ||
    s === "rejected" ||
    s === "suspended" ||
    s === "failed"
  ) {
    return "danger";
  }
  if (s === "new" || s === "contacted" || s === "pending") {
    return "warning";
  }
  return "muted";
}

type StatusBadgeProps = {
  status: string;
  /** Override automatic tone mapping. */
  tone?: StatusTone;
  /** Visible label; defaults to raw status. */
  label?: string;
  className?: string;
};

export function StatusBadge({
  status,
  tone,
  label,
  className,
}: StatusBadgeProps) {
  const resolved = tone ?? toneForOpsStatus(status);
  return (
    <Badge
      variant="outline"
      className={cn("text-[10px] capitalize", STATUS_TONE[resolved], className)}
    >
      {label ?? status}
    </Badge>
  );
}
