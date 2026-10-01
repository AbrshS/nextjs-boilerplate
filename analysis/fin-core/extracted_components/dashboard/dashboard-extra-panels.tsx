"use client";

import type { ReactNode } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  XAxis,
  YAxis,
} from "recharts";
import { Link } from "@/i18n/routing";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/shared/ui/chart";
import { dicebearNotionistsAvatar } from "@/shared/lib/avatar";
import { cn } from "@/shared/utils/cn";
import {
  chartBad,
  chartBlue,
  chartGoodDeep,
} from "../lib/chart-palette";
import { formatEtb } from "../lib/format-etb";
import {
  BUDGET_VS_ACTUAL,
  CATCHMENT_SHARE,
  COLLECTION_RATE_TREND,
  LEDGER_ACTIVITY,
  PAYER_MIX,
  RECENT_CLAIMS,
  SUPPLY_STOCK,
  TOP_PARTNERS,
  type ClaimRow,
  type SupplyRow,
} from "../data/mock-dashboard";

const budgetConfig = {
  budget: { label: "Budget", color: chartBlue.mute },
  actual: { label: "Actual", color: chartBlue[500] },
} satisfies ChartConfig;

const varianceConfig = {
  variance: { label: "Variance", color: chartBlue[500] },
} satisfies ChartConfig;

const collectionConfig = {
  rate: { label: "Collection rate", color: chartBlue[400] },
} satisfies ChartConfig;

const CLAIM_STATUS: Record<ClaimRow["status"], string> = {
  Paid: "bg-[#5ecf9a]/15 text-[#2f9e6e]",
  Pending: "bg-[#f0a04b]/15 text-[#c27803]",
  Partial: "bg-electric-cobalt/10 text-electric-cobalt",
  Denied: "bg-[#f07167]/15 text-[#d94a40]",
};

const STOCK_STATUS: Record<
  SupplyRow["status"],
  { dot: string; text: string }
> = {
  Critical: { dot: "bg-[#f07167]", text: "text-[#d94a40]" },
  Low: { dot: "bg-[#f0a04b]", text: "text-[#c27803]" },
  Healthy: { dot: "bg-[#5ecf9a]", text: "text-[#2f9e6e]" },
};

const budgetRadarData = BUDGET_VS_ACTUAL.map((d) => ({
  dept: d.dept,
  budget: d.budget,
  actual: d.actual,
}));

const budgetVarianceData = BUDGET_VS_ACTUAL.map((d) => ({
  dept: d.dept,
  variance: Number((d.actual - d.budget).toFixed(2)),
  fill: d.actual - d.budget >= 0 ? chartGoodDeep : chartBad,
}));

function Panel({
  title,
  subtitle,
  action,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "flex flex-col overflow-hidden rounded-[var(--radius-cards)] border border-hairline bg-pure-white p-5 shadow-none",
        className
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[16px] font-semibold text-ink-charcoal">{title}</h2>
          {subtitle ? (
            <p className="mt-0.5 text-[12px] text-slate-gray">{subtitle}</p>
          ) : null}
        </div>
        {action}
      </div>
      <div className="min-h-0 flex-1">{children}</div>
    </section>
  );
}

