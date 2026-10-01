"use client";

import { Link } from "@/i18n/routing";
import { cn } from "@/shared/utils/cn";
import { formatEtbCompact } from "../lib/format-etb";
import type { RiskPartner } from "../types";

function usageTone(pct: number): "safe" | "warn" | "breach" {
  if (pct >= 85) return "breach";
  if (pct >= 60) return "warn";
  return "safe";
}

const TONE_BAR: Record<ReturnType<typeof usageTone>, string> = {
  safe: "bg-[#5ecf9a]",
  warn: "bg-[#f0a04b]",
  breach: "bg-[#f07167]",
};

const TONE_TEXT: Record<ReturnType<typeof usageTone>, string> = {
  safe: "text-[#2f9e6e]",
  warn: "text-[#c27803]",
  breach: "text-[#d94a40]",
};

function byDaysToBreach(rows: RiskPartner[]): RiskPartner[] {
  return [...rows].sort((a, b) => {
    const aDays = a.daysUntilBreach ?? 999;
    const bDays = b.daysUntilBreach ?? 999;
    return aDays - bDays;
  });
}

export function ReceivablesRisk({ partners }: { partners: RiskPartner[] }) {
  const sorted = byDaysToBreach(partners);

  return (
    <section className="overflow-hidden rounded-[var(--radius-cards)] border border-hairline bg-pure-white shadow-none">
      <div className="border-b border-hairline px-6 py-5">
        <h2 className="text-[18px] font-semibold leading-[1.5] text-ink-charcoal">
          Receivables risk
        </h2>
        <p className="mt-0.5 text-[13px] text-slate-gray">
          Partners that need attention — not all 198.
        </p>
      </div>

      <ul className="divide-y divide-hairline">
        {sorted.map((p) => {
          const tone = usageTone(p.pctUsed);
          const barWidth = Math.min(100, p.pctUsed);
          return (
            <li key={p.id}>
              <Link
                href={p.href}
                className="flex flex-col gap-3 px-6 py-4 transition-colors hover:bg-surface-ivory sm:flex-row sm:items-center sm:gap-6"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate font-medium text-ink-charcoal">
                      {p.name}
                    </p>
                    <p className="shrink-0 text-[13px] tabular-nums text-slate-gray">
                      {formatEtbCompact(p.outstanding)}
                      <span className="text-steel-gray">
                        {" "}
                        / {formatEtbCompact(p.creditLimit)}
                      </span>
                    </p>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-hairline">
                    <div
                      className={cn("h-full rounded-full", TONE_BAR[tone])}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-4 text-[12px]">
                  <span className={cn("font-medium tabular-nums", TONE_TEXT[tone])}>
                    {p.pctUsed.toFixed(0)}% used
                  </span>
                  <span className="tabular-nums text-slate-gray">
                    {p.daysUntilBreach != null
                      ? `${p.daysUntilBreach}d to breach`
                      : "—"}
                  </span>
                  <span
                    className={cn(
                      "tabular-nums font-medium",
                      p.daysOverdue > 0 ? "text-[#d94a40]" : "text-slate-gray"
                    )}
                  >
                    {p.daysOverdue > 0 ? `${p.daysOverdue}d overdue` : "Current"}
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
