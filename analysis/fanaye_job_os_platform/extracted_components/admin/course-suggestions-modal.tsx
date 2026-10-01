"use client";

import { useState } from "react";
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  Clock,
  ExternalLink,
  GraduationCap,
  Loader2,
  RefreshCw,
  Video,
  FileCode,
  Compass,
} from "lucide-react";
import {
  useGenerateCourseSuggestionsMutation,
  useGetAdminCourseSuggestionQuery,
} from "@/domains/admin/api/admin.api";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import toast from "react-hot-toast";

interface CourseSuggestionsModalProps {
  alignmentId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRegenerated?: () => void;
}

function getPlatformBadgeClass(platform: string): string {
  const p = platform.toLowerCase();
  if (p.includes("youtube")) {
    return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900";
  }
  if (p.includes("freecodecamp")) {
    return "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900";
  }
  if (p.includes("official") || p.includes("docs")) {
    return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900";
  }
  if (p.includes("github") || p.includes("roadmap")) {
    return "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900";
  }
  return "bg-muted text-muted-foreground border-border";
}

function getResourceTypeIcon(type: string) {
  switch (type) {
    case "VIDEO_COURSE":
      return <Video className="h-3.5 w-3.5" />;
    case "OFFICIAL_DOCS":
    case "GUIDE":
      return <FileCode className="h-3.5 w-3.5" />;
    case "INTERACTIVE_TUTORIAL":
      return <Compass className="h-3.5 w-3.5" />;
    default:
      return <BookOpen className="h-3.5 w-3.5" />;
  }
}

function formatResourceType(type: string): string {
  switch (type) {
    case "VIDEO_COURSE":
      return "Video Course";
    case "OFFICIAL_DOCS":
      return "Official Documentation";
    case "INTERACTIVE_TUTORIAL":
      return "Interactive Tutorial";
    case "GUIDE":
      return "Comprehensive Guide";
    default:
      return "Learning Resource";
  }
}

