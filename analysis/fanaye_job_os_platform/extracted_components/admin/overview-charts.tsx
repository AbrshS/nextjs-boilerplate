"use client";

import type { AdminDashboard } from "@/domains/admin/types/admin.types";

export function OverviewCharts({ stats }: { stats: AdminDashboard }) {
  return (
    <div className="mt-6 rounded-xl border bg-card p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-foreground">Historical trends unavailable</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        The admin dashboard backend currently returns point-in-time operational counts only. This component
        intentionally avoids generating fake trend charts.
      </p>
      <div className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
        <div className="rounded-lg bg-muted/40 p-3">
          <div className="text-muted-foreground">Users</div>
          <div className="text-xl font-bold text-foreground">{stats.users.total.toLocaleString()}</div>
        </div>
        <div className="rounded-lg bg-muted/40 p-3">
          <div className="text-muted-foreground">Jobs</div>
          <div className="text-xl font-bold text-foreground">{stats.jobs.total.toLocaleString()}</div>
        </div>
        <div className="rounded-lg bg-muted/40 p-3">
          <div className="text-muted-foreground">Alignments</div>
          <div className="text-xl font-bold text-foreground">
            {stats.matching.alignmentRecords.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}
