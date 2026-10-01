"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Clock,
  Eye,
  FileText,
  Inbox,
  Layers,
  Loader2,
  Phone,
  RefreshCw,
  Search,
  Send,
  Target,
  User,
} from "lucide-react";
import { useGetAdminCandidateActivityQuery } from "@/domains/admin/api/admin.api";
import type { AdminCandidateActivitySummary } from "@/domains/admin/types/admin.types";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { PaginationControls } from "@/shared/components/pagination-controls";

function statusVariant(status: string) {
  if (status === "SUSPENDED" || status === "DELETED") return "destructive";
  if (status === "ACTIVE" || status === "VERIFIED") return "default";
  return "outline";
}

function formatRelativeTime(isoString: string | null | undefined): string {
  if (!isoString) return "Never";
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(isoString).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return "Recent";
  }
}

export function AdminCandidateActivityTab() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [search, setSearch] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [status, setStatus] = useState("");

  const router = useRouter();

  const query = useMemo(
    () => ({
      page,
      limit,
      ...(search.trim() ? { search: search.trim() } : {}),
      ...(roleTitle.trim() ? { roleTitle: roleTitle.trim() } : {}),
      ...(status ? { status } : {}),
    }),
    [limit, page, roleTitle, search, status],
  );

  const { data, isLoading, isFetching, isError, refetch } =
    useGetAdminCandidateActivityQuery(query);

  const candidates = data?.data ?? [];

  const handleInspect = (userId: string) => {
    router.push(`/admin/candidate-activity/${userId}`);
  };

  return (
    <div className="space-y-4">
      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-border/60 bg-card p-4">
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.5fr_1.2fr_1fr_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9"
              placeholder="Search candidate by name or email..."
            />
          </div>

          <div className="relative">
            <Target className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={roleTitle}
              onChange={(e) => {
                setRoleTitle(e.target.value);
                setPage(1);
              }}
              className="pl-9"
              placeholder="Filter by target query role..."
            />
          </div>

          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="VERIFIED">Verified</option>
            <option value="REGISTERED">Registered</option>
            <option value="SUSPENDED">Suspended</option>
          </select>

          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isFetching}
            className="w-full sm:w-auto shrink-0"
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Candidate Activity Container */}
      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
        {isLoading ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              Loading candidate activity data...
            </p>
          </div>
        ) : isError ? (
          <div className="p-8 text-center">
            <p className="text-sm font-semibold text-destructive">
              Unable to load candidate activity metrics.
            </p>
            <Button
              className="mt-3"
              size="sm"
              variant="outline"
              onClick={() => refetch()}
            >
              Retry
            </Button>
          </div>
        ) : candidates.length === 0 ? (
          <div className="p-10 text-center">
            <Inbox className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm font-medium text-foreground">
              No candidates found matching the filters.
            </p>
            <p className="text-xs text-muted-foreground">
              Try adjusting your search criteria or role title query.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[240px]">Candidate</TableHead>
                    <TableHead className="w-[180px] max-w-[180px]">Target Query Roles</TableHead>
                    <TableHead className="w-[130px] max-w-[130px]">Preferences</TableHead>
                    <TableHead className="w-[120px]">Knowledge Base</TableHead>
                    <TableHead>Funnel Metrics (Totals)</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {candidates.map((c) => (
                    <TableRow
                      key={c.userId}
                      className="cursor-pointer hover:bg-muted/40 transition-colors"
                      onClick={() => handleInspect(c.userId)}
                    >
                      <TableCell>
                        <div className="font-semibold text-foreground">
                          {c.fullName ?? "Unnamed Candidate"}
                        </div>
                        <div className="text-xs text-muted-foreground">{c.email}</div>
                        <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                          <Badge variant={statusVariant(c.status)} className="text-[10px] px-1.5 py-0">
                            {c.status}
                          </Badge>
                          <span>• Active {formatRelativeTime(c.lastActiveAt)}</span>
                        </div>
                      </TableCell>

                      <TableCell className="w-[180px] max-w-[180px]">
                        <div className="flex flex-wrap gap-1 max-w-[180px]">
                          {c.preferredTitles.length > 0 ? (
                            <>
                              {c.preferredTitles.slice(0, 2).map((title) => (
                                <Badge
                                  key={title}
                                  variant="secondary"
                                  className="max-w-[160px] truncate bg-primary/10 text-[11px] font-medium text-primary"
                                  title={title}
                                >
                                  {title}
                                </Badge>
                              ))}
                              {c.preferredTitles.length > 2 && (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] text-muted-foreground px-1 py-0"
                                >
                                  +{c.preferredTitles.length - 2}
                                </Badge>
                              )}
                            </>
                          ) : (
                            <span className="text-xs italic text-muted-foreground">
                              None specified
                            </span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="w-[130px] max-w-[130px]">
                        <div className="space-y-1 text-xs">
                          <div className="truncate" title={c.preferences.workLocations.join(", ") || "Any"}>
                            <span className="text-muted-foreground">Mode: </span>
                            <span className="font-medium text-foreground">
                              {c.preferences.workLocations.length > 0
                                ? c.preferences.workLocations.slice(0, 2).join(", ") + (c.preferences.workLocations.length > 2 ? "…" : "")
                                : "Any"}
                            </span>
                          </div>
                          <div className="truncate" title={c.preferences.preferredSources.join(", ") || "All Sources"}>
                            <span className="text-muted-foreground">Src: </span>
                            <span className="font-medium text-foreground">
                              {c.preferences.preferredSources.length > 0
                                ? c.preferences.preferredSources.slice(0, 1).join(", ") + (c.preferences.preferredSources.length > 1 ? ` (+${c.preferences.preferredSources.length - 1})` : "")
                                : "All"}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-foreground">
                              {c.knowledgeBase.exists ? `v${c.knowledgeBase.version ?? 1}` : "None"}
                            </span>
                            {c.knowledgeBase.isReady && (
                              <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-[9px] text-emerald-600 dark:text-emerald-400 px-1 py-0">
                                Ready
                              </Badge>
                            )}
                          </div>
                          {c.knowledgeBase.profileCompleteness !== null && (
                            <div className="text-[11px] text-muted-foreground">
                              {c.knowledgeBase.profileCompleteness}% complete
                            </div>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-wrap items-center gap-1.5 text-xs">
                          <Badge variant="outline" className="text-[11px] px-2 py-0.5 gap-1" title="Opportunities mapped by engine">
                            <Target className="h-3 w-3 text-muted-foreground" />
                            {c.totals.mapped} mapped
                          </Badge>
                          <Badge variant="outline" className="text-[11px] px-2 py-0.5 bg-primary/5 text-primary border-primary/20 gap-1" title="Jobs released to candidate feed">
                            <Send className="h-3 w-3 text-primary" />
                            {c.totals.reached} reached
                          </Badge>
                          <Badge variant="outline" className="text-[11px] px-2 py-0.5 bg-violet-500/5 text-violet-600 dark:text-violet-400 border-violet-500/20 gap-1" title="Jobs opened/viewed by candidate">
                            <Eye className="h-3 w-3 text-violet-500" />
                            {c.totals.opened} opened
                          </Badge>
                          <Badge variant="outline" className="text-[11px] px-2 py-0.5 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 gap-1" title="Applications recorded">
                            <FileText className="h-3 w-3 text-emerald-500" />
                            {c.totals.applied} applied
                          </Badge>
                          {(c.totals.resumes > 0 || c.totals.coverLetters > 0) && (
                            <Badge variant="outline" className="text-[11px] px-2 py-0.5 bg-amber-500/5 text-amber-600 dark:text-amber-400 border-amber-500/20 gap-1" title="Tailored documents generated">
                              <Layers className="h-3 w-3 text-amber-500" />
                              {c.totals.resumes} CV / {c.totals.coverLetters} Ltr
                            </Badge>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="hover:bg-primary hover:text-primary-foreground transition-colors"
                          onClick={() => handleInspect(c.userId)}
                        >
                          <Eye className="mr-1.5 h-3.5 w-3.5" />
                          Inspect Journey
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile & Tablet Card View */}
            <div className="block lg:hidden divide-y divide-border/60">
              {candidates.map((c) => (
                <div
                  key={c.userId}
                  onClick={() => handleInspect(c.userId)}
                  className="p-4 transition-colors hover:bg-muted/30 cursor-pointer space-y-3"
                >
                  {/* Top Header: Avatar + Name + Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-bold text-primary text-sm">
                        {c.fullName ? c.fullName.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-foreground text-sm leading-tight truncate">
                          {c.fullName ?? "Unnamed Candidate"}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5 truncate">
                          {c.email}
                        </div>
                      </div>
                    </div>
                    <Badge variant={statusVariant(c.status)} className="text-[10px] px-2 py-0.5 shrink-0">
                      {c.status}
                    </Badge>
                  </div>

                  {/* Target Roles */}
                  {c.preferredTitles.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      {c.preferredTitles.slice(0, 3).map((title) => (
                        <Badge
                          key={title}
                          variant="secondary"
                          className="bg-primary/10 text-[10px] font-medium text-primary py-0.5"
                        >
                          {title}
                        </Badge>
                      ))}
                      {c.preferredTitles.length > 3 && (
                        <Badge variant="outline" className="text-[10px] text-muted-foreground py-0.5">
                          +{c.preferredTitles.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Info Strip: Phone + KB status + Last Active */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground border-t border-border/40 pt-2">
                    <div className="flex items-center gap-3">
                      {c.phoneNumber ? (
                        <span className="flex items-center gap-1 font-mono text-foreground font-medium">
                          <Phone className="h-3 w-3 text-emerald-600" />
                          {c.phoneNumber}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-[10px]">No phone</span>
                      )}
                      {c.knowledgeBase.profileCompleteness !== null && (
                        <span>
                          KB: <strong className="text-foreground">{c.knowledgeBase.profileCompleteness}%</strong>
                        </span>
                      )}
                    </div>
                    <span className="flex items-center gap-1 text-[10px]">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      {formatRelativeTime(c.lastActiveAt)}
                    </span>
                  </div>

                  {/* Funnel Metrics Grid */}
                  <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                    <div className="rounded-lg border border-border/60 bg-muted/20 py-1.5 px-1">
                      <div className="text-[10px] text-muted-foreground uppercase font-medium">Mapped</div>
                      <div className="text-xs font-bold text-foreground">{c.totals.mapped}</div>
                    </div>
                    <div className="rounded-lg border border-primary/20 bg-primary/5 py-1.5 px-1">
                      <div className="text-[10px] text-primary uppercase font-medium">Reached</div>
                      <div className="text-xs font-bold text-primary">{c.totals.reached}</div>
                    </div>
                    <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 py-1.5 px-1">
                      <div className="text-[10px] text-emerald-600 uppercase font-medium">Applied</div>
                      <div className="text-xs font-bold text-emerald-600">{c.totals.applied}</div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full h-9 justify-center gap-1.5 text-xs font-medium border-border/80 hover:bg-primary hover:text-primary-foreground transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleInspect(c.userId);
                    }}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Inspect Candidate Cockpit
                    <ArrowRight className="h-3.5 w-3.5 ml-auto" />
                  </Button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <PaginationControls
        page={page}
        limit={limit}
        totalCount={data?.total ?? 0}
        totalPages={data?.totalPages ?? 1}
        onPageChange={setPage}
        onLimitChange={setLimit}
      />
    </div>
  );
}
