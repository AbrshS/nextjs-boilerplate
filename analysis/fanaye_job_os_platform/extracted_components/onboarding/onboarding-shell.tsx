"use client";

import type { ReactNode } from "react";
import { AnimatedGlassPageBackground } from "@/shared/components/animated-glass-background";
import { glassHeaderClassName } from "@/shared/components/glass-panel";
import { SimpleThemeToggle } from "@/shared/components/simple-theme-toggle";
import { TefTefLogo } from "@/shared/components/teftef-logo";
import { cn } from "@/shared/utils/cn";

export const PROFILE_IMPORT_PROGRESS = {
  sources: 25,
  preparing: 50,
  review: 75,
  preferences: 100,
} as const;

function OnboardingProgress({
  percent,
  loading,
}: {
  percent: number;
  loading?: boolean;
}) {
  return (
    <div
      className="relative h-1 w-full overflow-hidden bg-white/30 dark:bg-zinc-950/40"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      aria-busy={loading}
    >
      <div
        className="absolute inset-y-0 left-0 bg-primary transition-[width] duration-500 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
      />
      {loading ? (
        <div className="absolute inset-0 overflow-hidden">
          <div className="animate-profile-import-loader absolute inset-y-0 w-1/3 bg-linear-to-r from-transparent via-primary/80 to-transparent" />
        </div>
      ) : null}
    </div>
  );
}

export function OnboardingShell({
  progress,
  loading = false,
  children,
  footer,
  contentClassName,
  maxWidthClassName = "max-w-3xl",
}: {
  progress: number;
  loading?: boolean;
  children: ReactNode;
  footer?: ReactNode;
  contentClassName?: string;
  maxWidthClassName?: string;
}) {
  return (
    <main className="relative flex h-dvh flex-col overflow-hidden bg-background text-zinc-950 transition-colors duration-300 dark:text-white">
      <AnimatedGlassPageBackground />

      <div className="absolute top-4 right-4 z-30 sm:top-5 sm:right-5">
        <SimpleThemeToggle />
      </div>

      <header
        className={cn(
          "relative z-20 shrink-0 overflow-hidden",
          glassHeaderClassName,
        )}
      >
        <div className="relative flex w-full items-center justify-center px-5 py-4 sm:px-8 sm:py-5">
          <TefTefLogo className="h-7 w-auto text-foreground" />
        </div>
        <OnboardingProgress percent={progress} loading={loading} />
      </header>

      <div className="relative z-10 min-h-0 flex-1 overflow-y-auto">
        <div
          className={cn(
            "mx-auto w-full px-5 pt-8 sm:px-8 sm:pt-10",
            footer ? "pb-36" : "pb-12",
            maxWidthClassName,
            contentClassName,
          )}
        >
          {children}
        </div>
      </div>

      {footer ? (
        <footer className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[15%]">
          <div
            className="absolute inset-0 bg-linear-to-t from-white/70 via-white/35 to-transparent backdrop-blur-md dark:from-zinc-950/70 dark:via-zinc-950/35"
            aria-hidden
          />
          <div className="pointer-events-auto relative flex h-full items-end justify-center gap-3 px-5 pb-6 sm:px-8 sm:pb-8">
            {footer}
          </div>
        </footer>
      ) : null}
    </main>
  );
}

export function OnboardingTitle({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mx-auto mb-8 max-w-xl text-center">
      <h1 className="text-[1.75rem] font-bold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
        {title}
      </h1>
      {description ? (
        <p className="mt-2 text-[15px] leading-6 text-zinc-500 dark:text-zinc-400">
          {description}
        </p>
      ) : null}
    </div>
  );
}
