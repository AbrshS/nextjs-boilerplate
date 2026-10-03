import * as React from "react";
import Link from "next/link";
import {
  LayoutDashboardIcon,
  UsersIcon,
  CompassIcon,
  LogInIcon,
  ShieldCheckIcon,
} from "lucide-react";
import { Button } from "@/shared/ui/button";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh flex-col bg-canvas-cream text-foreground">
      {/* Top Application Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Brand Mark */}
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-xs tracking-tighter shadow-none">
                FT
              </div>
              <span className="font-bold tracking-tight text-sm text-foreground hidden sm:inline">
                Fanaye Technologies
              </span>
            </Link>

            {/* Navigation Links */}
            <nav className="flex items-center gap-1 sm:gap-2 text-xs font-medium">
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <LayoutDashboardIcon className="size-3.5" />
                <span>Dashboard</span>
              </Link>
              <Link
                href="/admin/users"
                className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <UsersIcon className="size-3.5" />
                <span>Users</span>
              </Link>
              <Link
                href="/onboarding"
                className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <CompassIcon className="size-3.5" />
                <span>Onboarding</span>
              </Link>
            </nav>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-1 rounded-md border border-border/60 bg-surface-ivory px-2 py-1 text-[11px] text-muted-foreground">
              <ShieldCheckIcon className="size-3 text-emerald-600" />
              <span>Node Verified</span>
            </div>

            <Link href="/sign-in">
              <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs shadow-none">
                <LogInIcon className="size-3.5" />
                <span>Sign In</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Viewport */}
      <div className="flex-1">{children}</div>

      {/* Tonal Footing */}
      <footer className="border-t border-border/60 bg-surface-ivory py-4 text-center text-xs text-muted-foreground">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            © 2026 Fanaye Technologies. Hexagonal Architecture & Zero-Shadow Design.
          </span>
          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span>Next.js 16 (React 19)</span>
            <span>·</span>
            <span>NestJS 11</span>
            <span>·</span>
            <span>Prisma 7</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
