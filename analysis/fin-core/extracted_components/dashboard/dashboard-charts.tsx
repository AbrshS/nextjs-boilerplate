"use client";

import type { ReactNode } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/shared/ui/chart";
import {
  AGING_BUCKETS,
  CASH_FLOW_WEEK,
  MONTHLY_TREND,
  PAYMENT_CHANNELS,
  PAYMENT_TODAY,
  TOP_COST_DRIVERS,
} from "../data/mock-dashboard";
import {
  chartBlue,
  chartGood,
} from "../lib/chart-palette";
import { formatEtbCompact } from "../lib/format-etb";
import { HorizontalBars } from "./charts";

const revenueTrendConfig = {
  revenue: { label: "Revenue", color: chartBlue[500] },
  cost: { label: "Cost", color: chartBlue[700] },
  collections: { label: "Collections", color: chartGood },
} satisfies ChartConfig;

const agingConfig = {
  value: { label: "Outstanding", color: chartBlue[500] },
} satisfies ChartConfig;

const cashFlowConfig = {
  in: { label: "In", color: chartBlue[500] },
  out: { label: "Out", color: chartBlue.mute },
} satisfies ChartConfig;

const revenueTrendData = MONTHLY_TREND.map((m) => ({
  month: m.label,
  revenue: m.revenue,
  cost: m.cost,
  collections: m.collections,
}));

const agingData = AGING_BUCKETS.map((b) => ({
  bucket: b.label,
  value: Number((b.value / 1_000_000).toFixed(1)),
  fill: b.color,
}));

const cashFlowData = CASH_FLOW_WEEK.map((d) => ({
  day: d.label,
  in: d.in,
  out: d.out,
}));

function Panel({
  title,
  subtitle,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`flex flex-col overflow-hidden rounded-[var(--radius-cards)] border border-hairline bg-pure-white p-5 shadow-none ${className ?? ""}`}
    >
      <div className="mb-4">
        <h2 className="text-[16px] font-semibold text-ink-charcoal">{title}</h2>
        {subtitle ? (
          <p className="mt-0.5 text-[12px] text-slate-gray">{subtitle}</p>
        ) : null}
      </div>
      <div className="min-h-0 flex-1">{children}</div>
    </section>
  );
}

