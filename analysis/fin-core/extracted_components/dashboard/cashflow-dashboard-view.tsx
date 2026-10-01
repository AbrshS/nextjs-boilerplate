"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { useAuth } from "@/domains/auth";
import { PageHeading } from "@/shared/components/page-heading";
import { Spinner } from "@/shared/components/spinner";
import { EmptyState } from "@/shared/components/empty-state";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/shared/ui/chart";
import { cn } from "@/shared/utils/cn";
import { useGetDashboardQuery } from "../api/dashboard.api";
import { chartBlue, chartBlueAt, chartGood } from "../lib/chart-palette";
import { formatEtb, formatEtbCompact } from "../lib/format-etb";
import type {
  AgingSummary,
  DashboardWindow,
  ProjectionDays,
} from "../types/dashboard-api.types";
import { DashboardAlerts } from "./dashboard-alerts";
import { HealthScoreCard } from "./health-score-card";
import { PayrollSummaryCard } from "./payroll-summary-card";

function Panel({
  title,
  subtitle,
  actions,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "flex flex-col overflow-hidden rounded-[var(--radius-cards)] border border-hairline bg-pure-white p-5",
        className
      )}
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-[16px] font-semibold text-ink-charcoal">{title}</h2>
          {subtitle ? (
            <p className="mt-0.5 text-[12px] text-slate-gray">{subtitle}</p>
          ) : null}
        </div>
        {actions}
      </div>
      <div className="min-h-0 flex-1">{children}</div>
    </section>
  );
}

