"use client";

import { cn } from "@/shared/utils/cn";

type SparklineProps = {
  data: number[];
  className?: string;
  /** Stroke color — defaults to cobalt */
  tone?: "cobalt" | "forest" | "danger" | "muted";
};

const TONE: Record<NonNullable<SparklineProps["tone"]>, string> = {
  cobalt: "#0068f9",
  forest: "#5ecf9a",
  danger: "#f07167",
  muted: "#7a93b8",
};

export function Sparkline({
  data,
  className,
  tone = "cobalt",
}: SparklineProps) {
  if (data.length < 2) return null;

  const width = 120;
  const height = 36;
  const pad = 2;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (width - pad * 2);
    const y = height - pad - ((v - min) / range) * (height - pad * 2);
    return `${x},${y}`;
  });

  const path = points
    .map((p, i) => (i === 0 ? `M ${p}` : `L ${p}`))
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn("h-9 w-full max-w-[140px]", className)}
      aria-hidden
    >
      <path
        d={path}
        fill="none"
        stroke={TONE[tone]}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
