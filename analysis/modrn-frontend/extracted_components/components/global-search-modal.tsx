"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { useRouter } from "@/i18n/routing";
import { cn } from "@/shared/utils/cn";
import {
  ArrowUpRightIcon,
  BarChart3Icon,
  BellIcon,
  CalendarDaysIcon,
  CircleHelpIcon,
  CreditCardIcon,
  FolderOpenIcon,
  HandHeartIcon,
  LayoutDashboardIcon,
  MoreVerticalIcon,
  PlusIcon,
  RefreshCwIcon,
  SearchIcon,
  SettingsIcon,
  ShoppingBagIcon,
  SparklesIcon,
  LifeBuoyIcon,
  TrendingUpIcon,
  UserIcon,
  XIcon,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

type SearchItem = {
  id: string;
  label: string;
  href: string;
  keywords: string[];
  icon: React.ComponentType<{ className?: string }>;
  meta?: string;
  tone?: string;
};

type QuickAction = {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  shortcut: string;
};

type FilterTag = { id: string; label: string };

// ── Catalog ──────────────────────────────────────────────────────────────────

const DEFAULT_FILTERS: FilterTag[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "shop", label: "Shop" },
  { id: "schedule", label: "Schedule" },
];

const ADDABLE_FILTERS: FilterTag[] = [
  { id: "faq", label: "FAQ" },
  { id: "partners", label: "Partners" },
  { id: "credentials", label: "Credentials" },
  { id: "membership", label: "Membership" },
];

const SEARCH_ITEMS: SearchItem[] = [
  {
    id: "dashboard",
    label: "Dashboard — Command Center",
    href: "/dashboard",
    keywords: ["home", "overview", "vitals"],
    icon: LayoutDashboardIcon,
    meta: "Overview",
    tone: "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300",
  },
  {
    id: "schedule",
    label: "Schedule — Shifts & Calendar",
    href: "/schedule",
    keywords: ["calendar", "shifts", "work"],
    icon: CalendarDaysIcon,
    meta: "Calendar",
    tone: "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300",
  },
  {
    id: "shop",
    label: "Shop — Scrubs & Nurse Gear",
    href: "/shop",
    keywords: ["store", "merch", "scrubs"],
    icon: ShoppingBagIcon,
    meta: "12 brands",
    tone: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
  },
  {
    id: "contributions",
    label: "Contributions — Referrals & Giving",
    href: "/contributions",
    keywords: ["referral", "giving", "rewards"],
    icon: HandHeartIcon,
    meta: "Rewards",
    tone: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300",
  },
  {
    id: "partners",
    label: "Find Partners — Directories",
    href: "/directories",
    keywords: ["directory", "facility", "provider"],
    icon: FolderOpenIcon,
    meta: "Directory",
    tone: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
  },
  {
    id: "faq",
    label: "FAQ & L.A.N.E. Help",
    href: "/faq",
    keywords: ["help", "lane", "support", "chat", "bug", "feature", "report"],
    icon: CircleHelpIcon,
    meta: "Support",
    tone: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300",
  },
  {
    id: "feedback",
    label: "My reports — Bugs & feature requests",
    href: "/feedback",
    keywords: ["bug", "feature", "report", "idea", "broken", "suggestion"],
    icon: LifeBuoyIcon,
    meta: "Support",
    tone: "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-500/20 dark:text-fuchsia-300",
  },
  {
    id: "notifications",
    label: "Notifications — Alerts",
    href: "/notifications",
    keywords: ["alerts", "inbox"],
    icon: BellIcon,
    meta: "Inbox",
    tone: "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300",
  },
  {
    id: "value-audit",
    label: "Value Audit — Membership Benefits",
    href: "/value-audit",
    keywords: ["value", "benefits", "savings", "annual", "features"],
    icon: TrendingUpIcon,
    meta: "Benefits",
    tone: "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300",
  },
  {
    id: "year",
    label: "Year in Review — Wrapped",
    href: "/year-in-review",
    keywords: ["wrapped", "recap", "stats"],
    icon: SparklesIcon,
    meta: "Recap",
    tone: "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-500/20 dark:text-fuchsia-300",
  },
  {
    id: "credentials",
    label: "Credentials — Licenses",
    href: "/dashboard/settings",
    keywords: ["license", "nursys", "badge"],
    icon: UserIcon,
    meta: "Verify",
    tone: "bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-300",
  },
  {
    id: "membership",
    label: "Membership — Plan & Billing",
    href: "/checkout",
    keywords: ["billing", "subscribe", "plan"],
    icon: CreditCardIcon,
    meta: "Billing",
    tone: "bg-slate-200 text-slate-700 dark:bg-slate-500/20 dark:text-slate-300",
  },
  {
    id: "settings",
    label: "Settings — Preferences",
    href: "/settings",
    keywords: ["prefs", "profile", "account"],
    icon: SettingsIcon,
    meta: "Account",
    tone: "bg-zinc-200 text-zinc-700 dark:bg-zinc-500/20 dark:text-zinc-300",
  },
];

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: "qa-dashboard",
    label: "Open Dashboard",
    href: "/dashboard",
    icon: BarChart3Icon,
    shortcut: "⌘ D",
  },
  {
    id: "qa-shop",
    label: "Browse Shop",
    href: "/shop",
    icon: ShoppingBagIcon,
    shortcut: "⌘ S",
  },
  {
    id: "qa-faq",
    label: "AI",
    href: "/faq",
    icon: CircleHelpIcon,
    shortcut: "⌘ /",
  },
  {
    id: "qa-schedule",
    label: "View Schedule",
    href: "/schedule",
    icon: CalendarDaysIcon,
    shortcut: "⌘ Y",
  },
];

