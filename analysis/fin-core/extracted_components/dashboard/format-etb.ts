/** Compact ETB for KPI / table surfaces — e.g. ETB 12.4M */
export function formatEtbCompact(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1_000_000_000) {
    return `${sign}ETB ${(abs / 1_000_000_000).toFixed(1)}B`;
  }
  if (abs >= 1_000_000) {
    return `${sign}ETB ${(abs / 1_000_000).toFixed(1)}M`;
  }
  if (abs >= 1_000) {
    return `${sign}ETB ${(abs / 1_000).toFixed(1)}K`;
  }
  return `${sign}ETB ${abs.toLocaleString("en-ET")}`;
}

/** Full ETB with grouping — e.g. ETB 12,450,000 */
export function formatEtb(value: number): string {
  return `ETB ${Math.round(value).toLocaleString("en-ET")}`;
}

export function formatPercent(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`;
}

export function formatDelta(
  current: number,
  previous: number,
  unit: "etb" | "percent" | "days" | "count"
): { label: string; direction: "up" | "down" | "flat" } {
  if (previous === 0) {
    return { label: "—", direction: "flat" };
  }
  if (unit === "percent") {
    const pp = current - previous;
    const sign = pp > 0 ? "+" : "";
    return {
      label: `${sign}${pp.toFixed(1)} pp`,
      direction: pp > 0.05 ? "up" : pp < -0.05 ? "down" : "flat",
    };
  }
  if (unit === "days" || unit === "count") {
    const diff = current - previous;
    const sign = diff > 0 ? "+" : diff < 0 ? "−" : "";
    return {
      label: `${sign}${Math.abs(diff).toFixed(unit === "days" ? 1 : 0)}`,
      direction: diff > 0.05 ? "up" : diff < -0.05 ? "down" : "flat",
    };
  }
  const raw = ((current - previous) / Math.abs(previous)) * 100;
  const direction = raw > 0.05 ? "up" : raw < -0.05 ? "down" : "flat";
  const abs = Math.abs(raw);
  const sign = direction === "up" ? "+" : direction === "down" ? "−" : "";
  return {
    label: `${sign}${abs.toFixed(1)}%`,
    direction,
  };
}

export function formatKpiValue(
  value: number,
  unit: "etb" | "percent" | "days" | "count"
): string {
  if (unit === "etb") return formatEtbCompact(value);
  if (unit === "percent") return formatPercent(value);
  if (unit === "days") return `${value.toFixed(1)}d`;
  return value.toLocaleString("en-ET");
}
