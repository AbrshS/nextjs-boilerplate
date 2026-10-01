export function MatchScore({
  score,
  compact = false,
}: {
  score: number;
  compact?: boolean;
}) {
  const value = Math.round(score);
  return (
    <div
      aria-label={`Final match score ${value} percent.`}
      className={`inline-flex shrink-0 items-center gap-2 rounded-xl border border-zinc-200 bg-white text-zinc-900 shadow-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 ${compact ? "px-2.5 py-1.5" : "px-4 py-3"}`}
    >
      <span
        className={`font-extrabold tabular-nums text-orange-500 ${compact ? "text-sm" : "text-2xl"}`}
      >
        {value}%
      </span>
      <span
        className={`font-semibold text-zinc-600 dark:text-zinc-300 ${compact ? "text-[10px]" : "text-xs"}`}
      >
        Match
      </span>
    </div>
  );
}