function Segmented<T extends number>({
  options,
  value,
  onChange,
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex rounded-full border border-hairline bg-surface-ivory p-0.5">
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          className={cn(
            "rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors",
            value === opt.id
              ? "bg-pure-white text-ink-charcoal shadow-sm"
              : "text-slate-gray hover:text-ink-charcoal"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function KpiTile({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "good" | "bad";
}) {
  return (
    <div className="rounded-[var(--radius-cards)] border border-hairline bg-pure-white p-4">
      <p className="text-[11px] font-semibold tracking-[0.06em] text-slate-gray uppercase">
        {label}
      </p>
      <p
        className={cn(
          "mt-2 text-[22px] font-semibold tabular-nums tracking-tight",
          tone === "good" && "text-[#2f9e6e]",
          tone === "bad" && "text-[#d94a40]",
          !tone || tone === "default" ? "text-ink-charcoal" : null
        )}
      >
        {value}
      </p>
      {hint ? (
        <p className="mt-1 text-[12px] text-slate-gray">{hint}</p>
      ) : null}
    </div>
  );
}

function AgingPanel({
  title,
  description,
  href,
  aging,
}: {
  title: string;
  description: string;
  href: string;
  aging: AgingSummary;
}) {
  const t = useTranslations("Dashboard");

  return (
    <Panel
      title={title}
      subtitle={t("agingSubtitle", {
        description,
        outstanding: formatEtbCompact(aging.total),
        overdue: formatEtbCompact(aging.overdueTotal),
      })}
      actions={
        <Link
          href={href}
          className="text-[12px] font-medium text-[#0068f9] hover:underline"
        >
          {t("viewAll")}
        </Link>
      }
    >
      <div className="space-y-2">
        {aging.buckets.map((bucket, i) => {
          const max = Math.max(...aging.buckets.map((b) => b.amount), 1);
          return (
            <div key={bucket.id}>
              <div className="mb-1 flex items-center justify-between text-[12px]">
                <span className="text-slate-gray">
                  {bucket.label}
                  <span className="ml-1 text-slate-gray/70">({bucket.count})</span>
                </span>
                <span className="font-medium tabular-nums text-ink-charcoal">
                  {formatEtbCompact(bucket.amount)}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-surface-ivory">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(bucket.amount / max) * 100}%`,
                    backgroundColor: chartBlueAt(i),
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
      {aging.items.length > 0 ? (
        <ul className="mt-4 divide-y divide-hairline border-t border-hairline">
          {aging.items.slice(0, 5).map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-3 py-2.5 text-[12px]"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-ink-charcoal">
                  {item.counterparty}
                </p>
                <p className="text-slate-gray">
                  {item.documentNumber} · {t("due", { date: item.dueDate })}
                  {item.daysOverdue > 0
                    ? ` · ${t("daysOverdue", { days: item.daysOverdue })}`
                    : ""}
                </p>
              </div>
              <span className="shrink-0 font-semibold tabular-nums text-ink-charcoal">
                {formatEtbCompact(item.amount)}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-[13px] text-slate-gray">
          {t("nothingOutstanding")}
        </p>
      )}
    </Panel>
  );
}

export function CashflowDashboardView() {
  const t = useTranslations("Dashboard");
  const { user } = useAuth();
  const tenantId = user?.activeTenantId ?? "";
  const [windowDays, setWindowDays] = React.useState<DashboardWindow>(90);
  const [projectionDays, setProjectionDays] =
    React.useState<ProjectionDays>(60);

  const windows: { id: DashboardWindow; label: string }[] = [
    { id: 30, label: t("window30") },
    { id: 90, label: t("window90") },
    { id: 365, label: t("window365") },
  ];

  const projections: { id: ProjectionDays; label: string }[] = [
    { id: 30, label: t("projection30") },
    { id: 60, label: t("projection60") },
    { id: 90, label: t("projection90") },
  ];

  const cashflowConfig = {
    inflow: { label: t("chartIn"), color: chartGood },
    outflow: { label: t("chartOut"), color: chartBlue.mute },
  } satisfies ChartConfig;

  const revExpConfig = {
    income: { label: t("chartIncome"), color: chartBlue[500] },
    expense: { label: t("chartExpense"), color: chartBlue[700] },
  } satisfies ChartConfig;

  const projectionConfig = {
    projectedBalance: { label: t("chartProjected"), color: chartBlue[500] },
  } satisfies ChartConfig;

  const { data, isLoading, isError, isFetching } = useGetDashboardQuery(
    { tenantId, window: windowDays, projectionDays },
    { skip: !tenantId }
  );

  if (!tenantId) {
    return (
      <EmptyState
        title={t("emptyBusinessTitle")}
        description={t("emptyBusinessDescription")}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <EmptyState
        title={t("errorTitle")}
        description={t("errorDescription")}
      />
    );
  }

  const trendData = data.cashflowTrend.points.map((p) => ({
    label: p.label,
    inflow: p.inflow,
    outflow: p.outflow,
  }));

  const revExpData = data.revenueExpenseTrend.points.map((p) => ({
    label: p.label,
    income: p.income,
    expense: p.expense,
  }));

  const expenseBarData = data.topExpenseCategories.map((c) => ({
    name: c.name,
    amount: c.amount,
  }));

  const projectionData =
    data.projection.curve.length > 90
      ? data.projection.curve.filter((_, i) => i % 3 === 0)
      : data.projection.curve;

  const runwayLabel =
    data.burnRate.runwayDays == null
      ? t("notBurning")
      : t("runwayDays", { days: data.burnRate.runwayDays });

  const projectionSourceLabel = [
    t("sourceInvoicesBills"),
    data.projection.recurringIncluded ? t("sourceRecurring") : null,
    data.projection.payrollIncluded ? t("sourcePayroll") : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="flex w-full flex-col gap-4 md:gap-5">
      <PageHeading
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("description")}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/settings"
              className="text-[12px] font-medium text-[#0068f9] hover:underline"
            >
              {t("alertSettings")}
            </Link>
            {isFetching ? (
              <span className="text-[11px] text-slate-gray">{t("updating")}</span>
            ) : null}
            <Segmented
              options={windows}
              value={windowDays}
              onChange={setWindowDays}
            />
          </div>
        }
      />

      <DashboardAlerts alerts={data.alerts} />

      <PayrollSummaryCard summary={data.payrollSummary} />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiTile
          label={t("cashOnHand")}
          value={formatEtbCompact(data.cashPosition.total)}
          hint={
            data.cashPosition.byBankAccount.length
              ? t("cashHintBanks", {
                  count: data.cashPosition.byBankAccount.length,
                })
              : t("cashHintAccounts", {
                  count: data.cashPosition.byAccount.length,
                })
          }
          tone={data.cashPosition.total < 0 ? "bad" : "default"}
        />
        <KpiTile
          label={t("netCashflow", { days: windowDays })}
          value={formatEtbCompact(data.period.net)}
          hint={t("netHint", {
            income: formatEtbCompact(data.period.income),
            expense: formatEtbCompact(data.period.expense),
          })}
          tone={data.period.net >= 0 ? "good" : "bad"}
        />
        <KpiTile
          label={t("dailyBurn")}
          value={
            data.burnRate.isBurning
              ? formatEtbCompact(data.burnRate.dailyBurn)
              : "—"
          }
          hint={
            data.burnRate.isBurning
              ? t("burnHint", { days: data.burnRate.lookbackDays })
              : t("noBurnHint", { days: data.burnRate.lookbackDays })
          }
        />
        <KpiTile
          label={t("runway")}
          value={runwayLabel}
          hint={
            data.period.marginPct != null
              ? t("runwayHint", {
                  margin: data.period.marginPct.toFixed(1),
                })
              : t("runwayHintNa")
          }
          tone={
            data.burnRate.runwayDays != null && data.burnRate.runwayDays < 30
              ? "bad"
              : "default"
          }
        />
      </div>

      <HealthScoreCard health={data.healthScore} />

      <div className="grid w-full gap-4 xl:grid-cols-12">
        <Panel
          title={t("cashflowTrend")}
          subtitle={
            data.cashflowTrend.granularity === "week"
              ? t("cashflowTrendWeekly")
              : t("cashflowTrendDaily")
          }
          className="xl:col-span-8"
        >
          {trendData.every((d) => d.inflow === 0 && d.outflow === 0) ? (
            <p className="py-10 text-center text-[13px] text-slate-gray">
              {t("cashflowEmpty")}
            </p>
          ) : (
            <ChartContainer
              config={cashflowConfig}
              className="aspect-auto h-[260px] w-full"
            >
              <AreaChart
                accessibilityLayer
                data={trendData}
                margin={{ left: 4, right: 8, top: 8, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="fillInflow" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-inflow)"
                      stopOpacity={0.28}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-inflow)"
                      stopOpacity={0.02}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={28}
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={48}
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => formatEtbCompact(Number(v)).replace("ETB ", "")}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => formatEtb(Number(value))}
                    />
                  }
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Area
                  type="monotone"
                  dataKey="inflow"
                  stroke="var(--color-inflow)"
                  fill="url(#fillInflow)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="outflow"
                  stroke="var(--color-outflow)"
                  fill="transparent"
                  strokeWidth={2}
                  strokeDasharray="4 3"
                />
              </AreaChart>
            </ChartContainer>
          )}
        </Panel>

        <Panel
          title={t("revExpTrend")}
          subtitle={t("revExpSubtitle", { days: windowDays })}
          className="xl:col-span-4"
        >
          <ChartContainer
            config={revExpConfig}
            className="aspect-auto h-[260px] w-full"
          >
            <AreaChart
              accessibilityLayer
              data={revExpData}
              margin={{ left: 4, right: 4, top: 8, bottom: 0 }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                minTickGap={24}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={44}
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => formatEtbCompact(Number(v)).replace("ETB ", "")}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => formatEtb(Number(value))}
                  />
                }
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Area
                type="monotone"
                dataKey="income"
                stroke="var(--color-income)"
                fill="var(--color-income)"
                fillOpacity={0.15}
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="expense"
                stroke="var(--color-expense)"
                fill="transparent"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        </Panel>
      </div>

      <div className="grid w-full gap-4 xl:grid-cols-12">
        <Panel
          title={t("topExpenses")}
          subtitle={t("topExpensesSubtitle", { days: windowDays })}
          className="xl:col-span-5"
        >
          {expenseBarData.length === 0 ? (
            <p className="py-8 text-center text-[13px] text-slate-gray">
              {t("topExpensesEmpty")}
            </p>
          ) : (
            <ul className="space-y-3">
              {data.topExpenseCategories.map((cat, i) => (
                <li key={cat.accountId}>
                  <div className="mb-1 flex items-center justify-between gap-2 text-[12px]">
                    <span className="truncate font-medium text-ink-charcoal">
                      {cat.name}
                    </span>
                    <span className="shrink-0 tabular-nums text-slate-gray">
                      {formatEtbCompact(cat.amount)} · {cat.sharePct}%
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-surface-ivory">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${cat.sharePct}%`,
                        backgroundColor: chartBlueAt(i),
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title={t("projectedTitle")}
          subtitle={t("projectedSubtitle", {
            sources: projectionSourceLabel,
            days: projectionDays,
          })}
          className="xl:col-span-7"
          actions={
            <Segmented
              options={projections}
              value={projectionDays}
              onChange={setProjectionDays}
            />
          }
        >
          <div className="mb-3 flex flex-wrap gap-4 text-[12px]">
            <span className="text-slate-gray">
              {t("opening")}{" "}
              <strong className="text-ink-charcoal">
                {formatEtbCompact(data.projection.openingCash)}
              </strong>
            </span>
            <span className="text-slate-gray">
              {t("ending")}{" "}
              <strong
                className={cn(
                  data.projection.endingCash < data.projection.openingCash
                    ? "text-[#d94a40]"
                    : "text-[#2f9e6e]"
                )}
              >
                {formatEtbCompact(data.projection.endingCash)}
              </strong>
            </span>
            <span className="text-slate-gray">
              {t("scheduledItems", { count: data.projection.scheduled.length })}
            </span>
          </div>
          <ChartContainer
            config={projectionConfig}
            className="aspect-auto h-[220px] w-full"
          >
            <AreaChart
              accessibilityLayer
              data={projectionData}
              margin={{ left: 4, right: 8, top: 8, bottom: 0 }}
            >
              <defs>
                <linearGradient id="fillProj" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-projectedBalance)"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-projectedBalance)"
                    stopOpacity={0.02}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                minTickGap={32}
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => String(v).slice(5)}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={48}
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => formatEtbCompact(Number(v)).replace("ETB ", "")}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => formatEtb(Number(value))}
                  />
                }
              />
              <Area
                type="monotone"
                dataKey="projectedBalance"
                stroke="var(--color-projectedBalance)"
                fill="url(#fillProj)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        </Panel>
      </div>

      <div className="grid w-full gap-4 xl:grid-cols-2">
        <AgingPanel
          title={t("receivablesTitle")}
          description={t("receivablesDescription")}
          href="/invoices"
          aging={data.receivablesAging}
        />
        <AgingPanel
          title={t("payablesTitle")}
          description={t("payablesDescription")}
          href="/bills"
          aging={data.payablesAging}
        />
      </div>

      {data.cashPosition.byAccount.length > 0 ? (
        <Panel
          title={t("cashByAccount")}
          subtitle={t("cashByAccountSubtitle")}
        >
          <ul className="divide-y divide-hairline">
            {data.cashPosition.byAccount.map((row) => (
              <li
                key={row.accountId}
                className="flex items-center justify-between gap-3 py-2.5 text-[13px]"
              >
                <span className="min-w-0 truncate text-ink-charcoal">
                  <span className="text-slate-gray">{row.code}</span>{" "}
                  {row.name}
                </span>
                <span className="shrink-0 font-semibold tabular-nums">
                  {formatEtb(row.balance)}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      ) : null}
    </div>
  );
}
