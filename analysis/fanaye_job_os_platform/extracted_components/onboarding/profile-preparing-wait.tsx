"use client";

import { useEffect, useState } from "react";
import { Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/utils/cn";

const TICK_MS = 120;
/** Ease toward this ceiling while waiting for the backend. */
const SOFT_CEILING = 92;
/** Rough expected wait used for easing (not real backend progress). */
const EXPECTED_MS = 55_000;

type ProfilePreparingWaitProps = {
  startedAt?: string | null;
  complete?: boolean;
  canStartOver?: boolean;
  startOverLoading?: boolean;
  onStartOver?: () => void;
  needsDifferentSources?: boolean;
  className?: string;
};

export function ProfilePreparingWait({
  startedAt,
  complete = false,
  canStartOver = false,
  startOverLoading = false,
  onStartOver,
  needsDifferentSources = false,
  className,
}: ProfilePreparingWaitProps) {
  const [percent, setPercent] = useState(4);

  useEffect(() => {
    if (complete) {
      setPercent(100);
      return;
    }

    const origin = startedAt ? Date.parse(startedAt) : Date.now();
    const safeOrigin = Number.isFinite(origin) ? origin : Date.now();

    function tick() {
      const elapsed = Math.max(0, Date.now() - safeOrigin);
      const t = Math.min(1, elapsed / EXPECTED_MS);
      // Ease-out: fast early, slow near the soft ceiling
      const eased = 1 - Math.pow(1 - t, 2.2);
      const next = Math.max(4, Math.round(eased * SOFT_CEILING));
      setPercent((current) => Math.max(current, next));
    }

    tick();
    const id = window.setInterval(tick, TICK_MS);
    return () => window.clearInterval(id);
  }, [startedAt, complete]);

  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-md flex-col items-center px-2 py-10 text-center",
        className,
      )}
    >
      {needsDifferentSources ? (
        <>
          <p className="text-[15px] font-semibold text-zinc-900 dark:text-white">
            We couldn&apos;t finish preparing your profile
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-500">
            Try different sources or upload another resume to continue.
          </p>
          {canStartOver && onStartOver ? (
            <Button
              type="button"
              onClick={onStartOver}
              disabled={startOverLoading}
              className="mt-8 h-11 rounded-full bg-primary px-6 font-semibold text-primary-foreground hover:bg-primary/90"
            >
              {startOverLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RotateCcw className="h-4 w-4" />
              )}
              Try different sources
            </Button>
          ) : null}
        </>
      ) : (
        <>
          <p
            className="tabular-nums text-6xl font-bold tracking-tight text-zinc-950 dark:text-white sm:text-7xl"
            aria-live="polite"
            aria-atomic="true"
          >
            {percent}
            <span className="text-3xl font-semibold text-zinc-400 sm:text-4xl">
              %
            </span>
          </p>

          <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-900">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-200 ease-out"
              style={{ width: `${percent}%` }}
            />
          </div>

          <h2 className="mt-8 text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
            {complete ? "Profile ready" : "Building your profile"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-zinc-500">
            {complete
              ? "Taking you to review…"
              : "Usually about a minute. You can keep this tab open."}
          </p>

          {canStartOver && onStartOver && !complete ? (
            <Button
              type="button"
              variant="outline"
              onClick={onStartOver}
              disabled={startOverLoading}
              className="mt-8 h-11 rounded-full border-zinc-200 bg-white px-5 font-semibold text-zinc-700 shadow-sm hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200"
            >
              {startOverLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RotateCcw className="h-4 w-4" />
              )}
              Start over
            </Button>
          ) : null}
        </>
      )}
    </div>
  );
}
