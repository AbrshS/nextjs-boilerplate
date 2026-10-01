"use client";

import { ReactNode } from "react";
import { Link } from "@/i18n/routing";
import { ArrowLeft, ShieldAlert, ShieldX } from "lucide-react";
import { useAbility } from "@/shared/providers/ability-provider";
import { PermissionAction, PermissionSubject } from "@/shared/lib/casl/ability";

interface AdminPermissionGuardProps {
  action?: PermissionAction;
  subject: PermissionSubject;
  children: ReactNode;
}

export function AdminPermissionGuard({
  action = "read",
  subject,
  children,
}: AdminPermissionGuardProps) {
  const ability = useAbility();
  const allowed = ability.can(action, subject);

  if (!allowed) {
    return (
      <div className="flex h-full min-h-[70vh] flex-col items-center justify-center p-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mb-4">
          <ShieldX className="h-8 w-8" />
        </div>

        <div className="max-w-md space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-destructive/10 text-destructive border border-destructive/20">
            <ShieldAlert className="h-3.5 w-3.5" /> 403 Access Forbidden
          </span>

          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Unauthorized Page Access
          </h2>

          <p className="text-sm text-muted-foreground leading-relaxed">
            Your admin account does not have permission to view or manage this module (<code className="font-mono font-semibold text-foreground">{subject}</code>).
            Contact your Super Admin to adjust your role access permissions.
          </p>
        </div>

        <div className="mt-6 flex items-center justify-center">
          <Link
            href="/admin"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors whitespace-nowrap"
          >
            <ArrowLeft className="h-4 w-4 shrink-0" />
            <span>Return to Admin Overview</span>
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
