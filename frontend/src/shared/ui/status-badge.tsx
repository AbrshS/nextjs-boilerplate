"use client";

import * as React from "react";
import { Badge } from "@/shared/ui/badge";
import { cn } from "@/shared/utils/cn";

/** Signature Fanaye DeltaChip light-tint status tokens (zero muddy dropshadows) */
export const STATUS_TONE = {
  success: "border-positive/30 bg-positive/10 text-positive dark:border-positive/25 dark:bg-positive/15",
  danger: "border-danger/30 bg-danger/10 text-danger dark:border-danger/25 dark:bg-danger/15",
  warning: "border-warning/40 bg-warning/15 text-warning-foreground dark:border-warning/30 dark:bg-warning/20",
  info: "border-info/30 bg-info/10 text-info dark:border-info/25 dark:bg-info/15",
  muted: "border-border/70 bg-muted/40 text-muted-foreground",
} as const;

export type StatusTone = keyof typeof STATUS_TONE;

/** Tone map for operations / transaction / user status values */
export function toneForOpsStatus(status: string): StatusTone {
  const s = status.toLowerCase();
  if (s === "paid" || s === "converted" || s === "active" || s === "completed" || s === "success") {
    return "success";
  }
  if (s === "overdue" || s === "declined" || s === "rejected" || s === "suspended" || s === "locked" || s === "failed") {
    return "danger";
  }
  if (s === "new" || s === "pending" || s === "contacted" || s === "processing") {
    return "warning";
  }
  if (s === "info" || s === "reviewing") {
    return "info";
  }
  return "muted";
}

type StatusBadgeProps = {
  status: string;
  tone?: StatusTone;
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
      data-slot="status-badge"
      className={cn("text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full border shadow-none", STATUS_TONE[resolved], className)}
    >
      {label ?? status}
    </Badge>
  );
}