const DEFAULT_RECENT_IDS = ["shop", "dashboard", "schedule", "contributions"];

const RECENT_KEY = "modrn-global-search-recent";
const FILTERS_KEY = "modrn-global-search-filters";
const MAX_RECENT = 4;

function loadRecent(): string[] {
  if (typeof window === "undefined") return DEFAULT_RECENT_IDS;
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return DEFAULT_RECENT_IDS;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_RECENT_IDS;
    return parsed
      .filter((x): x is string => typeof x === "string")
      .slice(0, MAX_RECENT);
  } catch {
    return DEFAULT_RECENT_IDS;
  }
}

function saveRecent(id: string) {
  const next = [id, ...loadRecent().filter((x) => x !== id)].slice(0, MAX_RECENT);
  localStorage.setItem(RECENT_KEY, JSON.stringify(next));
}

function loadFilters(): FilterTag[] {
  if (typeof window === "undefined") return DEFAULT_FILTERS;
  try {
    const raw = localStorage.getItem(FILTERS_KEY);
    if (!raw) return DEFAULT_FILTERS;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_FILTERS;
    return parsed.filter(
      (x): x is FilterTag =>
        Boolean(x) &&
        typeof x === "object" &&
        typeof (x as FilterTag).id === "string" &&
        typeof (x as FilterTag).label === "string",
    );
  } catch {
    return DEFAULT_FILTERS;
  }
}

function saveFilters(tags: FilterTag[]) {
  localStorage.setItem(FILTERS_KEY, JSON.stringify(tags));
}

function scoreItem(item: SearchItem, q: string): number {
  const needle = q.toLowerCase().trim();
  if (!needle) return 0;
  const label = item.label.toLowerCase();
  if (label === needle) return 100;
  if (label.startsWith(needle)) return 80;
  if (label.includes(needle)) return 60;
  if (item.keywords.some((k) => k.includes(needle) || needle.includes(k))) return 50;
  let i = 0;
  for (const ch of label) {
    if (ch === needle[i]) i += 1;
    if (i === needle.length) return 20;
  }
  return 0;
}

function Highlight({ text, query }: { text: string; query: string }) {
  const q = query.trim();
  if (!q) return <>{text}</>;
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "ig"));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === q.toLowerCase() ? (
          <mark key={i} className="rounded bg-zinc-200 px-0.5 text-zinc-900 dark:bg-zinc-700 dark:text-zinc-50">
            {part}
          </mark>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        ),
      )}
    </>
  );
}

