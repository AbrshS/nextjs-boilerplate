"use client";

import * as React from "react";
import { ArrowUpRightIcon, MessageCircleIcon, XIcon } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";
import { Link } from "@/i18n/routing";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/shared/ui/chart";
import { cn } from "@/shared/utils/cn";
import { INSIGHT_FEED, matchAiAnswer } from "../data/mock-dashboard";
import type { AiAnswer, InsightSeverity } from "../types";

const SEVERITY_DOT: Record<InsightSeverity, string> = {
  info: "bg-electric-cobalt",
  warning: "bg-[#b45309]",
  critical: "bg-[#b42318]",
};

function AnswerChart({
  chart,
}: {
  chart: NonNullable<AiAnswer["chart"]>;
}) {
  const config = {
    value: { label: chart.title, color: "#0068f9" },
  } satisfies ChartConfig;

  const data = chart.points.map((p) => ({
    label: p.label,
    value: p.value,
    fill: p.value < 0 ? "#b42318" : "#0068f9",
  }));

  return (
    <div className="rounded-[14px] border border-white/50 bg-pure-white/80 p-3 backdrop-blur-sm">
      <p className="mb-2 text-[12px] font-medium text-slate-gray">
        {chart.title}
        {chart.unit ? ` · ${chart.unit}` : ""}
      </p>
      <ChartContainer config={config} className="aspect-auto h-[160px] w-full">
        <BarChart
          accessibilityLayer
          data={data}
          margin={{ left: 0, right: 4, top: 4, bottom: 0 }}
        >
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tickMargin={6}
            tick={{ fill: "#777c86", fontSize: 10 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={28}
            tick={{ fill: "#777c86", fontSize: 10 }}
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.label} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  );
}

function AnswerBlock({ answer }: { answer: AiAnswer }) {
  return (
    <div className="space-y-3 rounded-[16px] border border-white/60 bg-pure-white/85 p-4 shadow-[0_8px_32px_rgba(18,23,34,0.08)] backdrop-blur-md">
      <p className="text-[14px] leading-[1.55] text-ink-charcoal">
        {answer.summary}
      </p>
      {answer.chart ? <AnswerChart chart={answer.chart} /> : null}
      <ol className="space-y-3">
        {answer.ranked.map((row) => (
          <li key={row.rank} className="text-[13px]">
            <p className="font-semibold text-ink-charcoal">
              <span className="text-electric-cobalt">{row.rank}.</span>{" "}
              {row.title}
            </p>
            <p className="mt-0.5 text-slate-gray">{row.detail}</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {row.citations.map((c) => (
                <Link
                  key={c.href + c.label}
                  href={c.href}
                  className="inline-flex items-center gap-0.5 rounded-full border border-hairline bg-pure-white px-2 py-0.5 text-[11px] font-medium text-electric-cobalt"
                >
                  {c.label}
                  <ArrowUpRightIcon className="size-3" />
                </Link>
              ))}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function AiFloatingAssistant() {
  const [open, setOpen] = React.useState(false);
  const [question, setQuestion] = React.useState("");
  const [thinking, setThinking] = React.useState(false);
  const [answer, setAnswer] = React.useState<AiAnswer | null>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const ask = (e: React.FormEvent) => {
    e.preventDefault();
    const q = question.trim();
    if (!q || thinking) return;
    setThinking(true);
    setAnswer(null);
    window.setTimeout(() => {
      setAnswer(matchAiAnswer(q));
      setThinking(false);
      window.setTimeout(() => {
        scrollRef.current?.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: "smooth",
        });
      }, 50);
    }, 900);
  };

  React.useEffect(() => {
    if (!open) return;
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open FinCore assistant"
        className={cn(
          "fixed right-5 bottom-5 z-40 flex h-14 items-center gap-2 rounded-full bg-electric-cobalt px-5 text-[14px] font-medium text-pure-white shadow-[0_8px_28px_rgba(0,104,249,0.35)] transition-transform hover:bg-deep-cobalt active:scale-[0.98]",
          open && "pointer-events-none scale-90 opacity-0"
        )}
      >
        <MessageCircleIcon className="size-5" strokeWidth={1.75} />
        Ask FinCore
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center sm:p-6">
          {/* Dim backdrop */}
          <button
            type="button"
            aria-label="Close assistant backdrop"
            className="absolute inset-0 bg-ink-charcoal/50 backdrop-blur-[3px]"
            onClick={() => setOpen(false)}
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="ai-assistant-title"
            className="relative z-10 flex h-[min(820px,92vh)] w-full max-w-[640px] flex-col overflow-hidden rounded-[24px] border border-white/40 shadow-[0_32px_100px_rgba(18,23,34,0.28)] animate-in fade-in-0 zoom-in-95 duration-200"
          >
            {/* AI gradient shell */}
            <div
              className="pointer-events-none absolute inset-0 bg-[linear-gradient(155deg,#eaf2ff_0%,#f4f0ff_38%,#ffffff_72%,#d6e4f1_100%)]"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute -top-24 -right-16 size-64 rounded-full bg-electric-cobalt/20 blur-3xl"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute -bottom-20 -left-10 size-56 rounded-full bg-vivid-violet/15 blur-3xl"
              aria-hidden
            />

            <div className="relative flex items-start justify-between gap-3 border-b border-white/50 px-6 py-5">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.077em] text-electric-cobalt uppercase">
                  Ledger-aware
                </p>
                <h2
                  id="ai-assistant-title"
                  className="mt-1 text-[18px] font-semibold text-ink-charcoal"
                >
                  FinCore Assistant
                </h2>
                <p className="mt-0.5 text-[13px] text-slate-gray">
                  Ask anything — answers include ranked results and charts.
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="bg-pure-white/50"
              >
                <XIcon className="size-4" />
              </Button>
            </div>

            {/* Scrollable body */}
            <div
              ref={scrollRef}
              className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4"
            >
              <div className="space-y-3 pb-2">
                <p className="text-[11px] font-semibold tracking-[0.077em] text-slate-gray uppercase">
                  Flagged this week
                </p>
                {INSIGHT_FEED.slice(0, 4).map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-[14px] border border-white/70 bg-pure-white/70 p-3 backdrop-blur-sm transition-colors hover:bg-pure-white"
                  >
                    <div className="flex items-start gap-2.5">
                      <span
                        className={cn(
                          "mt-1.5 size-1.5 shrink-0 rounded-full",
                          SEVERITY_DOT[item.severity]
                        )}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <p className="truncate text-[13px] font-semibold text-ink-charcoal">
                            {item.title}
                          </p>
                          <span className="shrink-0 text-[11px] text-steel-gray">
                            {item.timeLabel}
                          </span>
                        </div>
                        <p className="mt-1 text-[13px] leading-[1.45] text-slate-gray">
                          {item.body}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}

                {thinking ? (
                  <div className="rounded-[14px] border border-white/70 bg-pure-white/70 px-4 py-3 text-[13px] text-slate-gray backdrop-blur-sm">
                    Reviewing ledger snapshot…
                  </div>
                ) : null}
                {answer ? <AnswerBlock answer={answer} /> : null}
              </div>
            </div>

            <div className="relative border-t border-white/50 bg-pure-white/55 px-5 py-4 backdrop-blur-md">
              <form onSubmit={ask} className="flex flex-col gap-2">
                <Input
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="e.g. Which partner has the worst overdue ratio?"
                  className="h-11 border-hairline bg-pure-white text-[14px]"
                  disabled={thinking}
                  autoFocus
                />
                <div className="flex items-center gap-2">
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={thinking || !question.trim()}
                  >
                    Ask
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="bg-pure-white/80"
                    onClick={() =>
                      setQuestion(
                        "Which partner organization is costing us the most in overdue receivables relative to how much business they bring us?"
                      )
                    }
                  >
                    Demo Q
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
