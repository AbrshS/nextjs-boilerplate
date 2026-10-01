"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { glassCardClassName, glassPanelClassName } from "@/shared/components/glass-panel";
import { cn } from "@/shared/utils/cn";

const PREPARING_TIPS = [
  {
    title: "Your profile is being shaped",
    body: "We pull the strongest signals from your sources into one clear professional story you can review next.",
  },
  {
    title: "Specific beats generic",
    body: "Roles, tools, and outcomes help matching more than vague titles. You can tighten wording on the review step.",
  },
  {
    title: "Numbers travel farther",
    body: "Impact like “cut load time 40%” or “led a team of 5” stands out. Add them when you review if they are missing.",
  },
  {
    title: "Preferences come right after",
    body: "Once your profile is ready, you will set target roles and work preferences so matches stay relevant.",
  },
  {
    title: "Nothing is locked yet",
    body: "Everything we draft is editable. Treat this as a strong first pass, not a final commit.",
  },
] as const;

const AUTO_ADVANCE_MS = 5_500;

type PreparingTipsCarouselProps = {
  className?: string;
};

export function PreparingTipsCarousel({
  className,
}: PreparingTipsCarouselProps) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);

  const tipCount = PREPARING_TIPS.length;
  const tip = PREPARING_TIPS[index] ?? PREPARING_TIPS[0];

  function goTo(nextIndex: number, nextDirection: number) {
    setDirection(nextDirection);
    setIndex((nextIndex + tipCount) % tipCount);
  }

  function goNext() {
    goTo(index + 1, 1);
  }

  function goPrev() {
    goTo(index - 1, -1);
  }

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => {
      setDirection(1);
      setIndex((current) => (current + 1) % tipCount);
    }, AUTO_ADVANCE_MS);
    return () => window.clearInterval(timer);
  }, [paused, tipCount, index]);

  return (
    <section
      className={cn(glassPanelClassName, "p-5 sm:p-6", className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setPaused(false);
        }
      }}
    >
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Tips while you wait
          </h3>
          <p className="mt-1 text-sm text-zinc-500">
            A few quick ideas to make your profile stronger on review.
          </p>
        </div>
        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-zinc-500 shadow-sm dark:bg-zinc-950 dark:text-zinc-400">
          {index + 1} / {tipCount}
        </span>
      </div>

      <div className={cn("relative min-h-[140px] overflow-hidden p-5", glassCardClassName)}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={tip.title}
            custom={direction}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 flex flex-col justify-center p-5"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-400">
              Tip
            </p>
            <h4 className="mt-2 text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              {tip.title}
            </h4>
            <p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
              {tip.body}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-1.5">
          {PREPARING_TIPS.map((item, tipIndex) => (
            <button
              key={item.title}
              type="button"
              aria-label={`Show tip ${tipIndex + 1}`}
              aria-current={tipIndex === index}
              onClick={() => goTo(tipIndex, tipIndex > index ? 1 : -1)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                tipIndex === index
                  ? "w-6 bg-zinc-900 dark:bg-zinc-100"
                  : "w-1.5 bg-zinc-300 hover:bg-zinc-400 dark:bg-zinc-700 dark:hover:bg-zinc-500",
              )}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Previous tip"
            onClick={goPrev}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-300 bg-white text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Next tip"
            onClick={goNext}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-300 bg-white text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-4 h-1 overflow-hidden rounded-full bg-zinc-200/80 dark:bg-zinc-800">
        <motion.div
          key={`${index}-${paused}`}
          className="h-full origin-left rounded-full bg-zinc-800 dark:bg-zinc-200"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: paused ? 0 : 1 }}
          transition={{
            duration: paused ? 0 : AUTO_ADVANCE_MS / 1000,
            ease: "linear",
          }}
        />
      </div>
    </section>
  );
}
