"use client";

import { cn } from "@/shared/utils/cn";

type AreaChartProps = {
  series: { key: string; color: string; values: number[] }[];
  labels: string[];
  className?: string;
  height?: number;
};

export function AreaChart({
  series,
  labels,
  className,
  height = 200,
}: AreaChartProps) {
  const width = 640;
  const padX = 8;
  const padY = 12;
  const all = series.flatMap((s) => s.values);
  const min = Math.min(...all) * 0.92;
  const max = Math.max(...all) * 1.04;
  const range = max - min || 1;

  const toPoints = (values: number[]) =>
    values.map((v, i) => {
      const x = padX + (i / Math.max(values.length - 1, 1)) * (width - padX * 2);
      const y = height - padY - ((v - min) / range) * (height - padY * 2);
      return { x, y };
    });

  return (
    <div className={cn("w-full", className)}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-[200px] w-full"
        preserveAspectRatio="none"
        aria-hidden
      >
        {[0.25, 0.5, 0.75].map((t) => (
          <line
            key={t}
            x1={padX}
            x2={width - padX}
            y1={padY + t * (height - padY * 2)}
            y2={padY + t * (height - padY * 2)}
            stroke="#efefef"
            strokeWidth="1"
          />
        ))}
        {series.map((s) => {
          const pts = toPoints(s.values);
          const line = pts
            .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
            .join(" ");
          const area = `${line} L ${pts[pts.length - 1].x} ${height - padY} L ${pts[0].x} ${height - padY} Z`;
          return (
            <g key={s.key}>
              <path d={area} fill={s.color} opacity={0.12} />
              <path
                d={line}
                fill="none"
                stroke={s.color}
                strokeWidth="2.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          );
        })}
      </svg>
      <div className="mt-1 flex justify-between px-1 text-[11px] text-steel-gray">
        {labels
          .filter((_, i) => i % 2 === 0 || i === labels.length - 1)
          .map((l) => (
            <span key={l}>{l}</span>
          ))}
      </div>
    </div>
  );
}

type BarChartProps = {
  items: { label: string; value: number; color?: string }[];
  className?: string;
  formatValue?: (v: number) => string;
};

export function BarChart({
  items,
  className,
  formatValue = (v) => String(v),
}: BarChartProps) {
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <div className={cn("flex h-[200px] items-end gap-2", className)}>
      {items.map((item) => (
        <div
          key={item.label}
          className="flex min-w-0 flex-1 flex-col items-center gap-1.5"
        >
          <span className="text-[10px] tabular-nums text-slate-gray">
            {formatValue(item.value)}
          </span>
          <div className="flex w-full flex-1 items-end">
            <div
              className="w-full rounded-t-[6px] transition-all"
              style={{
                height: `${(item.value / max) * 100}%`,
                backgroundColor: item.color ?? "#0068f9",
                minHeight: 4,
              }}
            />
          </div>
          <span className="truncate text-[11px] text-steel-gray">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}

type GroupedBarProps = {
  items: { label: string; in: number; out: number }[];
  className?: string;
};

export function GroupedBarChart({ items, className }: GroupedBarProps) {
  const max = Math.max(...items.flatMap((i) => [i.in, i.out]), 1);
  return (
    <div className={cn("flex h-[200px] items-end gap-3", className)}>
      {items.map((item) => (
        <div key={item.label} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
          <div className="flex h-full w-full items-end justify-center gap-1">
            <div
              className="w-[42%] rounded-t-[4px] bg-electric-cobalt"
              style={{ height: `${(item.in / max) * 100}%`, minHeight: 4 }}
              title={`In ${item.in}`}
            />
            <div
              className="w-[42%] rounded-t-[4px] bg-slate-gray/40"
              style={{ height: `${(item.out / max) * 100}%`, minHeight: 4 }}
              title={`Out ${item.out}`}
            />
          </div>
          <span className="text-[11px] text-steel-gray">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

type DonutProps = {
  slices: { label: string; value: number; color: string }[];
  className?: string;
  centerLabel?: string;
  centerValue?: string;
};

export function DonutChart({
  slices,
  className,
  centerLabel,
  centerValue,
}: DonutProps) {
  const total = slices.reduce((a, s) => a + s.value, 0) || 1;
  const r = 42;
  const c = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className={cn("flex items-center gap-5", className)}>
      <div className="relative size-[140px] shrink-0">
        <svg viewBox="0 0 100 100" className="size-full -rotate-90">
          {slices.map((s) => {
            const len = (s.value / total) * c;
            const el = (
              <circle
                key={s.label}
                cx="50"
                cy="50"
                r={r}
                fill="none"
                stroke={s.color}
                strokeWidth="12"
                strokeDasharray={`${len} ${c - len}`}
                strokeDashoffset={-offset}
              />
            );
            offset += len;
            return el;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          {centerValue ? (
            <span className="text-[16px] font-semibold text-ink-charcoal">
              {centerValue}
            </span>
          ) : null}
          {centerLabel ? (
            <span className="text-[11px] text-slate-gray">{centerLabel}</span>
          ) : null}
        </div>
      </div>
      <ul className="min-w-0 flex-1 space-y-2">
        {slices.map((s) => (
          <li
            key={s.label}
            className="flex items-center justify-between gap-2 text-[13px]"
          >
            <span className="flex min-w-0 items-center gap-2 truncate text-ink-charcoal">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: s.color }}
              />
              {s.label}
            </span>
            <span className="shrink-0 tabular-nums text-slate-gray">
              {((s.value / total) * 100).toFixed(0)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

type HBarProps = {
  items: { label: string; value: number }[];
  className?: string;
  unitSuffix?: string;
};

export function HorizontalBars({
  items,
  className,
  unitSuffix = "M",
}: HBarProps) {
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <div className={cn("space-y-3", className)}>
      {items.map((item) => (
        <div key={item.label}>
          <div className="mb-1 flex items-baseline justify-between gap-2 text-[13px]">
            <span className="truncate text-ink-charcoal">{item.label}</span>
            <span className="shrink-0 tabular-nums text-slate-gray">
              ETB {item.value.toFixed(1)}
              {unitSuffix}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-hairline">
            <div
              className="h-full rounded-full bg-electric-cobalt"
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
