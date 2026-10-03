"use client";

import * as React from "react";
import {
  SearchIcon,
  LayoutDashboardIcon,
  ArrowUpDownIcon,
  UsersIcon,
  ShieldCheckIcon,
  SettingsIcon,
  PlusCircleIcon,
  FileSpreadsheetIcon,
  MoonIcon,
  XIcon,
} from "lucide-react";
import { Dialog, DialogContent } from "@/shared/ui/dialog";
import { cn } from "@/shared/utils/cn";

export type SearchItem = {
  id: string;
  category: "Navigation" | "Quick Actions" | "System";
  label: string;
  sublabel?: string;
  icon: React.ComponentType<{ className?: string }>;
  onSelect: () => void;
};

interface GlobalSearchModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onNavigate?: (path: string) => void;
}

export function GlobalSearchModal({
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  onNavigate,
}: GlobalSearchModalProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = setControlledOpen || setInternalOpen;

  // Keyboard shortcut: Cmd+K / Ctrl+K
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(!open);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, setOpen]);

  const items: SearchItem[] = React.useMemo(
    () => [
      {
        id: "nav-dashboard",
        category: "Navigation",
        label: "Financial Dashboard",
        sublabel: "Overview of revenue, cashflow, and transactions",
        icon: LayoutDashboardIcon,
        onSelect: () => {
          onNavigate?.("/dashboard");
          setOpen(false);
        },
      },
      {
        id: "nav-transactions",
        category: "Navigation",
        label: "Transactions Ledger",
        sublabel: "Audit history and categorized financial records",
        icon: ArrowUpDownIcon,
        onSelect: () => {
          onNavigate?.("/dashboard/transactions");
          setOpen(false);
        },
      },
      {
        id: "nav-users",
        category: "Navigation",
        label: "User Management",
        sublabel: "Roles, permissions, and session monitoring",
        icon: UsersIcon,
        onSelect: () => {
          onNavigate?.("/admin/users");
          setOpen(false);
        },
      },
      {
        id: "nav-audit",
        category: "Navigation",
        label: "Security Audit Logs",
        sublabel: "Device sessions, HIBP verification events",
        icon: ShieldCheckIcon,
        onSelect: () => {
          onNavigate?.("/admin/audit-logs");
          setOpen(false);
        },
      },
      {
        id: "nav-settings",
        category: "Navigation",
        label: "Account Settings",
        sublabel: "Profile, 2FA TOTP, WebAuthn Passkeys",
        icon: SettingsIcon,
        onSelect: () => {
          onNavigate?.("/settings");
          setOpen(false);
        },
      },
      {
        id: "act-create-tx",
        category: "Quick Actions",
        label: "Record New Transaction",
        sublabel: "Post a credit or debit entry to the ledger",
        icon: PlusCircleIcon,
        onSelect: () => {
          onNavigate?.("/dashboard/transactions?action=create");
          setOpen(false);
        },
      },
      {
        id: "act-export",
        category: "Quick Actions",
        label: "Export Ledger CSV",
        sublabel: "Download formatted financial statement",
        icon: FileSpreadsheetIcon,
        onSelect: () => {
          alert("Exporting CSV report...");
          setOpen(false);
        },
      },
      {
        id: "act-theme",
        category: "System",
        label: "Toggle Dark / Light Theme",
        sublabel: "Switch visual color mode",
        icon: MoonIcon,
        onSelect: () => {
          document.documentElement.classList.toggle("dark");
          setOpen(false);
        },
      },
    ],
    [onNavigate, setOpen]
  );

  const filteredItems = React.useMemo(() => {
    if (!query.trim()) return items;
    const lower = query.toLowerCase();
    return items.filter(
      (item) =>
        item.label.toLowerCase().includes(lower) ||
        (item.sublabel && item.sublabel.toLowerCase().includes(lower)) ||
        item.category.toLowerCase().includes(lower)
    );
  }, [items, query]);

  // Reset selected index when search changes
  React.useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Arrow key navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev === 0 ? filteredItems.length - 1 : prev - 1
      );
    } else if (e.key === "Enter" && filteredItems[selectedIndex]) {
      e.preventDefault();
      filteredItems[selectedIndex].onSelect();
    }
  };

  const categories = Array.from(new Set(filteredItems.map((i) => i.category)));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl overflow-hidden p-0 gap-0 border border-border/80 bg-card shadow-none">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 border-b border-border/60 bg-surface-ivory px-4 py-3.5">
          <SearchIcon className="size-4 shrink-0 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search commands, ledger, settings, or views... (Esc to exit)"
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            autoFocus
          />
          {query ? (
            <button
              onClick={() => setQuery("")}
              className="text-muted-foreground hover:text-foreground p-0.5 rounded"
            >
              <XIcon className="size-3.5" />
            </button>
          ) : (
            <kbd className="pointer-events-none rounded border border-border/60 bg-card px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
              ESC
            </kbd>
          )}
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No matching commands or pages found for &ldquo;{query}&rdquo;.
            </div>
          ) : (
            categories.map((category) => {
              const catItems = filteredItems.filter((i) => i.category === category);
              return (
                <div key={category} className="mb-2 last:mb-0">
                  <div className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {category}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    {catItems.map((item) => {
                      const itemIndex = filteredItems.findIndex(
                        (fi) => fi.id === item.id
                      );
                      const isSelected = itemIndex === selectedIndex;
                      const Icon = item.icon;

                      return (
                        <button
                          key={item.id}
                          onClick={item.onSelect}
                          onMouseEnter={() => setSelectedIndex(itemIndex)}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                            isSelected
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-muted text-foreground"
                          )}
                        >
                          <Icon
                            className={cn(
                              "size-4 shrink-0",
                              isSelected
                                ? "text-primary-foreground"
                                : "text-muted-foreground"
                            )}
                          />
                          <div className="flex flex-1 flex-col truncate">
                            <span className="font-medium truncate leading-snug">
                              {item.label}
                            </span>
                            {item.sublabel && (
                              <span
                                className={cn(
                                  "text-xs truncate",
                                  isSelected
                                    ? "text-primary-foreground/80"
                                    : "text-muted-foreground"
                                )}
                              >
                                {item.sublabel}
                              </span>
                            )}
                          </div>
                          {isSelected && (
                            <kbd className="text-[10px] font-mono opacity-80">
                              ↵ Enter
                            </kbd>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info bar */}
        <div className="flex items-center justify-between border-t border-border/60 bg-surface-ivory px-4 py-2 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>Navigation:</span>
            <kbd className="rounded border border-border/60 bg-card px-1 py-0.5 font-mono text-[10px]">
              ↑
            </kbd>
            <kbd className="rounded border border-border/60 bg-card px-1 py-0.5 font-mono text-[10px]">
              ↓
            </kbd>
            <span className="ml-1">Select:</span>
            <kbd className="rounded border border-border/60 bg-card px-1 py-0.5 font-mono text-[10px]">
              ↵
            </kbd>
          </div>
          <div>
            <span>Fanaye Enterprise Spotlight</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function GlobalSearchTrigger({
  onClick,
  className,
}: {
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex h-9 w-full max-w-sm items-center justify-between rounded-lg border border-border/80 bg-card px-3 text-xs text-muted-foreground hover:border-foreground/30 hover:text-foreground transition-colors",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <SearchIcon className="size-3.5" />
        <span>Search anything...</span>
      </div>
      <kbd className="pointer-events-none rounded border border-border/60 bg-surface-ivory px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
        ⌘K
      </kbd>
    </button>
  );
}
