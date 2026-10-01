"use client";

import { cn } from "@/shared/utils/cn";

/** Period insight banner — hospital abstract background + readable overlay. */
export function PeriodOverview({
  periodLabel,
  title,
  body,
  meta,
  className,
}: {
  periodLabel: string;
  title: string;
  body: string;
  meta?: string;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-[var(--radius-cards)] border border-hairline shadow-none",
        className
      )}
    >
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/hospital_bg.jpg)" }}
        aria-hidden
      />
      {/* Soft wash so type stays legible over the blue ribbons */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-[#021833]/88 via-[#024bb1]/55 to-[#0068f9]/25"
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-[#021833]/50 via-transparent to-[#021833]/20"
        aria-hidden
      />

      <div className="relative px-6 py-8 md:px-9 md:py-10 lg:max-w-[70%]">
        <p className="text-[11px] font-semibold tracking-[0.12em] text-white/70 uppercase">
          {periodLabel}
        </p>
        <h2 className="mt-3 text-[22px] font-semibold leading-[1.25] tracking-tight text-white md:text-[28px] md:leading-[1.2]">
          {title}
        </h2>
        <p className="mt-3 max-w-2xl text-[15px] leading-[1.6] text-white/85 md:text-[16px]">
          {body}
        </p>
        {meta ? (
          <p className="mt-5 text-[12px] tracking-[0.02em] text-white/55">
            {meta}
          </p>
        ) : null}
      </div>
    </section>
  );
}