export function CourseSuggestionsModal({
  alignmentId,
  open,
  onOpenChange,
  onRegenerated,
}: CourseSuggestionsModalProps) {
  const [isRegenerating, setIsRegenerating] = useState(false);

  const { data, isLoading, isError, error, refetch } =
    useGetAdminCourseSuggestionQuery(alignmentId ?? "", {
      skip: !open || !alignmentId,
    });

  const [generateMutation] = useGenerateCourseSuggestionsMutation();

  const handleRegenerate = async () => {
    if (!alignmentId) return;
    setIsRegenerating(true);
    try {
      await generateMutation({
        alignmentId,
        forceRegenerate: true,
      }).unwrap();
      toast.success("Course suggestions regenerated successfully.");
      refetch();
      onRegenerated?.();
    } catch (err: any) {
      const message =
        err?.data?.message || err?.message || "Failed to regenerate suggestions.";
      toast.error(message);
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader className="border-b border-border/60 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold tracking-tight text-foreground">
                  Course Suggestions & Upskilling Roadmap
                </DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {data?.jobTitle ? (
                    <>
                      Target: <span className="font-medium text-foreground">{data.jobTitle}</span>
                      {data.companyName ? ` at ${data.companyName}` : ""}
                    </>
                  ) : (
                    "Targeted learning path bridging verified skill gaps"
                  )}
                </p>
              </div>
            </div>

            {data?.status === "READY" && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRegenerate}
                disabled={isRegenerating}
                className="shrink-0 text-xs font-medium"
              >
                {isRegenerating ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    Regenerating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                    Regenerate
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogHeader>

        {/* Modal Body */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
            <p className="text-sm font-medium text-foreground">Loading course suggestions...</p>
            <p className="text-xs text-muted-foreground">Reading persisted roadmap</p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-3">
              <AlertCircle className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold text-foreground">Failed to load roadmap</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              {(error as any)?.data?.message || "Course suggestions not found or generation failed."}
            </p>
            {alignmentId && (
              <Button
                size="sm"
                onClick={handleRegenerate}
                disabled={isRegenerating}
                className="mt-4"
              >
                {isRegenerating ? (
                  <>
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                    Generating Roadmap...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-1.5 h-4 w-4" />
                    Generate Suggestions
                  </>
                )}
              </Button>
            )}
          </div>
        ) : data ? (
          <div className="space-y-5 pt-2">
            {/* Candidate & Metadata Summary Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-xl border border-border/60 bg-muted/30 p-3.5 text-xs">
              <div>
                <span className="text-muted-foreground">Candidate:</span>{" "}
                <span className="font-semibold text-foreground">
                  {data.candidateName || "Candidate"}
                </span>
              </div>
              <div className="sm:text-right">
                <span className="text-muted-foreground">Roadmap Status:</span>{" "}
                <Badge
                  variant={data.status === "READY" ? "default" : "outline"}
                  className="ml-1 text-[11px] font-medium"
                >
                  {data.status === "READY" && (
                    <CheckCircle2 className="mr-1 h-3 w-3 text-emerald-500 inline" />
                  )}
                  {data.status}
                </Badge>
              </div>
              {data.generatedAt && (
                <div className="text-muted-foreground">
                  Generated: {new Date(data.generatedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
              )}
              {data.skillsAddressed && data.skillsAddressed.length > 0 && (
                <div className="sm:text-right text-muted-foreground">
                  Skills Covered:{" "}
                  <span className="font-medium text-foreground">
                    {data.skillsAddressed.length} Skills
                  </span>
                </div>
              )}
            </div>

            {/* Skills Addressed Pill List */}
            {data.skillsAddressed && data.skillsAddressed.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Target Skill Gaps Bridged
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {data.skillsAddressed.map((skill, idx) => (
                    <Badge
                      key={idx}
                      variant="outline"
                      className="bg-card text-foreground border-border/80 text-xs px-2.5 py-0.5"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Summary Callout Banner */}
            {data.summary && (
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 text-sm leading-relaxed text-foreground flex items-start gap-3">
                <BookOpen className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                <p className="text-xs sm:text-sm text-foreground/90 font-medium">
                  {data.summary}
                </p>
              </div>
            )}

            {/* Curated Resources List */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Curated Free Learning Resources ({data.resources.length})
                </p>
                <span className="text-[11px] text-muted-foreground">
                  100% Free • Verified Accessible
                </span>
              </div>

              <div className="space-y-3">
                {data.resources.map((res, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-border/70 bg-card p-4 transition-colors hover:border-border hover:shadow-xs space-y-3"
                  >
                    {/* Top Row: Skill Badge + Title + Direct Link Button */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="inline-block rounded-md bg-muted px-2 py-0.5 text-[11px] font-semibold text-foreground">
                            {res.skill}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            by {res.authorOrChannel}
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-foreground leading-snug">
                          {res.title}
                        </h4>
                      </div>

                      <a
                        href={res.destinationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center shrink-0"
                      >
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 gap-1.5 text-xs font-medium"
                        >
                          Open Resource
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                      </a>
                    </div>

                    {/* Metadata Tags: Platform, Type, Duration */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span
                        className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium ${getPlatformBadgeClass(
                          res.platform,
                        )}`}
                      >
                        {res.platform}
                      </span>

                      <span className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-muted/40 px-2 py-0.5 text-[11px] text-foreground">
                        {getResourceTypeIcon(res.type)}
                        {formatResourceType(res.type)}
                      </span>

                      <span className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-muted/40 px-2 py-0.5 text-[11px] text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {res.estimatedDuration}
                      </span>
                    </div>

                    {/* Justification Box */}
                    {res.whyRecommended && (
                      <div className="rounded-lg bg-muted/30 border border-border/40 p-2.5 text-xs text-muted-foreground leading-relaxed">
                        <span className="font-medium text-foreground">Why this helps:</span>{" "}
                        {res.whyRecommended}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
