"use client";

import * as React from "react";
import {
  DollarSignIcon,
  ArrowUpRightIcon,
  ClockIcon,
  ShieldCheckIcon,
  SparklesIcon,
  PlusIcon,
  FileTextIcon,
} from "lucide-react";
import { MetricCard } from "./metric-card";
import { CashflowChart } from "./cashflow-chart";
import { TransactionsTable } from "./transactions-table";
import { MembershipQR } from "@/shared/components/membership-qr";
import { ShareButton } from "@/shared/components/share-button";
import { GlobalSearchModal, GlobalSearchTrigger } from "@/shared/components/global-search-modal";
import { Button } from "@/shared/ui/button";

export function DashboardView() {
  const [searchOpen, setSearchOpen] = React.useState(false);

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 max-w-7xl mx-auto w-full">
      {/* Top Command Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Financial Command Center
            </h1>
            <span className="hidden sm:inline-flex rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-600 border border-emerald-500/20">
              Live Ledger
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Double-entry accounting, Hexagonal persistence & multi-device telemetry
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <GlobalSearchTrigger onClick={() => setSearchOpen(true)} />
          <ShareButton
            title="Fanaye Financial Report"
            text="Review verified ledger transactions and cashflow metrics."
          />
          <Button
            size="sm"
            onClick={() => alert("Opening transaction voucher modal...")}
            className="gap-1.5 shadow-none text-xs"
          >
            <PlusIcon className="size-3.5" />
            <span>New Transaction</span>
          </Button>
        </div>
      </div>

      {/* 4 Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Ledger Revenue"
          value="$128,450.00"
          change="+14.2%"
          changeType="positive"
          subtitle="vs previous fiscal cycle"
          sparklineData={[14, 18, 22, 19, 27, 31, 35, 42]}
          icon={DollarSignIcon}
        />
        <MetricCard
          title="Net Cashflow Inflow"
          value="+$42,800.00"
          change="+8.5%"
          changeType="positive"
          subtitle="Operating balance net"
          sparklineData={[8, 12, 10, 15, 14, 20, 18, 25]}
          icon={ArrowUpRightIcon}
        />
        <MetricCard
          title="Pending Disbursements"
          value="$19,850.00"
          change="3 Pending"
          changeType="negative"
          subtitle="Requires multi-sig approval"
          sparklineData={[25, 22, 28, 20, 18, 22, 16, 12]}
          icon={ClockIcon}
        />
        <MetricCard
          title="Ledger Integrity"
          value="99.98%"
          change="Verified"
          changeType="positive"
          subtitle="Zero-knowledge hash audit"
          sparklineData={[99, 99.5, 99.8, 99.9, 99.95, 99.98]}
          icon={ShieldCheckIcon}
        />
      </div>

      {/* Mid Section: Cashflow Chart + Membership QR Pass */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
        <CashflowChart />
        <MembershipQR
          memberId="FT-CORP-99420"
          memberName="Abinet Sisay (Admin)"
          membershipTier="Enterprise"
          status="ACTIVE"
          expiresAt="2027-12-31"
        />
      </div>

      {/* Recent Transactions Table */}
      <TransactionsTable />

      {/* Global Spotlight Search Modal */}
      <GlobalSearchModal
        open={searchOpen}
        onOpenChange={setSearchOpen}
        onNavigate={(path) => {
          if (path.startsWith("/")) window.location.href = path;
        }}
      />
    </div>
  );
}
