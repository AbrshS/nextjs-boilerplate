"use client";

import * as React from "react";
import { TrendingUpIcon, TrendingDownIcon, MinusIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { cn } from "@/shared/utils/cn";

export interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  subtitle?: string;
  sparklineData?: number[];
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}

/**
 * Pure SVG Sparkline generator without external dependencies.
 */
function Sparkline({
  data,
  type = "positive",
  width = 80,
  height = 24,
}: {
  data: number[];
  type?: "positive" | "negative" | "neutral";
  width?: number;
  height?: number;
}) {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const strokeColor =
    type === "positive"
      ? "oklch(0.627 0.194 149.214)" // Emerald green
      : type === "negative"
      ? "oklch(0.577 0.245 27.325)" // Rose red
      : "oklch(0.52 0.01 260)"; // Neutral slate

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

export function MetricCard({
  title,
  value,
  change,
  changeType = "positive",
  subtitle,
  sparklineData = [12, 18, 14, 25, 22, 30, 28, 38],
  icon: Icon,
  className,
}: MetricCardProps) {
  const isPositive = changeType === "positive";
  const isNegative = changeType === "negative";

  return (
    <Card
      className={cn(
        "relative overflow-hidden border-border/70 bg-card shadow-none transition-all hover:border-foreground/20",
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <span className="text-xs font-medium text-muted-foreground">{title}</span>
        {Icon && (
          <div className="flex size-7 items-center justify-center rounded-md bg-muted/60 text-muted-foreground">
            <Icon className="size-3.5" />
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-2">
        <div className="flex items-baseline justify-between">
          <div className="font-mono text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {value}
          </div>
          {sparklineData && (
            <div className="ml-2 shrink-0">
              <Sparkline data={sparklineData} type={changeType} />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 pt-1 text-xs">
          {change && (
            <Badge
              variant={isPositive ? "secondary" : isNegative ? "destructive" : "outline"}
              className={cn(
                "gap-1 font-mono text-[10px] font-semibold",
                isPositive && "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20",
                isNegative && "bg-destructive/10 text-destructive border border-destructive/20"
              )}
            >
              {isPositive ? (
                <TrendingUpIcon className="size-3" />
              ) : isNegative ? (
                <TrendingDownIcon className="size-3" />
              ) : (
                <MinusIcon className="size-3" />
              )}
              {change}
            </Badge>
          )}
          {subtitle && (
            <span className="text-[11px] text-muted-foreground truncate">
              {subtitle}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
