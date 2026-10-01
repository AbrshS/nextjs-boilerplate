"use client";

import { type ReactNode } from "react";
import { can } from "@/core/permissions/can";
import { Role } from "@/core/permissions/roles";
import { useAppSelector } from "@/store/hooks";

interface PermissionGateProps {
  required: Role;
  children: ReactNode;
  fallback?: ReactNode;
}

export function PermissionGate({ required, children, fallback = null }: PermissionGateProps) {
  const role = useAppSelector((state) => state.auth.user?.role as Role | undefined);
  const hasAccess = role ? can(role, required) : false;

  if (!hasAccess) return <>{fallback}</>;
  return <>{children}</>;
}
