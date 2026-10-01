"use client";

import * as React from "react";
import { cn } from "@/shared/utils/cn";

export type OnboardingStepItem = {
  id: string;
  label: string;
};

type OnboardingStepperProps = {
  steps: OnboardingStepItem[];
  /** 0-based index of the current step */
  currentIndex: number;
  className?: string;
};

/**
 * Quiet corner counter — only "Profile · 3/6" style metadata.
 * No bar, circles, or full step list.
 */
export function OnboardingStepper({
  steps,
  currentIndex,
  className,
}: OnboardingStepperProps) {
  const safeIndex = Math.max(0, Math.min(currentIndex, steps.length - 1));
  const current = steps[safeIndex];
  const stepNumber = safeIndex + 1;
  const total = steps.length;

  if (!current) return null;

  return (
    <p
      aria-label={`Step ${stepNumber} of ${total}: ${current.label}`}
      className={cn(
        "text-[11px] sm:text-xs font-medium tracking-wide text-muted-foreground select-none",
        className,
      )}
    >
      <span className="text-foreground/80">{current.label}</span>
      <span className="mx-1.5 text-muted-foreground/50">·</span>
      <span className="tabular-nums">
        {stepNumber}/{total}
      </span>
    </p>
  );
}
