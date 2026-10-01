"use client";

import { AlertTriangleIcon, InfoIcon, OctagonAlertIcon } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import type { DashboardAlert } from "../types/dashboard-api.types";

const SEVERITY = {
  critical: {
    Icon: OctagonAlertIcon,
    className: "border-[#f07167]/40 bg-[#f07167]/10 text-[#b33a32]",
  },
  warning: {
    Icon: AlertTriangleIcon,
    className: "border-[#f0a04b]/40 bg-[#f0a04b]/10 text-[#9a5f10]",
  },
  info: {
    Icon: InfoIcon,
    className: "border-[#0068f9]/30 bg-[#0068f9]/8 text-[#024bb1]",
  },
} as const;

export function DashboardAlerts({ alerts }: { alerts: DashboardAlert[] }) {
  if (!alerts.length) return null;

  return (
    <div className="flex flex-col gap-2">
      {alerts.map((alert) => {
        const { Icon, className } = SEVERITY[alert.severity];
        return (
          <div
            key={alert.id}
            className={cn(
              "flex gap-3 rounded-[var(--radius-cards)] border px-4 py-3",
              className
            )}
          >
            <Icon className="mt-0.5 size-4 shrink-0" strokeWidth={2} />
            <div className="min-w-0">
              <p className="text-[13px] font-semibold">{alert.title}</p>
              <p className="mt-0.5 text-[12px] leading-relaxed opacity-90">
                {alert.message}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
