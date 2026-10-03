import React from "react";
import { DashboardView } from "@/domains/dashboard/dashboard-view";

export const metadata = {
  title: "Financial Command Center · Fanaye Enterprise",
  description: "Real-time ledger overview, cashflow dynamics, and transaction history.",
};

export default function DashboardPage() {
  return (
    <main className="min-h-svh bg-canvas-cream">
      <DashboardView />
    </main>
  );
}
