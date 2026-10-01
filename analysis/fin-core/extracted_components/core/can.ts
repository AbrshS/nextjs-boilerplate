import { Role, ROLE_HIERARCHY } from "./roles";
import { Permission, type PermissionValue } from "./permissions";

const ROLE_PERMISSIONS: Record<Role, readonly PermissionValue[]> = {
  [Role.OWNER]: [
    Permission.users.manage,
    Permission.users.invite,
    Permission.settings.edit,
    Permission.settings.view,
    Permission.transactions.create,
    Permission.transactions.edit,
    Permission.transactions.delete,
    Permission.transactions.view,
    Permission.ledger.post,
    Permission.ledger.view,
    Permission.ledger.adjust,
    Permission.payroll.draft,
    Permission.payroll.approve,
    Permission.payroll.view,
    Permission.reports.view,
    Permission.reports.export,
    Permission.dashboard.view,
    Permission.expenses.submit,
    Permission.expenses.view,
    Permission.expenses.create,
    Permission.audit.view,
  ],
  [Role.ACCOUNTANT]: [
    Permission.transactions.create,
    Permission.transactions.edit,
    Permission.transactions.delete,
    Permission.transactions.view,
    Permission.ledger.post,
    Permission.ledger.view,
    Permission.ledger.adjust,
    Permission.payroll.draft,
    Permission.payroll.view,
    Permission.reports.view,
    Permission.reports.export,
    Permission.dashboard.view,
    Permission.settings.view,
    Permission.expenses.view,
    Permission.expenses.create,
  ],
  [Role.MANAGER]: [
    Permission.dashboard.view,
    Permission.reports.view,
    Permission.expenses.submit,
    Permission.expenses.view,
    Permission.transactions.view,
  ],
  [Role.VIEWER]: [
    Permission.dashboard.view,
    Permission.reports.view,
    Permission.transactions.view,
    Permission.expenses.view,
  ],
};

export function can(userRole: Role, requiredRole: Role): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

export function canAny(userRoles: Role[], requiredRole: Role): boolean {
  return userRoles.some((role) => can(role, requiredRole));
}

export function hasPermission(
  role: Role | undefined,
  permission: PermissionValue,
  isPlatformAdmin = false
): boolean {
  if (isPlatformAdmin) return true;
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function hasAnyPermission(
  role: Role | undefined,
  permissions: PermissionValue[],
  isPlatformAdmin = false
): boolean {
  return permissions.some((p) => hasPermission(role, p, isPlatformAdmin));
}
