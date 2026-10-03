"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/shared/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/shared/ui/chart";

const chartData = [
  { month: "Jan", inflow: 18500, outflow: 9200 },
  { month: "Feb", inflow: 22400, outflow: 11100 },
  { month: "Mar", inflow: 19800, outflow: 8900 },
  { month: "Apr", inflow: 28900, outflow: 14200 },
  { month: "May", inflow: 24500, outflow: 12800 },
  { month: "Jun", inflow: 31200, outflow: 15400 },
  { month: "Jul", inflow: 29800, outflow: 13900 },
  { month: "Aug", inflow: 34100, outflow: 16800 },
  { month: "Sep", inflow: 38400, outflow: 17200 },
  { month: "Oct", inflow: 42900, outflow: 19100 },
  { month: "Nov", inflow: 41200, outflow: 18400 },
  { month: "Dec", inflow: 48900, outflow: 21500 },
];

const chartConfig = {
  inflow: {
    label: "Total Inflow (Revenue)",
    color: "oklch(0.627 0.194 149.214)", // Emerald
  },
  outflow: {
    label: "Operational Outflow",
    color: "oklch(0.55 0.05 260)", // Deep Slate
  },
} satisfies ChartConfig;

export function CashflowChart() {
  const [timeframe, setTimeframe] = React.useState<"6M" | "12M">("12M");

  const visibleData = timeframe === "6M" ? chartData.slice(6) : chartData;

  return (
    <Card className="border-border/70 bg-card shadow-none">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-border/60 bg-surface-ivory">
        <div className="space-y-0.5">
          <CardTitle className="text-base font-semibold text-foreground">
            Monthly Cashflow Dynamics
          </CardTitle>
          <CardDescription className="text-xs">
            Double-entry ledger inflows vs disbursements across fiscal periods
          </CardDescription>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-border/80 bg-card p-1 text-xs">
          <button
            onClick={() => setTimeframe("6M")}
            className={`rounded px-2.5 py-1 font-medium transition-colors ${
              timeframe === "6M"
                ? "bg-primary text-primary-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Last 6 Months
          </button>
          <button
            onClick={() => setTimeframe("12M")}
            className={`rounded px-2.5 py-1 font-medium transition-colors ${
              timeframe === "12M"
                ? "bg-primary text-primary-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Full Year (12M)
          </button>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <ChartContainer config={chartConfig} className="aspect-auto h-[280px] w-full">
          <AreaChart data={visibleData} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="fillInflow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-inflow)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="var(--color-inflow)" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="fillOutflow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-outflow)" stopOpacity={0.25} />
                <stop offset="95%" stopColor="var(--color-outflow)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.92 0.005 85)" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fontSize: 11, fill: "oklch(0.52 0.01 260)" }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              tick={{ fontSize: 11, fill: "oklch(0.52 0.01 260)" }}
            />
            <ChartTooltip
              cursor={{ stroke: "oklch(0.85 0.01 85)", strokeWidth: 1 }}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Area
              dataKey="outflow"
              type="monotone"
              fill="url(#fillOutflow)"
              stroke="var(--color-outflow)"
              strokeWidth={1.5}
            />
            <Area
              dataKey="inflow"
              type="monotone"
              fill="url(#fillInflow)"
              stroke="var(--color-inflow)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