type FlatRow =
  | { kind: "recent"; item: SearchItem }
  | { kind: "action"; action: QuickAction }
  | { kind: "result"; item: SearchItem };

// ── Modal ────────────────────────────────────────────────────────────────────

export function GlobalSearchModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  const [query, setQuery] = React.useState("");
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [recentIds, setRecentIds] = React.useState<string[]>(DEFAULT_RECENT_IDS);
  const [filters, setFilters] = React.useState<FilterTag[]>(DEFAULT_FILTERS);
  const [showAddFilters, setShowAddFilters] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      setRecentIds(loadRecent());
      setFilters(loadFilters());
      setShowAddFilters(false);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const recentItems = React.useMemo(
    () =>
      recentIds
        .map((id) => SEARCH_ITEMS.find((i) => i.id === id))
        .filter((i): i is SearchItem => Boolean(i)),
    [recentIds],
  );

  const searchResults = React.useMemo(() => {
    const q = query.trim();
    if (!q) return [];
    return SEARCH_ITEMS.map((item) => ({ item, score: scoreItem(item, q) }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((x) => x.item);
  }, [query]);

  const isSearching = query.trim().length > 0;

  const flatList: FlatRow[] = React.useMemo(() => {
    if (isSearching) {
      return searchResults.map((item) => ({ kind: "result" as const, item }));
    }
    return [
      ...recentItems.map((item) => ({ kind: "recent" as const, item })),
      ...QUICK_ACTIONS.map((action) => ({ kind: "action" as const, action })),
    ];
  }, [isSearching, searchResults, recentItems]);

  React.useEffect(() => {
    setActiveIndex(0);
  }, [query, filters]);

  React.useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(
      `[data-search-index="${activeIndex}"]`,
    );
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const goHref = React.useCallback(
    (href: string, recentId?: string) => {
      if (recentId) saveRecent(recentId);
      onOpenChange(false);
      router.push(href);
    },
    [onOpenChange, router],
  );

  const removeFilter = (id: string) => {
    const next = filters.filter((f) => f.id !== id);
    setFilters(next);
    saveFilters(next);
  };

  const addFilter = (tag: FilterTag) => {
    if (filters.some((f) => f.id === tag.id)) return;
    const next = [...filters, tag];
    setFilters(next);
    saveFilters(next);
    setQuery(tag.label);
    setShowAddFilters(false);
    inputRef.current?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, Math.max(flatList.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const row = flatList[activeIndex];
      if (!row) return;
      if (row.kind === "action") goHref(row.action.href);
      else goHref(row.item.href, row.item.id);
    }
  };

  const availableToAdd = ADDABLE_FILTERS.filter(
    (t) => !filters.some((f) => f.id === t.id),
  );

  let runningIndex = -1;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop
          className={cn(
            "fixed inset-0 z-50 bg-zinc-900/35 backdrop-blur-[2px]",
            "transition-opacity duration-200",
            "data-starting-style:opacity-0 data-ending-style:opacity-0",
          )}
        />
        <DialogPrimitive.Popup
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-[calc(100%-1.5rem)] max-w-[560px] -translate-x-1/2 -translate-y-1/2",
            "outline-none",
            "transition duration-200 ease-out",
            "data-starting-style:opacity-0 data-starting-style:scale-[0.98]",
            "data-ending-style:opacity-0 data-ending-style:scale-[0.98]",
          )}
        >
          {/* Outer gray shell (matches reference frame) */}
          <div
            className={cn(
              "rounded-[32px] bg-zinc-100 p-3 shadow-2xl shadow-zinc-900/15",
              "dark:bg-zinc-800/90 dark:shadow-black/40",
            )}
            onKeyDown={onKeyDown}
          >
            <DialogPrimitive.Title className="sr-only">
              Search MODRN
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="sr-only">
              Search pages, recent destinations, and quick actions.
            </DialogPrimitive.Description>

            {/* Inner white card */}
            <div className="overflow-hidden rounded-[24px] bg-white dark:bg-zinc-950">
              {/* Search input */}
              <div className="flex items-center gap-3 border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
                <SearchIcon className="size-[18px] shrink-0 text-zinc-400" strokeWidth={1.75} />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search..."
                  className={cn(
                    "min-w-0 flex-1 bg-transparent text-[15px] text-zinc-900",
                    "placeholder:text-zinc-400 outline-none dark:text-zinc-50",
                  )}
                  autoComplete="off"
                  spellCheck={false}
                />
                {query ? (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      inputRef.current?.focus();
                    }}
                    className="rounded-md p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800"
                    aria-label="Clear"
                  >
                    <XIcon className="size-3.5" />
                  </button>
                ) : (
                  <kbd className="rounded-md border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 font-mono text-[11px] text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
                    ⌘K
                  </kbd>
                )}
              </div>

              <div
                ref={listRef}
                className="max-h-[min(62vh,480px)] overflow-y-auto overscroll-contain px-4 py-4"
              >
                {/* Searching For */}
                {!isSearching && (
                  <div className="mb-5">
                    <p className="mb-2.5 text-[13px] font-medium text-zinc-400">
                      Searching For
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      {filters.map((tag) => (
                        <span
                          key={tag.id}
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full",
                            "bg-zinc-100 px-3 py-1.5 text-[13px] font-medium text-zinc-700",
                            "dark:bg-zinc-800 dark:text-zinc-200",
                          )}
                        >
                          {tag.label}
                          <button
                            type="button"
                            onClick={() => removeFilter(tag.id)}
                            className="rounded-full p-0.5 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700 dark:hover:bg-zinc-700 dark:hover:text-zinc-100"
                            aria-label={`Remove ${tag.label}`}
                          >
                            <XIcon className="size-3" />
                          </button>
                        </span>
                      ))}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowAddFilters((v) => !v)}
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full",
                            "bg-zinc-100 px-3 py-1.5 text-[13px] font-medium text-zinc-700",
                            "hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700",
                          )}
                        >
                          <PlusIcon className="size-3.5" />
                          Add New
                        </button>
                        {showAddFilters && availableToAdd.length > 0 && (
                          <div className="absolute left-0 top-full z-10 mt-1.5 min-w-[160px] overflow-hidden rounded-xl border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
                            {availableToAdd.map((tag) => (
                              <button
                                key={tag.id}
                                type="button"
                                onClick={() => addFilter(tag)}
                                className="flex w-full px-3 py-2 text-left text-[13px] text-zinc-700 hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-800"
                              >
                                {tag.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Search results */}
                {isSearching && (
                  <div>
                    <p className="mb-2 text-[13px] font-medium text-zinc-400">
                      Results
                    </p>
                    {searchResults.length === 0 ? (
                      <p className="px-1 py-8 text-center text-sm text-zinc-400">
                        No matches for “{query}”
                      </p>
                    ) : (
                      <div className="flex flex-col">
                        {searchResults.map((item) => {
                          runningIndex += 1;
                          const idx = runningIndex;
                          return (
                            <RecentRow
                              key={item.id}
                              item={item}
                              index={idx}
                              active={activeIndex === idx}
                              query={query}
                              onHover={() => setActiveIndex(idx)}
                              onSelect={() => goHref(item.href, item.id)}
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Recent */}
                {!isSearching && (
                  <div className="mb-5">
                    <p className="mb-1.5 text-[13px] font-medium text-zinc-400">
                      Recent
                    </p>
                    <div className="flex flex-col">
                      {recentItems.map((item) => {
                        runningIndex += 1;
                        const idx = runningIndex;
                        return (
                          <RecentRow
                            key={item.id}
                            item={item}
                            index={idx}
                            active={activeIndex === idx}
                            query=""
                            onHover={() => setActiveIndex(idx)}
                            onSelect={() => goHref(item.href, item.id)}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                {!isSearching && (
                  <div>
                    <p className="mb-1.5 text-[13px] font-medium text-zinc-400">
                      Quick Actions
                    </p>
                    <div className="flex flex-col">
                      {QUICK_ACTIONS.map((action) => {
                        runningIndex += 1;
                        const idx = runningIndex;
                        return (
                          <QuickActionRow
                            key={action.id}
                            action={action}
                            index={idx}
                            active={activeIndex === idx}
                            onHover={() => setActiveIndex(idx)}
                            onSelect={() => goHref(action.href)}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Keyboard footer */}
              <div className="flex items-center gap-5 border-t border-zinc-100 px-5 py-3.5 dark:border-zinc-800">
                <Hint
                  keys={
                    <>
                      <span className="text-[11px]">↓</span>
                      <span className="text-[11px]">↑</span>
                    </>
                  }
                  label="Move"
                />
                <Hint keys={<span className="text-[11px]">↵</span>} label="Select" />
                <Hint keys={<span className="text-[10px] font-medium">ESC</span>} label="Quit" />
              </div>
            </div>

            {/* Outer shell utilities */}
            <div className="flex items-center justify-between px-2 pt-3 pb-0.5">
              <button
                type="button"
                onClick={() => goHref("/faq")}
                className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[12px] font-medium text-zinc-500 hover:bg-zinc-200/80 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-100"
              >
                Visit FAQ
                <ArrowUpRightIcon className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setRecentIds(loadRecent());
                  setActiveIndex(0);
                  inputRef.current?.focus();
                }}
                className="flex size-8 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-200/80 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-100"
                aria-label="Refresh"
              >
                <RefreshCwIcon className="size-3.5" />
              </button>
            </div>
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function Hint({
  keys,
  label,
}: {
  keys: React.ReactNode;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] text-zinc-400">
      <span className="inline-flex items-center gap-0.5 text-zinc-500">{keys}</span>
      {label}
    </span>
  );
}

function RecentRow({
  item,
  index,
  active,
  query,
  onHover,
  onSelect,
}: {
  item: SearchItem;
  index: number;
  active: boolean;
  query: string;
  onHover: () => void;
  onSelect: () => void;
}) {
  const Icon = item.icon;
  return (
    <button
      type="button"
      data-search-index={index}
      onMouseEnter={onHover}
      onClick={onSelect}
      className={cn(
        "group flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-colors",
        active ? "bg-zinc-100 dark:bg-zinc-800/80" : "hover:bg-zinc-50 dark:hover:bg-zinc-900",
      )}
    >
      <span
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full",
          item.tone ?? "bg-zinc-100 text-zinc-600",
        )}
      >
        <Icon className="size-3.5" />
      </span>
      <span className="min-w-0 flex-1 truncate text-[14px] font-medium text-zinc-900 dark:text-zinc-50">
        <Highlight text={item.label} query={query} />
      </span>
      {item.meta && (
        <span className="shrink-0 text-[13px] text-zinc-400">{item.meta}</span>
      )}
      <span
        className={cn(
          "shrink-0 rounded-md p-1 text-zinc-300 transition-opacity",
          active ? "opacity-100" : "opacity-0 group-hover:opacity-100",
        )}
        onClick={(e) => e.stopPropagation()}
        aria-hidden
      >
        <MoreVerticalIcon className="size-4" />
      </span>
    </button>
  );
}

function QuickActionRow({
  action,
  index,
  active,
  onHover,
  onSelect,
}: {
  action: QuickAction;
  index: number;
  active: boolean;
  onHover: () => void;
  onSelect: () => void;
}) {
  const Icon = action.icon;
  return (
    <button
      type="button"
      data-search-index={index}
      onMouseEnter={onHover}
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-colors",
        active ? "bg-zinc-100 dark:bg-zinc-800/80" : "hover:bg-zinc-50 dark:hover:bg-zinc-900",
      )}
    >
      <span className="flex size-8 shrink-0 items-center justify-center text-zinc-500">
        <Icon className="size-4" />
      </span>
      <span className="min-w-0 flex-1 truncate text-[14px] font-medium text-zinc-900 dark:text-zinc-50">
        {action.label}
      </span>
      <kbd className="shrink-0 font-mono text-[12px] text-zinc-400">
        {action.shortcut}
      </kbd>
    </button>
  );
}

/** Hook: ⌘K / Ctrl+K toggles search. */
export function useGlobalSearchHotkey(
  setOpen: React.Dispatch<React.SetStateAction<boolean>>,
) {
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);
}
