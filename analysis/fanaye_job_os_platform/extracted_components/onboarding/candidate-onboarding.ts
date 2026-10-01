import type {
  CandidateDashboardResponseDto,
  CandidateReviewResponseDto,
  MatchStatusResponseDto,
} from "@/domains/candidate/api/candidate.api";

export type CandidateImportStatus =
  | "CREATED"
  | "PROCESSING"
  | "EXTRACTED"
  | "NORMALIZED"
  | "MERGED"
  | "ARCHIVED"
  | string
  | null
  | undefined;

export type UploadCvResumeState =
  | "NEEDS_UPLOAD"
  | "PROCESSING"
  | "FAILED_RETRY"
  | "READY_FOR_REVIEW_OR_PREFERENCES"
  | "COMPLETE";

const pendingImportStatuses = new Set(["CREATED", "PROCESSING", "EXTRACTED", "NORMALIZED"]);
const failedImportStatuses = new Set(["ARCHIVED", "FAILED", "ERROR", "ERRORED"]);

export function isImportPending(status: CandidateImportStatus): boolean {
  return pendingImportStatuses.has(String(status ?? "").toUpperCase());
}

export function isImportFailed(status: CandidateImportStatus): boolean {
  return failedImportStatuses.has(String(status ?? "").toUpperCase());
}

export function hasMeaningfulDocument(document?: unknown): boolean {
  if (!document || typeof document !== "object") {
    return false;
  }

  if (Array.isArray(document)) {
    return document.length > 0;
  }

  return Object.values(document as Record<string, unknown>).some((value) => {
    if (value == null) return false;
    if (typeof value === "string") return value.trim().length > 0 && value.trim() !== "string";
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "object") return hasMeaningfulDocument(value);
    if (typeof value === "number") return value > 0;
    if (typeof value === "boolean") return value;
    return false;
  });
}

function hasActiveImports(dashboard?: CandidateDashboardResponseDto | null): boolean {
  const activeImports = dashboard?.activeImports as number | unknown[] | null | undefined;
  return Array.isArray(activeImports)
    ? activeImports.length > 0
    : (activeImports ?? 0) > 0;
}

export function hasAnyImport(dashboard?: CandidateDashboardResponseDto | null): boolean {
  return Boolean(dashboard?.latestImport || hasActiveImports(dashboard));
}

export function hasUsableKnowledgeBase(
  dashboard?: CandidateDashboardResponseDto | null,
  review?: CandidateReviewResponseDto | null,
): boolean {
  const hasDashboardVersionAndSnapshot =
    (dashboard?.knowledgeBaseVersion ?? 0) > 0 && (dashboard?.snapshotCount ?? 0) > 0;
  const hasReviewVersionAndDocument =
    (review?.currentVersion ?? 0) > 0 && hasMeaningfulDocument(review?.reviewDocument);
  const hasCompletenessWithDocument =
    ((dashboard?.knowledgeBaseCompleteness ?? 0) > 0 || (review?.profileCompleteness ?? 0) > 0) &&
    (hasMeaningfulDocument(review?.reviewDocument) || hasDashboardVersionAndSnapshot);

  return Boolean(
    hasReviewVersionAndDocument ||
      hasDashboardVersionAndSnapshot ||
      hasCompletenessWithDocument,
  );
}

export function hasConfirmedPreferences(preferences?: { confirmedAt?: string | null } | null): boolean {
  return Boolean(preferences?.confirmedAt);
}

export function getUploadCvResumeState({
  dashboard,
  review,
  preferences,
  matchesStatus,
}: {
  dashboard?: CandidateDashboardResponseDto | null;
  review?: CandidateReviewResponseDto | null;
  preferences?: { confirmedAt?: string | null } | null;
  matchesStatus?: MatchStatusResponseDto | null;
}): UploadCvResumeState {
  const latestStatus = dashboard?.latestImport?.status;

  if (isImportPending(latestStatus) || hasActiveImports(dashboard)) {
    return "PROCESSING";
  }

  const hasKb = hasUsableKnowledgeBase(dashboard, review);

  if (hasKb && (matchesStatus?.requiresPreferenceConfirmation || !hasConfirmedPreferences(preferences))) {
    return "READY_FOR_REVIEW_OR_PREFERENCES";
  }

  if (hasKb && hasConfirmedPreferences(preferences)) {
    return "COMPLETE";
  }

  if (hasAnyImport(dashboard) && isImportFailed(latestStatus) && !hasKb) {
    return "FAILED_RETRY";
  }

  return "NEEDS_UPLOAD";
}
