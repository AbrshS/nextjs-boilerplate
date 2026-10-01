"use client";

import * as React from "react";
import { ArrowDownRightIcon, ArrowUpRightIcon, MinusIcon } from "lucide-react";
import { Link } from "@/i18n/routing";
import { cn } from "@/shared/utils/cn";
import { Sparkline } from "./sparkline";
import {
  formatDelta,
  formatKpiValue,
} from "../lib/format-etb";
import type { KpiDefinition, RevenuePeriod } from "../types";

const PERIODS: { id: RevenuePeriod; label: string }[] = [
  { id: "mtd", label: "MTD" },
  { id: "qtd", label: "QTD" },
  { id: "ytd", label: "YTD" },
];

function DeltaChip({
  current,
  previous,
  unit,
}: {
  current: number;
  previous: number;
  unit: KpiDefinition["unit"];
}) {
  const { label, direction } = formatDelta(current, previous, unit);
  const Icon =
    direction === "up"
      ? ArrowUpRightIcon
      : direction === "down"
        ? ArrowDownRightIcon
        : MinusIcon;

  const invertGood =
    unit === "percent" &&
    (label.includes("pp") === false
      ? false
      : false);

  // For refund rate / DSO / receivables growth, "up" can be bad — keep visual by direction only
  void invertGood;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-medium",
        direction === "up" && "bg-[#5ecf9a]/15 text-[#2f9e6e]",
        direction === "down" && "bg-[#f07167]/15 text-[#d94a40]",
        direction === "flat" && "bg-surface-ivory text-slate-gray"
      )}
    >
      <Icon className="size-3" strokeWidth={2} />
      {label}
    </span>
  );
}

export function KpiCards({ kpis }: { kpis: KpiDefinition[] }) {
  const [revenuePeriod, setRevenuePeriod] =
    React.useState<RevenuePeriod>("qtd");

  return (
    <div className="grid w-full gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {kpis.map((kpi) => {
        const isRevenue = kpi.id === "revenue" && kpi.periods;
        const periodData = isRevenue ? kpi.periods![revenuePeriod] : null;
        const value = periodData?.value ?? kpi.value;
        const previous = periodData?.previousValue ?? kpi.previousValue;
        const series = periodData?.series ?? kpi.series;
        const delta = formatDelta(value, previous, kpi.unit);
        const sparkTone =
          kpi.id === "refund_rate" ||
          kpi.id === "avg_days_ar" ||
          kpi.id === "receivables"
            ? delta.direction === "up"
              ? "danger"
              : "forest"
            : delta.direction === "down"
              ? "danger"
              : delta.direction === "up"
                ? "forest"
                : "cobalt";

        return (
          <Link
            key={kpi.id}
            href={kpi.href}
            className="group flex min-w-0 flex-col rounded-[var(--radius-cards)] border border-hairline bg-pure-white p-4 shadow-none transition-colors hover:bg-surface-ivory"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-[12px] font-medium leading-snug text-slate-gray">
                {kpi.label}
              </p>
              {isRevenue ? (
                <div
                  className="flex shrink-0 rounded-full border border-hairline bg-surface-ivory p-0.5"
                  onClick={(e) => e.preventDefault()}
                  role="group"
                  aria-label="Revenue period"
                >
                  {PERIODS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setRevenuePeriod(p.id);
                      }}
                      className={cn(
                        "rounded-full px-1.5 py-0.5 text-[10px] font-medium transition-colors",
                        revenuePeriod === p.id
                          ? "bg-electric-cobalt text-pure-white"
                          : "text-slate-gray hover:text-ink-charcoal"
                      )}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <p className="mt-2 truncate text-[22px] leading-none font-semibold tracking-tight text-ink-charcoal">
              {formatKpiValue(value, kpi.unit)}
            </p>
            <div className="mt-auto flex items-end justify-between gap-2 pt-3">
              <DeltaChip current={value} previous={previous} unit={kpi.unit} />
              <Sparkline
                data={series}
                tone={sparkTone}
                className="h-7 max-w-[72px] opacity-90"
              />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
