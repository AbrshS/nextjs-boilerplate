"use client";

import { useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Layers,
  RefreshCw,
  ShieldCheck,
  Sliders,
} from "lucide-react";

import { useGetAdminSourceDeliveryPolicyQuery } from "@/domains/admin/api/admin.api";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { SourceDeliveryMixDrawer } from "./source-delivery-mix-drawer";

// Known source branding colors
const SOURCE_COLOR_PALETTE: Record<string, { bg: string; text: string; dot: string; hex: string }> = {
  LINKEDIN: {
    bg: "bg-blue-600 dark:bg-blue-500",
    text: "text-blue-600 dark:text-blue-400",
    dot: "bg-blue-500",
    hex: "#0A66C2",
  },
  UPWORK: {
    bg: "bg-emerald-600 dark:bg-emerald-500",
    text: "text-emerald-600 dark:text-emerald-400",
    dot: "bg-emerald-500",
    hex: "#14A800",
  },
  GOOGLE_JOBS: {
    bg: "bg-indigo-600 dark:bg-indigo-500",
    text: "text-indigo-600 dark:text-indigo-400",
    dot: "bg-indigo-500",
    hex: "#6366F1",
  },
  TELEGRAM: {
    bg: "bg-cyan-600 dark:bg-cyan-500",
    text: "text-cyan-600 dark:text-cyan-400",
    dot: "bg-cyan-500",
    hex: "#229ED9",
  },
  REMOTEOK: {
    bg: "bg-violet-600 dark:bg-violet-500",
    text: "text-violet-600 dark:text-violet-400",
    dot: "bg-violet-500",
    hex: "#8B5CF6",
  },
  INDEED: {
    bg: "bg-sky-700 dark:bg-sky-600",
    text: "text-sky-700 dark:text-sky-400",
    dot: "bg-sky-600",
    hex: "#2164F3",
  },
  WELLFOUND: {
    bg: "bg-amber-600 dark:bg-amber-500",
    text: "text-amber-600 dark:text-amber-400",
    dot: "bg-amber-500",
    hex: "#F59E0B",
  },
};

const FALLBACK_PALETTE = [
  { bg: "bg-teal-600 dark:bg-teal-500", text: "text-teal-600", dot: "bg-teal-500", hex: "#0D9488" },
  { bg: "bg-rose-600 dark:bg-rose-500", text: "text-rose-600", dot: "bg-rose-500", hex: "#E11D48" },
  { bg: "bg-orange-600 dark:bg-orange-500", text: "text-orange-600", dot: "bg-orange-500", hex: "#EA580C" },
  { bg: "bg-purple-600 dark:bg-purple-500", text: "text-purple-600", dot: "bg-purple-500", hex: "#9333EA" },
];

function getSourceColor(sourceCode: string, index: number) {
  const upper = sourceCode.toUpperCase();
  if (SOURCE_COLOR_PALETTE[upper]) {
    return SOURCE_COLOR_PALETTE[upper];
  }
  return FALLBACK_PALETTE[index % FALLBACK_PALETTE.length];
}

function formatDate(value: string | null | undefined) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  }).format(date);
}

