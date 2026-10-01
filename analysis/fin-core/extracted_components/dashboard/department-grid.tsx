"use client";

import * as React from "react";
import { ArrowDownRightIcon, ArrowUpRightIcon } from "lucide-react";
import { Link } from "@/i18n/routing";
import { cn } from "@/shared/utils/cn";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { formatEtbCompact, formatPercent } from "../lib/format-etb";
import type { DepartmentRow } from "../types";

type SortMode = "improved" | "declining" | "margin";

const SORT_OPTIONS: { id: SortMode; label: string }[] = [
  { id: "improved", label: "Most improved" },
  { id: "declining", label: "Most declining" },
  { id: "margin", label: "Highest margin" },
];

function sortRows(rows: DepartmentRow[], mode: SortMode): DepartmentRow[] {
  const copy = [...rows];
  if (mode === "improved") {
    return copy.sort((a, b) => b.trendPp - a.trendPp);
  }
  if (mode === "declining") {
    return copy.sort((a, b) => a.trendPp - b.trendPp);
  }
  return copy.sort((a, b) => b.margin - a.margin);
}

export function DepartmentGrid({ rows }: { rows: DepartmentRow[] }) {
  const [sort, setSort] = React.useState<SortMode>("improved");
  const sorted = React.useMemo(() => sortRows(rows, sort), [rows, sort]);

  return (
    <section className="overflow-hidden rounded-[var(--radius-cards)] border border-hairline bg-pure-white shadow-none">
      <div className="flex flex-col gap-3 border-b border-hairline px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-[18px] font-semibold leading-[1.5] text-ink-charcoal">
            Department performance
          </h2>
          <p className="mt-0.5 text-[13px] text-slate-gray">
            Eight floors — where the hospital is winning and where it is not.
          </p>
        </div>
        <div
          className="flex flex-wrap gap-1 rounded-full border border-hairline bg-surface-ivory p-0.5"
          role="group"
          aria-label="Sort departments"
        >
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setSort(opt.id)}
              className={cn(
                "rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors",
                sort === opt.id
                  ? "bg-electric-cobalt text-pure-white"
                  : "text-slate-gray hover:text-ink-charcoal"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="px-6 text-slate-gray">Department</TableHead>
            <TableHead className="text-right text-slate-gray">Revenue</TableHead>
            <TableHead className="text-right text-slate-gray">Cost</TableHead>
            <TableHead className="text-right text-slate-gray">Margin</TableHead>
            <TableHead className="px-6 text-right text-slate-gray">Trend</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((row) => {
            const up = row.trendPp >= 0;
            return (
              <TableRow key={row.id} className="group">
                <TableCell className="px-6 py-3.5">
                  <Link
                    href={row.href}
                    className="block font-medium text-ink-charcoal group-hover:text-electric-cobalt"
                  >
                    {row.name}
                    <span className="mt-0.5 block text-[12px] font-normal text-slate-gray">
                      Floor {row.floor}
                    </span>
                  </Link>
                </TableCell>
                <TableCell className="text-right tabular-nums text-ink-charcoal">
                  <Link href={row.href}>{formatEtbCompact(row.revenue)}</Link>
                </TableCell>
                <TableCell className="text-right tabular-nums text-slate-gray">
                  <Link href={row.href}>{formatEtbCompact(row.cost)}</Link>
                </TableCell>
                <TableCell className="text-right tabular-nums font-medium text-ink-charcoal">
                  <Link href={row.href}>{formatPercent(row.margin)}</Link>
                </TableCell>
                <TableCell className="px-6 text-right">
                  <Link
                    href={row.href}
                    className={cn(
                      "inline-flex items-center justify-end gap-0.5 text-[13px] font-medium tabular-nums",
                      up ? "text-[#3db88a]" : "text-[#d94a40]"
                    )}
                  >
                    {up ? (
                      <ArrowUpRightIcon className="size-3.5" />
                    ) : (
                      <ArrowDownRightIcon className="size-3.5" />
                    )}
                    {up ? "+" : ""}
                    {row.trendPp.toFixed(1)} pp
                  </Link>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </section>
  );
}
