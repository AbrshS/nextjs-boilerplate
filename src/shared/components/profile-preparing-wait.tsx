"use client";

import * as React from "react";
import { Loader2Icon, SparklesIcon, CheckCircle2Icon } from "lucide-react";
import { Card, CardContent } from "@/shared/ui/card";
import { cn } from "@/shared/utils/cn";

interface ProfilePreparingWaitProps {
  onComplete?: () => void;
  durationMs?: number;
  className?: string;
}

const PREPARATION_STEPS = [
  "Generating cryptographic master session key...",
  "Verifying Have I Been Pwned zero-knowledge anonymity...",
  "Configuring Zero-Shadow financial workspace...",
  "Syncing multi-device context across nodes...",
  "Finalizing enterprise ledger permissions...",
];

export function ProfilePreparingWait({
  onComplete,
  durationMs = 3200,
  className,
}: ProfilePreparingWaitProps) {
  const [progress, setProgress] = React.useState(0);
  const [currentStepIdx, setCurrentStepIdx] = React.useState(0);
  const [isFinished, setIsFinished] = React.useState(false);

  React.useEffect(() => {
    const startTime = performance.now();

    const frame = (now: number) => {
      const elapsed = now - startTime;
      const linearRatio = Math.min(1, elapsed / durationMs);

      // Easing function: easeOutCubic
      const eased = 1 - Math.pow(1 - linearRatio, 3);
      const currentPct = Math.round(eased * 100);

      setProgress(currentPct);

      // Calculate corresponding step
      const stepIdx = Math.min(
        PREPARATION_STEPS.length - 1,
        Math.floor(linearRatio * PREPARATION_STEPS.length)
      );
      setCurrentStepIdx(stepIdx);

      if (linearRatio < 1) {
        requestAnimationFrame(frame);
      } else {
        setIsFinished(true);
        setTimeout(() => {
          onComplete?.();
        }, 500);
      }
    };

    const animId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(animId);
  }, [durationMs, onComplete]);

  return (
    <div
      data-slot="profile-preparing-wait"
      className={cn("relative flex items-center justify-center p-6", className)}
    >
      {/* Background Radial Glow */}
      <div className="absolute -inset-4 rounded-3xl bg-radial from-primary/10 via-primary/5 to-transparent blur-2xl pointer-events-none" />

      <Card className="relative w-full max-w-md border-border/80 bg-card p-6 shadow-none text-center">
        <CardContent className="flex flex-col items-center gap-6 p-0">
          {/* Pulsing Central Icon */}
          <div className="relative flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            {isFinished ? (
              <CheckCircle2Icon className="size-8 text-emerald-600 animate-in zoom-in-50" />
            ) : (
              <>
                <SparklesIcon className="size-7 animate-pulse" />
                <div className="absolute inset-0 rounded-2xl ring-2 ring-primary/20 animate-ping opacity-30" />
              </>
            )}
          </div>

          {/* Easing Tabular Ticker */}
          <div className="flex flex-col items-center gap-1">
            <span className="font-mono text-5xl font-bold tracking-tight text-foreground tabular-nums">
              {progress}
              <span className="text-2xl font-light text-muted-foreground ml-1">
                %
              </span>
            </span>
            <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
              {isFinished ? "Ready" : "Preparing Workspace"}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-[width] duration-75 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Current Step Label with Spinner */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground min-h-[1.5rem]">
            {!isFinished && <Loader2Icon className="size-3.5 animate-spin text-primary shrink-0" />}
            <span className="truncate">{PREPARATION_STEPS[currentStepIdx]}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
