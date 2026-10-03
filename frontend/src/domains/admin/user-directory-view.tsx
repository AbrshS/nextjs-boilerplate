"use client";

import * as React from "react";
import {
  UsersIcon,
  SearchIcon,
  UserCheckIcon,
  ShieldAlertIcon,
  SmartphoneIcon,
  LockIcon,
  UnlockIcon,
  Trash2Icon,
  PlusIcon,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/shared/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/shared/ui/table";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { cn } from "@/shared/utils/cn";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "USER";
  status: "ACTIVE" | "INACTIVE" | "BLOCKED";
  twoFactorEnabled: boolean;
  deviceCount: number;
  lastLoginAt: string;
};

const INITIAL_USERS: AdminUser[] = [
  {
    id: "usr-admin",
    name: "Abinet Sisay (Super Admin)",
    email: "admin@fanaye.com",
    role: "ADMIN",
    status: "ACTIVE",
    twoFactorEnabled: true,
    deviceCount: 2,
    lastLoginAt: "2026-10-03 14:15",
  },
  {
    id: "usr-dev",
    name: "Lead Platform Developer",
    email: "dev@fanaye.com",
    role: "USER",
    status: "ACTIVE",
    twoFactorEnabled: true,
    deviceCount: 1,
    lastLoginAt: "2026-10-03 12:30",
  },
  {
    id: "usr-locked",
    name: "Suspended Operator",
    email: "locked@fanaye.com",
    role: "USER",
    status: "BLOCKED",
    twoFactorEnabled: false,
    deviceCount: 0,
    lastLoginAt: "2026-09-29 08:12",
  },
];

export function UserDirectoryView() {
  const [users, setUsers] = React.useState<AdminUser[]>(INITIAL_USERS);
  const [query, setQuery] = React.useState("");

  const filteredUsers = React.useMemo(() => {
    const lower = query.toLowerCase();
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(lower) ||
        u.email.toLowerCase().includes(lower) ||
        u.role.toLowerCase().includes(lower)
    );
  }, [users, query]);

  const toggleUserLock = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const newStatus = u.status === "BLOCKED" ? "ACTIVE" : "BLOCKED";
          return { ...u, status: newStatus };
        }
        return u;
      })
    );
  };

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              User Directory & IAM Management
            </h1>
            <Badge variant="outline" className="font-mono text-xs">
              {users.length} Enrolled Users
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Role-based access control, session governance & hardware key revocation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => alert("Opening invite operator modal...")}
            className="gap-1.5 shadow-none text-xs"
          >
            <PlusIcon className="size-3.5" />
            Invite Member
          </Button>
        </div>
      </div>

      <Card className="border-border/70 bg-card shadow-none">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-border/60 bg-surface-ivory gap-3">
          <div className="space-y-0.5">
            <CardTitle className="text-base font-semibold text-foreground">
              Corporate Accounts
            </CardTitle>
            <CardDescription className="text-xs">
              Audit identities, Argon2id credentials, and active device sessions
            </CardDescription>
          </div>

          <div className="relative">
            <SearchIcon className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search user, email..."
              className="h-8 pl-8 text-xs w-48 sm:w-64 bg-card"
            />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User / Identity</TableHead>
                <TableHead className="w-[100px]">Role</TableHead>
                <TableHead className="w-[110px]">Status</TableHead>
                <TableHead className="w-[100px]">2FA TOTP</TableHead>
                <TableHead className="w-[100px]">Devices</TableHead>
                <TableHead className="hidden md:table-cell w-[140px]">Last Seen</TableHead>
                <TableHead className="text-right w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => {
                const isBlocked = user.status === "BLOCKED";

                return (
                  <TableRow key={user.id} className="hover:bg-muted/40">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-xs text-foreground">
                          {user.name}
                        </span>
                        <span className="font-mono text-[11px] text-muted-foreground">
                          {user.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={user.role === "ADMIN" ? "default" : "secondary"}
                        className="font-mono text-[10px]"
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={isBlocked ? "destructive" : "secondary"}
                        className={cn(
                          "font-mono text-[10px]",
                          !isBlocked && "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                        )}
                      >
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.twoFactorEnabled ? (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                          <UserCheckIcon className="size-3.5" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <ShieldAlertIcon className="size-3.5 text-amber-500" />
                          Disabled
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-xs font-mono text-muted-foreground">
                        <SmartphoneIcon className="size-3.5" />
                        <span>{user.deviceCount}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell font-mono text-xs text-muted-foreground">
                      {user.lastLoginAt}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="outline"
                          size="icon-sm"
                          onClick={() => toggleUserLock(user.id)}
                          title={isBlocked ? "Unlock Account" : "Lock Account"}
                          className="size-7"
                        >
                          {isBlocked ? (
                            <UnlockIcon className="size-3.5 text-emerald-600" />
                          ) : (
                            <LockIcon className="size-3.5 text-destructive" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>

        <CardFooter className="flex items-center justify-between border-t border-border/60 bg-surface-ivory py-3 px-4 text-xs text-muted-foreground">
          <span>Enterprise Session Policies Active</span>
          <span className="font-mono text-[11px]">HIBP Fail-Open Guardrails</span>
        </CardFooter>
      </Card>
    </div>
  );
}
