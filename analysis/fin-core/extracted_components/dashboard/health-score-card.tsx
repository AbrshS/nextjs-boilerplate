"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/shared/utils/cn";
import type { HealthScore } from "../types/dashboard-api.types";

const GRADE_STYLES: Record<
  HealthScore["grade"],
  { ring: string; text: string; bg: string }
> = {
  A: { ring: "stroke-[#3db88a]", text: "text-[#2f9e6e]", bg: "bg-[#5ecf9a]/15" },
  B: { ring: "stroke-[#0068f9]", text: "text-[#024bb1]", bg: "bg-[#0068f9]/10" },
  C: { ring: "stroke-[#f0a04b]", text: "text-[#c47a20]", bg: "bg-[#f0a04b]/15" },
  D: { ring: "stroke-[#f07167]", text: "text-[#d94a40]", bg: "bg-[#f07167]/15" },
  F: { ring: "stroke-[#d94a40]", text: "text-[#b33a32]", bg: "bg-[#f07167]/20" },
};

function ScoreRing({ score, grade }: { score: number; grade: HealthScore["grade"] }) {
  const t = useTranslations("Dashboard");
  const size = 112;
  const stroke = 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(100, Math.max(0, score)) / 100) * c;
  const styles = GRADE_STYLES[grade];

  return (
    <div className="relative size-[112px] shrink-0">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-hairline"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className={styles.ring}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("text-[28px] font-semibold tabular-nums", styles.text)}>
          {Math.round(score)}
        </span>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[11px] font-semibold",
            styles.bg,
            styles.text
          )}
        >
          {t("grade", { grade })}
        </span>
      </div>
    </div>
  );
}

export function HealthScoreCard({ health }: { health: HealthScore }) {
  const t = useTranslations("Dashboard");
  const parts = [
    health.breakdown.liquidity,
    health.breakdown.marginTrend,
    health.breakdown.expenseStability,
  ];

  return (
    <section className="flex flex-col gap-5 rounded-[var(--radius-cards)] border border-hairline bg-pure-white p-5 md:flex-row md:items-start">
      <ScoreRing score={health.score} grade={health.grade} />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold tracking-[0.077em] text-slate-gray uppercase">
          {t("healthEyebrow")}
        </p>
        <h2 className="mt-1 text-[18px] font-semibold text-ink-charcoal">
          {t("healthTitle")}
        </h2>
        <p className="mt-1 text-[12px] text-slate-gray">
          {t("healthSubtitle")}
        </p>
        <p className="mt-1.5 text-[14px] leading-relaxed text-slate-gray">
          {health.summary}
        </p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-3">
          {parts.map((part) => (
            <li key={part.label} className="min-w-0">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[12px] font-medium text-ink-charcoal">
                  {part.label}
                </span>
                <span className="text-[13px] font-semibold tabular-nums text-ink-charcoal">
                  {Math.round(part.score)}
                </span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-ivory">
                <div
                  className="h-full rounded-full bg-[#0068f9]"
                  style={{ width: `${Math.min(100, part.score)}%` }}
                />
              </div>
              <p className="mt-1.5 text-[11px] leading-snug text-slate-gray">
                {part.detail}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