export function DashboardExtraPanels() {
  const payerTotal = PAYER_MIX.reduce((a, b) => a + b.value, 0);

  return (
    <div className="grid w-full gap-4 xl:grid-cols-12">
      {/* Radar — budget vs actual (not grouped bars) */}
      <Panel
        title="Budget vs actual"
        subtitle="Departmental revenue · ETB millions · QTD"
        className="xl:col-span-5"
        action={
          <div className="text-end">
            <p className="text-[11px] text-slate-gray">Variance</p>
            <p className="text-[15px] font-semibold tabular-nums text-[#3db88a]">
              +ETB 3.1M
            </p>
          </div>
        }
      >
        <ChartContainer
          config={budgetConfig}
          className="mx-auto aspect-square h-[280px] w-full max-w-[320px]"
        >
          <RadarChart data={budgetRadarData} cx="50%" cy="50%" outerRadius="72%">
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <PolarGrid stroke="#efefef" />
            <PolarAngleAxis
              dataKey="dept"
              tick={{ fill: "#777c86", fontSize: 11 }}
            />
            <Radar
              dataKey="budget"
              stroke="var(--color-budget)"
              fill="var(--color-budget)"
              fillOpacity={0.15}
              strokeWidth={2}
            />
            <Radar
              dataKey="actual"
              stroke="var(--color-actual)"
              fill="var(--color-actual)"
              fillOpacity={0.25}
              strokeWidth={2}
            />
            <ChartLegend content={<ChartLegendContent />} />
          </RadarChart>
        </ChartContainer>
      </Panel>

      {/* Diverging variance bars */}
      <Panel
        title="Department variance"
        subtitle="Actual − budget · ETB millions"
        className="xl:col-span-3"
      >
        <ChartContainer
          config={varianceConfig}
          className="aspect-auto h-[280px] w-full"
        >
          <BarChart
            accessibilityLayer
            layout="vertical"
            data={budgetVarianceData}
            margin={{ left: 4, right: 12, top: 4, bottom: 4 }}
          >
            <CartesianGrid horizontal={false} strokeDasharray="3 3" />
            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#777c86", fontSize: 11 }}
            />
            <YAxis
              type="category"
              dataKey="dept"
              width={72}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#777c86", fontSize: 11 }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  formatter={(value) => {
                    const n = Number(value);
                    return `${n >= 0 ? "+" : ""}${n}M ETB`;
                  }}
                />
              }
            />
            <Bar dataKey="variance" radius={[0, 4, 4, 0]}>
              {budgetVarianceData.map((entry) => (
                <Cell key={entry.dept} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </Panel>

      {/* Ranked progress — payer mix (not donut / not composition strip) */}
      <Panel
        title="Payer mix"
        subtitle="Collections this quarter"
        className="xl:col-span-4"
      >
        <p className="mb-4 text-[28px] font-semibold tracking-tight tabular-nums text-ink-charcoal">
          {PAYER_MIX[0]?.value ?? 0}%
          <span className="ms-2 text-[14px] font-medium text-slate-gray">
            insurance-led
          </span>
        </p>
        <ul className="space-y-4">
          {PAYER_MIX.map((p) => (
            <li key={p.label} className="space-y-1.5">
              <div className="flex items-center justify-between gap-2 text-[13px]">
                <span className="flex items-center gap-2 font-medium text-ink-charcoal">
                  <span
                    className="size-2.5 rounded-full"
                    style={{ backgroundColor: p.color }}
                  />
                  {p.label}
                </span>
                <span className="font-semibold tabular-nums text-ink-charcoal">
                  {p.value}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-surface-ivory">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${p.value}%`, backgroundColor: p.color }}
                />
              </div>
              <p className="text-[12px] tabular-nums text-steel-gray">{p.count}</p>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[11px] text-steel-gray">
          Share totals {payerTotal}% of tracked collections
        </p>
      </Panel>

      {/* Line — collection rate */}
      <Panel
        title="Collection rate trend"
        subtitle="Last 14 days · cash collection %"
        className="xl:col-span-4"
        action={
          <span className="rounded-full bg-electric-cobalt/10 px-2 py-0.5 text-[11px] font-medium text-electric-cobalt">
            −2.3 pp
          </span>
        }
      >
        <p className="mb-2 text-[28px] font-semibold tracking-tight tabular-nums text-ink-charcoal">
          91.2%
        </p>
        <ChartContainer
          config={collectionConfig}
          className="aspect-auto h-[140px] w-full"
        >
          <LineChart
            accessibilityLayer
            data={COLLECTION_RATE_TREND}
            margin={{ left: 0, right: 4, top: 8, bottom: 0 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="day" hide />
            <YAxis domain={[88, 96]} hide />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  formatter={(value) => `${value}%`}
                  hideLabel
                />
              }
            />
            <Line
              type="monotone"
              dataKey="rate"
              stroke="var(--color-rate)"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ChartContainer>
      </Panel>

      {/* Catchment progress bars */}
      <Panel
        title="Revenue by catchment"
        subtitle="Where volume originates · QTD"
        className="xl:col-span-4"
      >
        <ul className="space-y-4">
          {CATCHMENT_SHARE.map((row) => (
            <li key={row.label}>
              <div className="mb-1.5 flex items-baseline justify-between gap-2">
                <span className="text-[13px] font-medium text-ink-charcoal">
                  {row.label}
                </span>
                <span className="text-[12px] tabular-nums text-slate-gray">
                  {row.share}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-surface-ivory">
                <div
                  className="h-full rounded-full bg-electric-cobalt"
                  style={{ width: `${row.share}%` }}
                />
              </div>
              <p className="mt-1 text-[11px] text-steel-gray">{row.amount}</p>
            </li>
          ))}
        </ul>
      </Panel>

      {/* Signed ledger activity */}
      <Panel
        title="Ledger activity"
        subtitle="Inflows & outflows · today"
        className="xl:col-span-4"
        action={
          <Link
            href="/ledger/journals"
            className="text-[13px] font-medium text-electric-cobalt"
          >
            Journals
          </Link>
        }
      >
        <ul className="divide-y divide-hairline">
          {LEDGER_ACTIVITY.map((row) => (
            <li
              key={row.id}
              className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
            >
              <div
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-[10px] text-[11px] font-semibold",
                  row.amount >= 0
                    ? "bg-[#5ecf9a]/15 text-[#2f9e6e]"
                    : "bg-[#f07167]/15 text-[#d94a40]"
                )}
              >
                {row.channel.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-ink-charcoal">
                  {row.label}
                </p>
                <p className="truncate text-[11px] text-slate-gray">
                  {row.detail}
                </p>
              </div>
              <span
                className={cn(
                  "shrink-0 text-[13px] font-semibold tabular-nums",
                  row.amount >= 0 ? "text-[#3db88a]" : "text-[#d94a40]"
                )}
              >
                    {row.amount >= 0 ? "+" : "−"}
                {formatEtb(Math.abs(row.amount))}
              </span>
            </li>
          ))}
        </ul>
      </Panel>

      {/* Claims table */}
      <Panel
        title="Recent claims & invoices"
        subtitle="Partner settlements · last 48 hours"
        className="xl:col-span-8"
        action={
          <Link
            href="/partners"
            className="text-[13px] font-medium text-electric-cobalt"
          >
            Partners
          </Link>
        }
      >
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-[13px]">
            <thead>
              <tr className="border-b border-hairline text-[11px] font-semibold tracking-[0.04em] text-slate-gray uppercase">
                <th className="pb-3 pr-3 font-semibold">Partner</th>
                <th className="pb-3 pr-3 font-semibold">Invoice</th>
                <th className="pb-3 pr-3 font-semibold">Service</th>
                <th className="pb-3 pr-3 font-semibold">Amount</th>
                <th className="pb-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {RECENT_CLAIMS.map((row) => (
                <tr key={row.id} className="border-b border-hairline last:border-0">
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={dicebearNotionistsAvatar(row.seed)}
                        alt=""
                        width={28}
                        height={28}
                        className="size-7 rounded-md bg-surface-ivory"
                      />
                      <span className="font-medium text-ink-charcoal">
                        {row.partner}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 pr-3 tabular-nums text-slate-gray">
                    {row.invoice}
                  </td>
                  <td className="max-w-[12rem] truncate py-3 pr-3 text-slate-gray">
                    {row.service}
                  </td>
                  <td className="py-3 pr-3 font-medium tabular-nums text-ink-charcoal">
                    {row.amount}
                  </td>
                  <td className="py-3">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium",
                        CLAIM_STATUS[row.status]
                      )}
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* Top partners */}
      <Panel
        title="Top partners"
        subtitle="Volume this quarter"
        className="xl:col-span-4"
        action={
          <Link
            href="/collections"
            className="text-[13px] font-medium text-electric-cobalt"
          >
            Aging
          </Link>
        }
      >
        <ul className="divide-y divide-hairline">
          {TOP_PARTNERS.map((p) => (
            <li
              key={p.id}
              className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
            >
              <img
                src={dicebearNotionistsAvatar(p.seed)}
                alt=""
                width={36}
                height={36}
                className="size-9 rounded-full bg-surface-ivory"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-ink-charcoal">
                  {p.name}
                </p>
                <p className="text-[11px] text-slate-gray">
                  {p.invoices} invoices
                </p>
              </div>
              <span className="shrink-0 text-[13px] font-semibold tabular-nums text-ink-charcoal">
                {p.volume}
              </span>
            </li>
          ))}
        </ul>
      </Panel>

      {/* Supply stock */}
      <Panel
        title="Supply stock health"
        subtitle="Finance-visible inventory burn"
        className="xl:col-span-12"
      >
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-left text-[13px]">
            <thead>
              <tr className="border-b border-hairline text-[11px] font-semibold tracking-[0.04em] text-slate-gray uppercase">
                <th className="pb-3 pr-3 font-semibold">Item</th>
                <th className="pb-3 pr-3 font-semibold">Unit cost</th>
                <th className="pb-3 pr-3 font-semibold">On hand</th>
                <th className="pb-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {SUPPLY_STOCK.map((row) => (
                <tr key={row.id} className="border-b border-hairline last:border-0">
                  <td className="py-3 pr-3 font-medium text-ink-charcoal">
                    {row.item}
                  </td>
                  <td className="py-3 pr-3 tabular-nums text-slate-gray">
                    {row.unitCost}
                  </td>
                  <td className="py-3 pr-3 tabular-nums text-slate-gray">
                    {row.onHand}
                  </td>
                  <td className="py-3">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 text-[12px] font-medium",
                        STOCK_STATUS[row.status].text
                      )}
                    >
                      <span
                        className={cn(
                          "size-1.5 rounded-full",
                          STOCK_STATUS[row.status].dot
                        )}
                      />
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
