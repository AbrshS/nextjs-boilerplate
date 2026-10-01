"use client";

import { Link } from "@/i18n/routing";
import { cn } from "@/shared/utils/cn";
import type { OpsCard, RecentTxn } from "../data/mock-dashboard";

const TONE: Record<NonNullable<OpsCard["tone"]>, string> = {
  neutral: "text-ink-charcoal",
  good: "text-[#3db88a]",
  warn: "text-[#c27803]",
  bad: "text-[#d94a40]",
};

const STATUS: Record<RecentTxn["status"], string> = {
  Matched: "bg-[#5ecf9a]/15 text-[#2f9e6e]",
  Partial: "bg-electric-cobalt/10 text-electric-cobalt",
  Exception: "bg-[#f07167]/15 text-[#d94a40]",
};

export function OpsCards({ cards }: { cards: OpsCard[] }) {
  return (
    <div className="grid w-full gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      {cards.map((card) => (
        <Link
          key={card.id}
          href={card.href}
          className="rounded-[var(--radius-cards)] border border-hairline bg-pure-white p-4 transition-colors hover:bg-surface-ivory"
        >
          <p className="text-[12px] font-medium text-slate-gray">{card.label}</p>
          <p
            className={cn(
              "mt-2 text-[20px] font-semibold tracking-tight",
              TONE[card.tone ?? "neutral"]
            )}
          >
            {card.value}
          </p>
          <p className="mt-1.5 text-[12px] leading-snug text-steel-gray">
            {card.detail}
          </p>
        </Link>
      ))}
    </div>
  );
}

export function RecentTransactions({ rows }: { rows: RecentTxn[] }) {
  return (
    <section className="overflow-hidden rounded-[var(--radius-cards)] border border-hairline bg-pure-white">
      <div className="flex items-center justify-between border-b border-hairline px-5 py-4">
        <div>
          <h2 className="text-[16px] font-semibold text-ink-charcoal">
            Recent payments
          </h2>
          <p className="text-[12px] text-slate-gray">Live inbox · last hour</p>
        </div>
        <Link
          href="/payments"
          className="text-[13px] font-medium text-electric-cobalt"
        >
          View all
        </Link>
      </div>
      <ul className="divide-y divide-hairline">
        {rows.map((row) => (
          <li
            key={row.id}
            className="flex items-center gap-3 px-5 py-3.5 text-[13px]"
          >
            <span className="w-10 shrink-0 tabular-nums text-steel-gray">
              {row.time}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-ink-charcoal">
                {row.description}
              </p>
              <p className="text-[12px] text-slate-gray">{row.channel}</p>
            </div>
            <span className="shrink-0 tabular-nums font-medium text-ink-charcoal">
              {row.amount}
            </span>
            <span
              className={cn(
                "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium",
                STATUS[row.status]
              )}
            >
              {row.status}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