export function DashboardCharts() {
  return (
    <div className="grid w-full gap-4 xl:grid-cols-12">
      <Panel
        title="Revenue vs cost vs collections"
        subtitle="Trailing 12 months · ETB millions"
        className="xl:col-span-8"
      >
        <ChartContainer
          config={revenueTrendConfig}
          className="aspect-auto h-[240px] w-full"
        >
          <AreaChart
            accessibilityLayer
            data={revenueTrendData}
            margin={{ left: 4, right: 8, top: 8, bottom: 0 }}
          >
            <defs>
              <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.28} />
                <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="fillCost" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-cost)" stopOpacity={0.22} />
                <stop offset="95%" stopColor="var(--color-cost)" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="fillCollections" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-collections)" stopOpacity={0.22} />
                <stop offset="95%" stopColor="var(--color-collections)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fill: "#777c86", fontSize: 11 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={4}
              width={36}
              tick={{ fill: "#777c86", fontSize: 11 }}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Area
              dataKey="collections"
              type="natural"
              fill="url(#fillCollections)"
              stroke="var(--color-collections)"
              strokeWidth={2}
              stackId="a"
            />
            <Area
              dataKey="cost"
              type="natural"
              fill="url(#fillCost)"
              stroke="var(--color-cost)"
              strokeWidth={2}
              stackId="b"
            />
            <Area
              dataKey="revenue"
              type="natural"
              fill="url(#fillRevenue)"
              stroke="var(--color-revenue)"
              strokeWidth={2}
              stackId="c"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </Panel>

      <Panel
        title="Payment channels"
        subtitle="Share of collections this month"
        className="xl:col-span-4"
      >
        <div className="flex h-[28px] w-full overflow-hidden rounded-full border border-hairline">
          {PAYMENT_CHANNELS.map((c) => (
            <div
              key={c.label}
              className="h-full"
              style={{ width: `${c.value}%`, backgroundColor: c.color }}
              title={`${c.label}: ${c.value}%`}
            />
          ))}
        </div>
        <ul className="mt-5 space-y-3">
          {PAYMENT_CHANNELS.map((c) => (
            <li
              key={c.label}
              className="flex items-center justify-between gap-3 text-[13px]"
            >
              <span className="flex items-center gap-2 text-ink-charcoal">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: c.color }}
                />
                {c.label}
              </span>
              <span className="font-semibold tabular-nums text-ink-charcoal">
                {c.value}%
              </span>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel
        title="Receivables aging"
        subtitle="Outstanding by bucket · ETB millions"
        className="xl:col-span-4"
      >
        <ChartContainer
          config={agingConfig}
          className="aspect-auto h-[200px] w-full"
        >
          <BarChart
            accessibilityLayer
            data={agingData}
            margin={{ left: 0, right: 4, top: 8, bottom: 0 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="bucket"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fill: "#777c86", fontSize: 11 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={28}
              tick={{ fill: "#777c86", fontSize: 11 }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(value) => `${value}M ETB`}
                />
              }
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {agingData.map((entry) => (
                <Cell key={entry.bucket} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
        <p className="mt-2 text-[12px] text-slate-gray">
          Total outstanding{" "}
          <span className="font-medium text-ink-charcoal">
            {formatEtbCompact(
              AGING_BUCKETS.reduce((a, b) => a + b.value, 0)
            )}
          </span>
        </p>
      </Panel>

      <Panel
        title="Weekly cash movement"
        subtitle="Inflows vs outflows · ETB millions"
        className="xl:col-span-4"
      >
        <ChartContainer
          config={cashFlowConfig}
          className="aspect-auto h-[200px] w-full"
        >
          <AreaChart
            accessibilityLayer
            data={cashFlowData}
            margin={{ left: 0, right: 4, top: 8, bottom: 0 }}
          >
            <defs>
              <linearGradient id="fillCashIn" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-in)" stopOpacity={0.3} />
                <stop
                  offset="95%"
                  stopColor="var(--color-in)"
                  stopOpacity={0.02}
                />
              </linearGradient>
              <linearGradient id="fillCashOut" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-out)"
                  stopOpacity={0.22}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-out)"
                  stopOpacity={0.02}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fill: "#777c86", fontSize: 11 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={28}
              tick={{ fill: "#777c86", fontSize: 11 }}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey="in"
              stroke="var(--color-in)"
              fill="url(#fillCashIn)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="out"
              stroke="var(--color-out)"
              fill="url(#fillCashOut)"
              strokeWidth={2}
              strokeDasharray="4 4"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </Panel>

      <Panel
        title="Top cost drivers"
        subtitle="YTD · ETB millions"
        className="xl:col-span-4"
      >
        <HorizontalBars items={TOP_COST_DRIVERS} />
      </Panel>

      <div className="grid gap-3 sm:grid-cols-2 xl:col-span-12 xl:grid-cols-4">
        {PAYMENT_TODAY.map((stat) => (
          <div
            key={stat.label}
            className="rounded-[var(--radius-cards)] border border-hairline bg-pure-white p-4 shadow-none"
          >
            <p className="text-[12px] font-medium text-slate-gray">
              {stat.label}
            </p>
            <p className="mt-2 text-[28px] leading-none font-semibold tracking-tight text-ink-charcoal tabular-nums">
              {stat.label.includes("time")
                ? `${stat.value}s`
                : stat.value.toLocaleString("en-ET")}
            </p>
            <p className="mt-2 text-[12px] text-steel-gray">{stat.hint}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
