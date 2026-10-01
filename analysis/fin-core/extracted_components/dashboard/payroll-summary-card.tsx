"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { cn } from "@/shared/utils/cn";
import { formatEtbCompact } from "../lib/format-etb";
import type { DashboardPayrollSummary } from "../types/dashboard-api.types";

const STATUS_TONE: Record<string, string> = {
  draft: "text-slate-gray",
  calculated: "text-[#c27803]",
  approved: "text-electric-cobalt",
  posted: "text-[#2f9e6e]",
  disbursed: "text-[#2f9e6e]",
};

export function PayrollSummaryCard({
  summary,
}: {
  summary: DashboardPayrollSummary;
}) {
  const t = useTranslations("Dashboard");
  const run = summary.currentRun;
  const status = run?.status ?? "not_started";

  const statusLabelKey: Record<string, "payrollDraft" | "payrollCalculated" | "payrollApproved" | "payrollPosted" | "payrollDisbursed"> = {
    draft: "payrollDraft",
    calculated: "payrollCalculated",
    approved: "payrollApproved",
    posted: "payrollPosted",
    disbursed: "payrollDisbursed",
  };

  const value = run
    ? statusLabelKey[run.status]
      ? t(statusLabelKey[run.status])
      : run.status
    : summary.activeEmployeeCount > 0
      ? t("payrollNotStarted")
      : t("payrollNoRoster");

  const detail = run
    ? t("payrollDetailRun", {
        count: run.employeeCount,
        net: formatEtbCompact(run.totalNet),
        period: run.period,
      })
    : summary.activeEmployeeCount > 0
      ? t("payrollDetailIdle", {
          count: summary.activeEmployeeCount,
          gross: formatEtbCompact(summary.estimatedGrossBase),
        })
      : t("payrollAddEmployees");

  const href = run ? `/payroll/run` : "/payroll";

  return (
    <Link
      href={href}
      className="rounded-[var(--radius-cards)] border border-hairline bg-pure-white p-4 transition-colors hover:bg-surface-ivory"
    >
      <p className="text-[12px] font-medium text-slate-gray">
        {t("payrollPeriod", { period: summary.currentPeriod })}
      </p>
      <p
        className={cn(
          "mt-2 text-[20px] font-semibold tracking-tight",
          STATUS_TONE[status] ?? "text-ink-charcoal"
        )}
      >
        {value}
      </p>
      <p className="mt-1.5 text-[12px] leading-snug text-steel-gray">{detail}</p>
    </Link>
  );
}
