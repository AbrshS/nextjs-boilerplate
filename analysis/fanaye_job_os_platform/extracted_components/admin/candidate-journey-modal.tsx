"use client";

import { useMemo } from "react";
import {
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  FileText,
  HelpCircle,
  Inbox,
  Layers,
  Loader2,
  Mail,
  MapPin,
  Send,
  Sparkles,
  Target,
  User,
  X,
} from "lucide-react";
import { useGetAdminCandidateJourneyQuery } from "@/domains/admin/api/admin.api";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { formatRoleLabel } from "@/shared/utils/format-role";

interface CandidateJourneyModalProps {
  userId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatDateLabel(dateString: string): string {
  try {
    const todayStr = new Date().toISOString().split("T")[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    if (dateString === todayStr) {
      return "Today — " + new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    }
    if (dateString === yesterdayStr) {
      return "Yesterday — " + new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    }
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}

function formatTime(isoString: string | null | undefined): string {
  if (!isoString) return "";
  try {
    return new Date(isoString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export function CandidateJourneyModal({
  userId,
  open,
  onOpenChange,
}: CandidateJourneyModalProps) {
  const { data, isLoading, isError, refetch } =
    useGetAdminCandidateJourneyQuery(userId ?? "", {
      skip: !userId || !open,
    });

  const candidate = data?.candidate;
  const timeline = useMemo(() => data?.timeline ?? [], [data?.timeline]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="max-h-[90vh] max-w-4xl overflow-y-auto p-0 sm:max-w-4xl">
        <DialogHeader className="sticky top-0 z-20 border-b border-border/80 bg-background/95 px-6 py-4 backdrop-blur">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold">
                  {candidate?.fullName ?? "Candidate Journey & Activity"}
                </DialogTitle>
                <p className="text-xs text-muted-foreground">
                  {candidate?.email ?? (userId ? `ID: ${userId}` : "")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {candidate?.status && (
                <Badge
                  variant={
                    candidate.status === "ACTIVE"
                      ? "default"
                      : candidate.status === "SUSPENDED"
                        ? "destructive"
                        : "secondary"
                  }
                >
                  {candidate.status}
                </Badge>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={() => onOpenChange(false)}
                title="Close"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </div>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              Loading candidate journey & activity timeline...
            </p>
          </div>
        ) : isError || !candidate ? (
          <div className="p-8 text-center">
            <p className="text-sm font-semibold text-destructive">
              Unable to load candidate journey details.
            </p>
            <Button
              className="mt-3"
              size="sm"
              variant="outline"
              onClick={() => refetch()}
            >
              Try Again
            </Button>
          </div>
        ) : (
          <div className="space-y-6 p-6">
            {/* Top Identity & Snapshot Card */}
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Preferences & Query Roles Card */}
              <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <Target className="h-3.5 w-3.5 text-primary" />
                    Target Query Roles & Preferences
                  </span>
                  {candidate.preferences.confirmedAt && (
                    <span className="text-[10px] text-muted-foreground">
                      Confirmed {new Date(candidate.preferences.confirmedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-xs text-muted-foreground">Target Roles:</span>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {candidate.preferredTitles.length > 0 ? (
                        candidate.preferredTitles.map((role) => (
                          <Badge
                            key={role}
                            variant="secondary"
                            className="bg-primary/10 font-medium text-primary hover:bg-primary/20"
                          >
                            {role}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs italic text-muted-foreground">
                          No specific roles selected
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Work Mode:</span>
                      <p className="font-medium text-foreground">
                        {candidate.preferences.workLocations.length > 0
                          ? candidate.preferences.workLocations.join(", ")
                          : "Any"}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Employment:</span>
                      <p className="font-medium text-foreground">
                        {candidate.preferences.employmentTypes.length > 0
                          ? candidate.preferences.employmentTypes.map((e) => formatRoleLabel(e)).join(", ")
                          : "Any"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <span className="text-xs text-muted-foreground">Job Sources:</span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {candidate.preferences.preferredSources.length > 0 ? (
                        candidate.preferences.preferredSources.map((source) => (
                          <Badge key={source} variant="outline" className="text-[10px]">
                            {source}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-[11px] text-muted-foreground">
                          Unrestricted (All sources enabled)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Knowledge Base & Overview Card */}
              <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    Knowledge Base & Funnel Totals
                  </span>
                  {candidate.knowledgeBase.isReady ? (
                    <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-[10px] text-emerald-600 dark:text-emerald-400">
                      KB Ready
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] text-muted-foreground">
                      Pending
                    </Badge>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">KB Version:</span>
                    <span className="font-semibold text-foreground">
                      {candidate.knowledgeBase.exists
                        ? `v${candidate.knowledgeBase.version ?? 1}`
                        : "Not Created"}
                    </span>
                  </div>

                  <div className="text-xs">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Profile Completeness:</span>
                      <span className="font-medium text-foreground">
                        {candidate.knowledgeBase.profileCompleteness ?? 0}%
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-300"
                        style={{
                          width: `${Math.min(candidate.knowledgeBase.profileCompleteness ?? 0, 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Funnel Overview Counters */}
                  <div className="grid grid-cols-3 gap-2 rounded-xl bg-muted/40 p-2.5 text-center text-xs">
                    <div>
                      <span className="text-[10px] uppercase text-muted-foreground">Mapped</span>
                      <p className="text-sm font-bold text-foreground">{candidate.totals.mapped}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-muted-foreground">Reached</span>
                      <p className="text-sm font-bold text-foreground">{candidate.totals.reached}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-muted-foreground">Opened</span>
                      <p className="text-sm font-bold text-foreground">{candidate.totals.opened}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-muted-foreground">Applied</span>
                      <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{candidate.totals.applied}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-muted-foreground">CVs</span>
                      <p className="text-sm font-bold text-foreground">{candidate.totals.resumes}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-muted-foreground">Letters</span>
                      <p className="text-sm font-bold text-foreground">{candidate.totals.coverLetters}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Date-by-Date Daily Timeline Breakdown */}
            <div>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                    Chronological Activity Timeline
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Divided by day to inspect when jobs reached the candidate, when they opened them, and their applications.
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {timeline.length} {timeline.length === 1 ? "Active Day" : "Active Days"}
                </Badge>
              </div>

              {timeline.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border/80 p-8 text-center">
                  <Inbox className="mx-auto mb-2 h-7 w-7 text-muted-foreground/50" />
                  <p className="text-sm font-medium text-foreground">No historical activity recorded yet</p>
                  <p className="text-xs text-muted-foreground">
                    This candidate has not had matching runs or session events logged yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {timeline.map((day) => (
                    <div
                      key={day.date}
                      className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm transition-all"
                    >
                      {/* Day Header & Daily KPI Pills */}
                      <div className="flex flex-col gap-2 border-b border-border/50 pb-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-primary" />
                          <span className="font-semibold text-foreground">
                            {formatDateLabel(day.date)}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 text-xs">
                          {day.summary.mapped > 0 && (
                            <Badge variant="outline" className="bg-muted/30">
                              🎯 {day.summary.mapped} Mapped
                            </Badge>
                          )}
                          {day.summary.reached > 0 && (
                            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                              📬 {day.summary.reached} Reached Feed
                            </Badge>
                          )}
                          {day.summary.opened > 0 && (
                            <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
                              👁️ {day.summary.opened} Opened
                            </Badge>
                          )}
                          {day.summary.applied > 0 && (
                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                              📝 {day.summary.applied} Applied
                            </Badge>
                          )}
                          {day.summary.resumesGenerated > 0 && (
                            <Badge variant="outline" className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20">
                              📄 {day.summary.resumesGenerated} CV
                            </Badge>
                          )}
                          {day.summary.coverLettersGenerated > 0 && (
                            <Badge variant="outline" className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20">
                              ✉️ {day.summary.coverLettersGenerated} Cover Letter
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Day Granular Events */}
                      <div className="mt-3 space-y-3">
                        {/* 1. Jobs Reached (Released into Feed) */}
                        {day.jobsReached.length > 0 && (
                          <div>
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                              Jobs Reached Candidate Feed ({day.jobsReached.length})
                            </span>
                            <div className="mt-1.5 divide-y divide-border/40 rounded-xl border border-border/50 bg-muted/20">
                              {day.jobsReached.map((job) => (
                                <div
                                  key={job.opportunityId}
                                  className="flex flex-col gap-1 p-2.5 sm:flex-row sm:items-center sm:justify-between text-xs"
                                >
                                  <div>
                                    <span className="font-semibold text-foreground">
                                      {job.jobTitle}
                                    </span>
                                    <span className="ml-2 text-muted-foreground">
                                      {job.company ? `• ${job.company}` : ""}
                                    </span>
                                    {job.workLocation && (
                                      <span className="ml-2 text-[10px] text-muted-foreground">
                                        ({job.workLocation})
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {job.score !== null && (
                                      <Badge variant="secondary" className="text-[10px]">
                                        Match {Math.round(job.score)}%
                                      </Badge>
                                    )}
                                    {job.firstViewedAt ? (
                                      <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-[10px] text-emerald-600 dark:text-emerald-400">
                                        <Eye className="mr-1 h-2.5 w-2.5" /> Opened at {formatTime(job.firstViewedAt)}
                                      </Badge>
                                    ) : (
                                      <span className="text-[10px] text-muted-foreground">
                                        Not opened yet
                                      </span>
                                    )}
                                    <span className="text-[10px] text-muted-foreground">
                                      {formatTime(job.releasedAt)}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 2. Applications Submitted / Clicked */}
                        {day.applications.length > 0 && (
                          <div>
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                              Applications Recorded ({day.applications.length})
                            </span>
                            <div className="mt-1.5 divide-y divide-border/40 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
                              {day.applications.map((app) => (
                                <div
                                  key={app.applicationId}
                                  className="flex items-center justify-between p-2.5 text-xs"
                                >
                                  <div>
                                    <span className="font-semibold text-foreground">
                                      {app.jobTitle}
                                    </span>
                                    {app.company && (
                                      <span className="ml-2 text-muted-foreground">
                                        • {app.company}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="default" className="bg-emerald-600 text-[10px] text-white">
                                      {app.status}
                                    </Badge>
                                    {app.applyUrl && (
                                      <a
                                        href={app.applyUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary hover:underline"
                                      >
                                        <ExternalLink className="h-3 w-3" />
                                      </a>
                                    )}
                                    <span className="text-[10px] text-muted-foreground">
                                      {formatTime(app.appliedAt ?? app.createdAt)}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 3. Generated Resumes & Cover Letters */}
                        {day.documents.length > 0 && (
                          <div>
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                              AI Generated Documents ({day.documents.length})
                            </span>
                            <div className="mt-1.5 divide-y divide-border/40 rounded-xl border border-indigo-500/30 bg-indigo-500/5">
                              {day.documents.map((doc) => (
                                <div
                                  key={doc.id}
                                  className="flex items-center justify-between p-2.5 text-xs"
                                >
                                  <div className="flex items-center gap-2">
                                    {doc.type === "RESUME" ? (
                                      <FileText className="h-3.5 w-3.5 text-indigo-500" />
                                    ) : (
                                      <Mail className="h-3.5 w-3.5 text-purple-500" />
                                    )}
                                    <span className="font-semibold text-foreground">
                                      {doc.title ?? (doc.type === "RESUME" ? "Tailored CV" : "Cover Letter")}
                                    </span>
                                    {doc.jobTitle && (
                                      <span className="text-muted-foreground">
                                        for {doc.jobTitle}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge
                                      variant="outline"
                                      className={
                                        doc.status === "READY"
                                          ? "border-emerald-500/30 bg-emerald-500/10 text-[10px] text-emerald-600 dark:text-emerald-400"
                                          : "text-[10px]"
                                      }
                                    >
                                      {doc.status}
                                    </Badge>
                                    <span className="text-[10px] text-muted-foreground">
                                      {formatTime(doc.generatedAt ?? doc.createdAt)}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