export function SourceDeliveryMixCard() {
  const { data: overview, isLoading, isError, refetch } =
    useGetAdminSourceDeliveryPolicyQuery();
  const [isConfigureOpen, setIsConfigureOpen] = useState(false);

  const activePolicy = overview?.activePolicy;
  const draftPolicy = overview?.draftPolicy;
  const entries = activePolicy?.entries ?? [];

  const totalSum = entries.reduce(
    (acc, curr) => acc + (Number(curr.targetPercentage) || 0),
    0,
  );

  return (
    <>
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Layers className="size-5" aria-hidden="true" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-base font-bold">
                  Source Delivery Mix Policy
                </CardTitle>
                {isLoading ? null : (
                  <Badge
                    variant="outline"
                    className="gap-1 border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-medium"
                  >
                    <CheckCircle2 className="size-3" aria-hidden="true" />
                    {activePolicy?.status === "PUBLISHED"
                      ? "Active Published Policy"
                      : "Default Balanced Mix"}
                  </Badge>
                )}
                {draftPolicy ? (
                  <Badge
                    variant="outline"
                    className="gap-1 border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400 font-medium"
                  >
                    <AlertCircle className="size-3" aria-hidden="true" />
                    Draft Pending
                  </Badge>
                ) : null}
              </div>
              <CardDescription className="mt-1 text-xs">
                Defines the proportional job recommendation quotas across verified job sources.
                Enforced dynamically with bounds and fallback protection.
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={() => refetch()}
              disabled={isLoading}
              title="Refresh policy overview"
            >
              <RefreshCw
                className={`size-3.5 ${isLoading ? "animate-spin" : ""}`}
                aria-hidden="true"
              />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <Button
              variant="default"
              size="sm"
              className="gap-1.5 text-xs font-semibold"
              onClick={() => setIsConfigureOpen(true)}
            >
              <Sliders className="size-3.5" aria-hidden="true" />
              Configure Mix
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-4">
          {isLoading ? (
            <div className="space-y-3 py-2">
              <div className="h-4 w-full animate-pulse rounded-full bg-muted" />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-14 animate-pulse rounded-lg bg-muted" />
                ))}
              </div>
            </div>
          ) : isError ? (
            <div className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
              <span>Failed to load source delivery policy.</span>
              <Button size="sm" variant="outline" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          ) : entries.length === 0 ? (
            <div className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
              No delivery policy entries configured. Click &quot;Configure Mix&quot; to set up your distribution mix.
            </div>
          ) : (
            <>
              {/* Multi-segment Horizontal Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-muted-foreground">
                    Target Quota Distribution (100% Total)
                  </span>
                  <span className="font-mono text-xs font-medium text-muted-foreground">
                    {totalSum}% assigned across {entries.length} source{entries.length > 1 ? "s" : ""}
                  </span>
                </div>

                <div className="flex h-3.5 w-full overflow-hidden rounded-full bg-muted/60 p-0.5 shadow-inner">
                  {entries.map((entry, idx) => {
                    const color = getSourceColor(entry.sourceCode, idx);
                    const widthPercent =
                      totalSum > 0
                        ? Math.max(2, (entry.targetPercentage / totalSum) * 100)
                        : 0;

                    return (
                      <div
                        key={entry.sourceCode}
                        className={`h-full transition-all duration-300 first:rounded-l-full last:rounded-r-full ${color.bg}`}
                        style={{ width: `${widthPercent}%` }}
                        title={`${entry.sourceCode}: ${entry.targetPercentage}% (min: ${entry.minPercentage}%, max: ${entry.maxPercentage}%)`}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Source Details Grid */}
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {entries.map((entry, idx) => {
                  const color = getSourceColor(entry.sourceCode, idx);

                  return (
                    <div
                      key={entry.sourceCode}
                      className="flex flex-col justify-between rounded-xl border bg-card/60 p-3 shadow-xs hover:border-primary/40 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`size-2.5 rounded-full ${color.dot}`}
                            aria-hidden="true"
                          />
                          <span className="font-mono text-xs font-bold tracking-tight">
                            {entry.sourceCode}
                          </span>
                        </div>
                        <span className="font-mono text-xs font-bold text-foreground">
                          {entry.targetPercentage}%
                        </span>
                      </div>

                      <div className="mt-2 flex items-center justify-between gap-1 text-[11px] text-muted-foreground">
                        <span className="font-mono">
                          Range: {entry.minPercentage}% – {entry.maxPercentage}%
                        </span>
                        {entry.isFallback ? (
                          <Badge
                            variant="secondary"
                            className="h-4 gap-0.5 px-1 text-[9px] font-semibold text-muted-foreground"
                            title="Fallback source activated when primary supply is low"
                          >
                            <ShieldCheck className="size-2.5" aria-hidden="true" />
                            Fallback
                          </Badge>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Policy Metadata Footer */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-[11px] text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">
                    {activePolicy?.name || "Standard Source Delivery Mix"}
                  </span>
                  {activePolicy?.publishedAt ? (
                    <span>• Published {formatDate(activePolicy.publishedAt)}</span>
                  ) : (
                    <span>• System Default Dynamic Mix</span>
                  )}
                </div>

                {draftPolicy ? (
                  <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                    <AlertCircle className="size-3.5" aria-hidden="true" />
                    <span>
                      Unpublished draft saved ({draftPolicy.entries.length} sources)
                    </span>
                  </div>
                ) : null}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Configuration Drawer */}
      <SourceDeliveryMixDrawer
        open={isConfigureOpen}
        onOpenChange={setIsConfigureOpen}
        overview={overview}
        onSuccess={() => refetch()}
      />
    </>
  );
}
