"use client";

import * as React from "react";
import { CheckIcon } from "lucide-react";
import { cn } from "@/shared/utils/cn";

export type StepItem = {
  id: string;
  title: string;
  description?: string;
};

interface OnboardingStepperProps {
  steps: StepItem[];
  currentStepIndex: number;
  onStepClick?: (index: number) => void;
  className?: string;
}

export function OnboardingStepper({
  steps,
  currentStepIndex,
  onStepClick,
  className,
}: OnboardingStepperProps) {
  const currentStep = steps[currentStepIndex];
  const progressPercent = Math.round(
    ((currentStepIndex + 1) / steps.length) * 100
  );

  return (
    <div
      data-slot="onboarding-stepper"
      className={cn("flex flex-col gap-3 w-full", className)}
    >
      {/* Quiet Tabular Counter Header */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-medium text-foreground">
          <span>{currentStep?.title || "Onboarding"}</span>
          <span className="text-muted-foreground">·</span>
          <span className="font-mono text-muted-foreground tabular-nums">
            Step {currentStepIndex + 1} of {steps.length}
          </span>
        </div>
        <span className="font-mono text-xs font-semibold text-primary tabular-nums">
          {progressPercent}%
        </span>
      </div>

      {/* Progress Track */}
      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-primary transition-all duration-300 ease-out rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Step Pills / Breadcrumbs */}
      <div className="hidden sm:grid grid-cols-2 md:grid-cols-4 gap-2 pt-1">
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const isPending = index > currentStepIndex;

          return (
            <button
              key={step.id}
              disabled={isPending || !onStepClick}
              onClick={() => onStepClick?.(index)}
              className={cn(
                "flex items-center gap-2 rounded-lg border p-2 text-left transition-all text-xs",
                isCurrent &&
                  "border-primary/50 bg-primary/5 text-foreground font-medium",
                isCompleted &&
                  "border-border/60 bg-surface-ivory text-muted-foreground hover:text-foreground cursor-pointer",
                isPending &&
                  "border-border/40 bg-card/50 text-muted-foreground/60 cursor-not-allowed"
              )}
            >
              <div
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-mono",
                  isCompleted && "bg-emerald-500/10 text-emerald-600 font-semibold",
                  isCurrent && "bg-primary text-primary-foreground font-semibold",
                  isPending && "bg-muted text-muted-foreground"
                )}
              >
                {isCompleted ? <CheckIcon className="size-3" /> : index + 1}
              </div>
              <span className="truncate">{step.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
