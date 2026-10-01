"use client";

import { useMemo, useState } from "react";
import {
  Download,
  Filter,
  Loader2,
  RefreshCw,
  RotateCcw,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import toast from "react-hot-toast";
import { useGetAdminCandidateExportPreviewQuery } from "@/domains/admin/api/admin.api";
import type {
  CandidateExportPreviewItem,
  CandidateExportQuery,
  CandidateExportSortBy,
  FilterComparisonOperator,
  UserStatus,
} from "@/domains/admin/types/admin.types";
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

type PresetKey =
  | "CUSTOM"
  | "VERIFIED_INCOMPLETE"
  | "ZERO_MAPPED"
  | "MAPPED_ZERO_REACHED"
  | "REACHED_ZERO_OPENED"
  | "OPENED_ZERO_APPLIED"
  | "HIGH_INTENT";

const PRESETS: Array<{ id: PresetKey; label: string; description: string }> = [
  {
    id: "CUSTOM",
    label: "Custom (Mix & Match)",
    description: "Freely configure any filter combinations",
  },
  {
    id: "VERIFIED_INCOMPLETE",
    label: "Verified but Incomplete Onboarding",
    description: "Verified email but no target roles, CV, or confirmed preferences",
  },
  {
    id: "ZERO_MAPPED",
    label: "Stuck in Funnel: Zero Mapped Opportunities",
    description: "Has query roles defined, but 0 opportunities mapped by engine",
  },
  {
    id: "MAPPED_ZERO_REACHED",
    label: "Stuck in Funnel: Mapped but Zero Reached Feed",
    description: "Opportunities mapped, but 0 released/delivered to feed",
  },
  {
    id: "REACHED_ZERO_OPENED",
    label: "Passive Users: Reached Feed but Zero Opened",
    description: "Jobs delivered to feed, but candidate has opened 0",
  },
  {
    id: "OPENED_ZERO_APPLIED",
    label: "Window Shoppers: Opened Jobs but Zero Applied",
    description: "Opened and viewed jobs, but submitted 0 applications",
  },
  {
    id: "HIGH_INTENT",
    label: "High Intent / Power Users",
    description: "Applied to at least 1 job and generated at least 1 tailored resume",
  },
];

function statusBadgeVariant(status: string) {
  if (status === "SUSPENDED" || status === "DELETED" || status === "DELETION_PENDING")
    return "destructive";
  if (status === "ACTIVE" || status === "VERIFIED") return "default";
  return "outline";
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "Never";
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "Invalid date";
  }
}

export function AdminCandidateExportTab() {
  const [selectedPreset, setSelectedPreset] = useState<PresetKey>("CUSTOM");

  // Granular Filter States
  const [search, setSearch] = useState("");
  const [queryRole, setQueryRole] = useState("");
  const [status, setStatus] = useState<UserStatus | "">("");
  const [emailVerified, setEmailVerified] = useState<string>(""); // "" | "true" | "false"
  const [onboardingStage, setOnboardingStage] = useState<string>("");
  const [hasQueryRoles, setHasQueryRoles] = useState<string>(""); // "" | "true" | "false"
  const [hasCv, setHasCv] = useState<string>(""); // "" | "true" | "false"
  const [preferencesConfirmed, setPreferencesConfirmed] = useState<string>(""); // "" | "true" | "false"

  // Funnel Threshold Operators & Values
  const [mappedOperator, setMappedOperator] = useState<FilterComparisonOperator>("ANY");
  const [mappedValue, setMappedValue] = useState<number | "">("");

  const [reachedOperator, setReachedOperator] = useState<FilterComparisonOperator>("ANY");
  const [reachedValue, setReachedValue] = useState<number | "">("");

  const [openedOperator, setOpenedOperator] = useState<FilterComparisonOperator>("ANY");
  const [openedValue, setOpenedValue] = useState<number | "">("");

  const [appliedOperator, setAppliedOperator] = useState<FilterComparisonOperator>("ANY");
  const [appliedValue, setAppliedValue] = useState<number | "">("");

  const [resumesOperator, setResumesOperator] = useState<FilterComparisonOperator>("ANY");
  const [resumesValue, setResumesValue] = useState<number | "">("");

  const [lettersOperator, setLettersOperator] = useState<FilterComparisonOperator>("ANY");
  const [lettersValue, setLettersValue] = useState<number | "">("");

  // Sorting & Pagination
  const [sortBy, setSortBy] = useState<CandidateExportSortBy>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);

  const [isExporting, setIsExporting] = useState(false);

  // Apply preset helper
  const handlePresetSelect = (preset: PresetKey) => {
    setSelectedPreset(preset);
    setPage(1);

    switch (preset) {
      case "VERIFIED_INCOMPLETE":
        setEmailVerified("true");
        setHasQueryRoles("false");
        setHasCv("false");
        setPreferencesConfirmed("false");
        setMappedOperator("ANY");
        setMappedValue("");
        setReachedOperator("ANY");
        setReachedValue("");
        setOpenedOperator("ANY");
        setOpenedValue("");
        setAppliedOperator("ANY");
        setAppliedValue("");
        setResumesOperator("ANY");
        setResumesValue("");
        setLettersOperator("ANY");
        setLettersValue("");
        break;
      case "ZERO_MAPPED":
        setEmailVerified("");
        setHasQueryRoles("true");
        setHasCv("");
        setPreferencesConfirmed("");
        setMappedOperator("EQ");
        setMappedValue(0);
        setReachedOperator("ANY");
        setReachedValue("");
        setOpenedOperator("ANY");
        setOpenedValue("");
        setAppliedOperator("ANY");
        setAppliedValue("");
        setResumesOperator("ANY");
        setResumesValue("");
        setLettersOperator("ANY");
        setLettersValue("");
        break;
      case "MAPPED_ZERO_REACHED":
        setEmailVerified("");
        setHasQueryRoles("");
        setHasCv("");
        setPreferencesConfirmed("");
        setMappedOperator("GTE");
        setMappedValue(1);
        setReachedOperator("EQ");
        setReachedValue(0);
        setOpenedOperator("ANY");
        setOpenedValue("");
        setAppliedOperator("ANY");
        setAppliedValue("");
        setResumesOperator("ANY");
        setResumesValue("");
        setLettersOperator("ANY");
        setLettersValue("");
        break;
      case "REACHED_ZERO_OPENED":
        setEmailVerified("");
        setHasQueryRoles("");
        setHasCv("");
        setPreferencesConfirmed("");
        setMappedOperator("ANY");
        setMappedValue("");
        setReachedOperator("GTE");
        setReachedValue(1);
        setOpenedOperator("EQ");
        setOpenedValue(0);
        setAppliedOperator("ANY");
        setAppliedValue("");
        setResumesOperator("ANY");
        setResumesValue("");
        setLettersOperator("ANY");
        setLettersValue("");
        break;
      case "OPENED_ZERO_APPLIED":
        setEmailVerified("");
        setHasQueryRoles("");
        setHasCv("");
        setPreferencesConfirmed("");
        setMappedOperator("ANY");
        setMappedValue("");
        setReachedOperator("ANY");
        setReachedValue("");
        setOpenedOperator("GTE");
        setOpenedValue(1);
        setAppliedOperator("EQ");
        setAppliedValue(0);
        setResumesOperator("ANY");
        setResumesValue("");
        setLettersOperator("ANY");
        setLettersValue("");
        break;
      case "HIGH_INTENT":
        setEmailVerified("");
        setHasQueryRoles("");
        setHasCv("");
        setPreferencesConfirmed("");
        setMappedOperator("ANY");
        setMappedValue("");
        setReachedOperator("ANY");
        setReachedValue("");
        setOpenedOperator("ANY");
        setOpenedValue("");
        setAppliedOperator("GTE");
        setAppliedValue(1);
        setResumesOperator("GTE");
        setResumesValue(1);
        setLettersOperator("ANY");
        setLettersValue("");
        break;
      case "CUSTOM":
      default:
        // Do not reset current selections, just set mode to custom
        break;
    }
  };

  const handleResetFilters = () => {
    setSelectedPreset("CUSTOM");
    setSearch("");
    setQueryRole("");
    setStatus("");
    setEmailVerified("");
    setOnboardingStage("");
    setHasQueryRoles("");
    setHasCv("");
    setPreferencesConfirmed("");
    setMappedOperator("ANY");
    setMappedValue("");
    setReachedOperator("ANY");
    setReachedValue("");
    setOpenedOperator("ANY");
    setOpenedValue("");
    setAppliedOperator("ANY");
    setAppliedValue("");
    setResumesOperator("ANY");
    setResumesValue("");
    setLettersOperator("ANY");
    setLettersValue("");
    setSortBy("createdAt");
    setSortOrder("desc");
    setPage(1);
  };

  // Build query payload
  const queryPayload: CandidateExportQuery = useMemo(() => {
    return {
      ...(search.trim() ? { search: search.trim() } : {}),
      ...(queryRole.trim() ? { queryRole: queryRole.trim() } : {}),
      ...(status ? { status: status as UserStatus } : {}),
      ...(emailVerified !== "" ? { emailVerified: emailVerified === "true" } : {}),
      ...(onboardingStage ? { onboardingStage } : {}),
      ...(hasQueryRoles !== "" ? { hasQueryRoles: hasQueryRoles === "true" } : {}),
      ...(hasCv !== "" ? { hasCv: hasCv === "true" } : {}),
      ...(preferencesConfirmed !== ""
        ? { preferencesConfirmed: preferencesConfirmed === "true" }
        : {}),
      ...(mappedOperator !== "ANY" && mappedValue !== ""
        ? { mappedOperator, mappedValue: Number(mappedValue) }
        : {}),
      ...(reachedOperator !== "ANY" && reachedValue !== ""
        ? { reachedOperator, reachedValue: Number(reachedValue) }
        : {}),
      ...(openedOperator !== "ANY" && openedValue !== ""
        ? { openedOperator, openedValue: Number(openedValue) }
        : {}),
      ...(appliedOperator !== "ANY" && appliedValue !== ""
        ? { appliedOperator, appliedValue: Number(appliedValue) }
        : {}),
      ...(resumesOperator !== "ANY" && resumesValue !== ""
        ? { resumesOperator, resumesValue: Number(resumesValue) }
        : {}),
      ...(lettersOperator !== "ANY" && lettersValue !== ""
        ? { lettersOperator, lettersValue: Number(lettersValue) }
        : {}),
      sortBy,
      sortOrder,
      page,
      limit,
    };
  }, [
    search,
    queryRole,
    status,
    emailVerified,
    onboardingStage,
    hasQueryRoles,
    hasCv,
    preferencesConfirmed,
    mappedOperator,
    mappedValue,
    reachedOperator,
    reachedValue,
    openedOperator,
    openedValue,
    appliedOperator,
    appliedValue,
    resumesOperator,
    resumesValue,
    lettersOperator,
    lettersValue,
    sortBy,
    sortOrder,
    page,
    limit,
  ]);

  const { data, isLoading, isFetching, isError, refetch } =
    useGetAdminCandidateExportPreviewQuery(queryPayload);

  const candidates: CandidateExportPreviewItem[] = data?.data ?? [];
  const totalCount = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  // Direct CSV Export Download Handler
  const handleExportCsv = async () => {
    try {
      setIsExporting(true);
      const params = new URLSearchParams();

      if (search.trim()) params.set("search", search.trim());
      if (queryRole.trim()) params.set("queryRole", queryRole.trim());
      if (status) params.set("status", status);
      if (emailVerified !== "") params.set("emailVerified", emailVerified);
      if (onboardingStage) params.set("onboardingStage", onboardingStage);
      if (hasQueryRoles !== "") params.set("hasQueryRoles", hasQueryRoles);
      if (hasCv !== "") params.set("hasCv", hasCv);
      if (preferencesConfirmed !== "")
        params.set("preferencesConfirmed", preferencesConfirmed);

      if (mappedOperator !== "ANY" && mappedValue !== "") {
        params.set("mappedOperator", mappedOperator);
        params.set("mappedValue", String(mappedValue));
      }
      if (reachedOperator !== "ANY" && reachedValue !== "") {
        params.set("reachedOperator", reachedOperator);
        params.set("reachedValue", String(reachedValue));
      }
      if (openedOperator !== "ANY" && openedValue !== "") {
        params.set("openedOperator", openedOperator);
        params.set("openedValue", String(openedValue));
      }
      if (appliedOperator !== "ANY" && appliedValue !== "") {
        params.set("appliedOperator", appliedOperator);
        params.set("appliedValue", String(appliedValue));
      }
      if (resumesOperator !== "ANY" && resumesValue !== "") {
        params.set("resumesOperator", resumesOperator);
        params.set("resumesValue", String(resumesValue));
      }
      if (lettersOperator !== "ANY" && lettersValue !== "") {
        params.set("lettersOperator", lettersOperator);
        params.set("lettersValue", String(lettersValue));
      }

      params.set("sortBy", sortBy);
      params.set("sortOrder", sortOrder);

      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";
      const exportUrl = `${baseUrl}/admin/candidate-activity/export/csv?${params.toString()}`;

      const response = await fetch(exportUrl, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Export failed with status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      const contentDisposition = response.headers.get("content-disposition");
      let filename = `teftef_candidates_export_${new Date().toISOString().slice(0, 10)}.csv`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        if (match && match[1]) filename = match[1];
      }

      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success(`Exported ${totalCount} candidates to CSV!`);
    } catch (err: any) {
      toast.error(err.message || "Failed to download CSV export.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── 1. Smart Drop-off Presets ────────────────────────────────────────── */}
      <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                One-Click Drop-off Presets
              </h3>
              <p className="text-xs text-muted-foreground">
                Instantly isolate key operational cohorts across the candidate journey
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedPreset}
              onChange={(e) => handlePresetSelect(e.target.value as PresetKey)}
              className="h-10 rounded-xl border border-input bg-background px-4 text-sm font-medium shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
              className="flex items-center gap-2 rounded-xl"
            >
              <RotateCcw className="h-4 w-4" />
              Reset Filters
            </Button>
          </div>
        </div>
      </div>

      {/* ── 2. Granular Multi-Filter Matrix ─────────────────────────────────── */}
      <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <Filter className="h-4 w-4" />
          Granular Filter Controls
        </div>

        {/* Section A: Identity & Onboarding */}
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search name, email, phone"
              className="pl-9"
            />
          </div>

          <Input
            value={queryRole}
            onChange={(e) => {
              setQueryRole(e.target.value);
              setPage(1);
            }}
            placeholder="Target role query (e.g. Backend)"
          />

          <select
            value={emailVerified}
            onChange={(e) => {
              setEmailVerified(e.target.value);
              setPage(1);
            }}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">Email: All</option>
            <option value="true">Email: Verified Only</option>
            <option value="false">Email: Unverified Only</option>
          </select>

          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as UserStatus | "");
              setPage(1);
            }}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">Status: All</option>
            <option value="ACTIVE">Active</option>
            <option value="VERIFIED">Verified</option>
            <option value="REGISTERED">Registered</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="DELETION_PENDING">Deletion Pending</option>
            <option value="DELETED">Deleted</option>
          </select>

          <select
            value={onboardingStage}
            onChange={(e) => {
              setOnboardingStage(e.target.value);
              setPage(1);
            }}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">Onboarding Stage: All</option>
            <option value="ACCOUNT_CREATED">Account Created</option>
            <option value="PROFILE_STARTED">Profile Started</option>
            <option value="PROFILE_COMPLETED">Profile Completed</option>
            <option value="KNOWLEDGE_BASE_READY">Knowledge Base Ready</option>
          </select>

          <select
            value={hasQueryRoles}
            onChange={(e) => {
              setHasQueryRoles(e.target.value);
              setPage(1);
            }}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">Query Roles: All</option>
            <option value="true">Has Query Roles</option>
            <option value="false">No Query Roles</option>
          </select>

          <select
            value={hasCv}
            onChange={(e) => {
              setHasCv(e.target.value);
              setPage(1);
            }}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">CV Status: All</option>
            <option value="true">CV Uploaded</option>
            <option value="false">No CV Uploaded</option>
          </select>

          <select
            value={preferencesConfirmed}
            onChange={(e) => {
              setPreferencesConfirmed(e.target.value);
              setPage(1);
            }}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">Preferences: All</option>
            <option value="true">Preferences Confirmed</option>
            <option value="false">Unconfirmed</option>
          </select>
        </div>

        {/* Section B: Funnel Thresholds */}
        <div className="border-t border-border/40 pt-3">
          <div className="mb-2 text-xs font-medium text-muted-foreground">
            Funnel Activity Thresholds (Operator & Count)
          </div>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            {/* Mapped */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">🎯 Mapped</label>
              <div className="flex gap-1">
                <select
                  value={mappedOperator}
                  onChange={(e) => {
                    setMappedOperator(e.target.value as FilterComparisonOperator);
                    setPage(1);
                  }}
                  className="h-9 w-20 rounded-md border border-input bg-background px-2 text-xs font-medium"
                >
                  <option value="ANY">ANY</option>
                  <option value="EQ">=</option>
                  <option value="GTE">&gt;=</option>
                  <option value="LTE">&lt;=</option>
                </select>
                <Input
                  type="number"
                  min={0}
                  value={mappedValue}
                  disabled={mappedOperator === "ANY"}
                  onChange={(e) => {
                    setMappedValue(e.target.value === "" ? "" : Number(e.target.value));
                    setPage(1);
                  }}
                  placeholder="0"
                  className="h-9 text-xs"
                />
              </div>
            </div>

            {/* Reached */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">📬 Reached</label>
              <div className="flex gap-1">
                <select
                  value={reachedOperator}
                  onChange={(e) => {
                    setReachedOperator(e.target.value as FilterComparisonOperator);
                    setPage(1);
                  }}
                  className="h-9 w-20 rounded-md border border-input bg-background px-2 text-xs font-medium"
                >
                  <option value="ANY">ANY</option>
                  <option value="EQ">=</option>
                  <option value="GTE">&gt;=</option>
                  <option value="LTE">&lt;=</option>
                </select>
                <Input
                  type="number"
                  min={0}
                  value={reachedValue}
                  disabled={reachedOperator === "ANY"}
                  onChange={(e) => {
                    setReachedValue(e.target.value === "" ? "" : Number(e.target.value));
                    setPage(1);
                  }}
                  placeholder="0"
                  className="h-9 text-xs"
                />
              </div>
            </div>

            {/* Opened */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">👁️ Opened</label>
              <div className="flex gap-1">
                <select
                  value={openedOperator}
                  onChange={(e) => {
                    setOpenedOperator(e.target.value as FilterComparisonOperator);
                    setPage(1);
                  }}
                  className="h-9 w-20 rounded-md border border-input bg-background px-2 text-xs font-medium"
                >
                  <option value="ANY">ANY</option>
                  <option value="EQ">=</option>
                  <option value="GTE">&gt;=</option>
                  <option value="LTE">&lt;=</option>
                </select>
                <Input
                  type="number"
                  min={0}
                  value={openedValue}
                  disabled={openedOperator === "ANY"}
                  onChange={(e) => {
                    setOpenedValue(e.target.value === "" ? "" : Number(e.target.value));
                    setPage(1);
                  }}
                  placeholder="0"
                  className="h-9 text-xs"
                />
              </div>
            </div>

            {/* Applied */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">📝 Applied</label>
              <div className="flex gap-1">
                <select
                  value={appliedOperator}
                  onChange={(e) => {
                    setAppliedOperator(e.target.value as FilterComparisonOperator);
                    setPage(1);
                  }}
                  className="h-9 w-20 rounded-md border border-input bg-background px-2 text-xs font-medium"
                >
                  <option value="ANY">ANY</option>
                  <option value="EQ">=</option>
                  <option value="GTE">&gt;=</option>
                  <option value="LTE">&lt;=</option>
                </select>
                <Input
                  type="number"
                  min={0}
                  value={appliedValue}
                  disabled={appliedOperator === "ANY"}
                  onChange={(e) => {
                    setAppliedValue(e.target.value === "" ? "" : Number(e.target.value));
                    setPage(1);
                  }}
                  placeholder="0"
                  className="h-9 text-xs"
                />
              </div>
            </div>

            {/* Resumes */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">📄 Resumes</label>
              <div className="flex gap-1">
                <select
                  value={resumesOperator}
                  onChange={(e) => {
                    setResumesOperator(e.target.value as FilterComparisonOperator);
                    setPage(1);
                  }}
                  className="h-9 w-20 rounded-md border border-input bg-background px-2 text-xs font-medium"
                >
                  <option value="ANY">ANY</option>
                  <option value="EQ">=</option>
                  <option value="GTE">&gt;=</option>
                  <option value="LTE">&lt;=</option>
                </select>
                <Input
                  type="number"
                  min={0}
                  value={resumesValue}
                  disabled={resumesOperator === "ANY"}
                  onChange={(e) => {
                    setResumesValue(e.target.value === "" ? "" : Number(e.target.value));
                    setPage(1);
                  }}
                  placeholder="0"
                  className="h-9 text-xs"
                />
              </div>
            </div>

            {/* Cover Letters */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">✉️ Letters</label>
              <div className="flex gap-1">
                <select
                  value={lettersOperator}
                  onChange={(e) => {
                    setLettersOperator(e.target.value as FilterComparisonOperator);
                    setPage(1);
                  }}
                  className="h-9 w-20 rounded-md border border-input bg-background px-2 text-xs font-medium"
                >
                  <option value="ANY">ANY</option>
                  <option value="EQ">=</option>
                  <option value="GTE">&gt;=</option>
                  <option value="LTE">&lt;=</option>
                </select>
                <Input
                  type="number"
                  min={0}
                  value={lettersValue}
                  disabled={lettersOperator === "ANY"}
                  onChange={(e) => {
                    setLettersValue(e.target.value === "" ? "" : Number(e.target.value));
                    setPage(1);
                  }}
                  placeholder="0"
                  className="h-9 text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section C: Sorting */}
        <div className="border-t border-border/40 pt-3 flex flex-wrap items-center gap-3">
          <span className="text-xs font-medium text-muted-foreground">Sort By:</span>
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value as CandidateExportSortBy);
              setPage(1);
            }}
            className="h-9 rounded-md border border-input bg-background px-3 text-xs"
          >
            <option value="createdAt">Registered Date</option>
            <option value="lastActiveAt">Last Active Date</option>
            <option value="fullName">Full Name</option>
            <option value="email">Email</option>
            <option value="mapped">Mapped Opportunities</option>
            <option value="reached">Reached Feed</option>
            <option value="opened">Opened Jobs</option>
            <option value="applied">Applied Jobs</option>
            <option value="resumes">Resumes Generated</option>
            <option value="coverLetters">Cover Letters Generated</option>
          </select>

          <select
            value={sortOrder}
            onChange={(e) => {
              setSortOrder(e.target.value as "asc" | "desc");
              setPage(1);
            }}
            className="h-9 rounded-md border border-input bg-background px-3 text-xs"
          >
            <option value="desc">Descending (High to Low)</option>
            <option value="asc">Ascending (Low to High)</option>
          </select>
        </div>
      </div>

      {/* ── 3. Action & Summary Bar ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-foreground">
                {isLoading ? "Calculating..." : `${totalCount.toLocaleString()} Candidates`}
              </span>
              <Badge variant="outline" className="text-xs">
                Filtered Cohort
              </Badge>
              {isFetching && !isLoading && (
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Ready for immediate CSV dossier export (33 columns with Amharic compatibility)
            </p>
          </div>
        </div>

        <Button
          onClick={handleExportCsv}
          disabled={totalCount === 0 || isExporting || isLoading}
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90"
        >
          {isExporting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Exporting CSV...
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Export {totalCount > 0 ? `${totalCount.toLocaleString()} Candidates` : ""} to CSV
            </>
          )}
        </Button>
      </div>

      {/* ── 4. High-Density Cohort Preview Table ─────────────────────────────── */}
      <div className="rounded-2xl border border-border/60 bg-card shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center p-12 text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin text-primary" />
            Loading candidate segment preview...
          </div>
        ) : isError ? (
          <div className="p-8 text-center">
            <p className="text-sm font-semibold text-destructive">
              Unable to load cohort preview.
            </p>
            <Button
              className="mt-3 rounded-xl"
              variant="outline"
              size="sm"
              onClick={() => refetch()}
            >
              Retry
            </Button>
          </div>
        ) : candidates.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            No candidates matched the current filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[220px]">Candidate</TableHead>
                  <TableHead className="min-w-[180px]">Target Query Roles</TableHead>
                  <TableHead className="min-w-[150px]">Stage & Status</TableHead>
                  <TableHead className="min-w-[140px]">KB & CV</TableHead>
                  <TableHead className="min-w-[220px]">Funnel Activity</TableHead>
                  <TableHead className="min-w-[120px] text-right">Registered</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {candidates.map((c) => (
                  <TableRow key={c.userId}>
                    {/* Identity & Contact */}
                    <TableCell>
                      <div className="font-semibold text-foreground">
                        {c.fullName ?? "Unnamed Candidate"}
                      </div>
                      <div className="text-xs text-muted-foreground">{c.email}</div>
                      {c.phoneNumber && (
                        <div className="text-xs text-muted-foreground/80">
                          📞 {c.phoneNumber}
                        </div>
                      )}
                    </TableCell>

                    {/* Target Roles */}
                    <TableCell>
                      {c.targetRoles.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {c.targetRoles.slice(0, 2).map((r, i) => (
                            <Badge
                              key={i}
                              variant="secondary"
                              className="text-[11px] font-normal"
                            >
                              {r}
                            </Badge>
                          ))}
                          {c.targetRoles.length > 2 && (
                            <Badge variant="outline" className="text-[10px]">
                              +{c.targetRoles.length - 2}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">No roles set</span>
                      )}
                    </TableCell>

                    {/* Stage & Status */}
                    <TableCell>
                      <div className="space-y-1">
                        <Badge
                          variant={statusBadgeVariant(c.status)}
                          className="text-[11px]"
                        >
                          {c.status}
                        </Badge>
                        <div className="text-[11px] text-muted-foreground">
                          {c.onboardingStage.replace(/_/g, " ")}
                        </div>
                        <div className="text-[11px] font-medium text-foreground">
                          {c.emailVerified ? "✓ Email Verified" : "✗ Unverified"}
                        </div>
                      </div>
                    </TableCell>

                    {/* Knowledge Base & CV */}
                    <TableCell>
                      <div className="space-y-1 text-xs">
                        <div className="font-medium">
                          {c.hasCv ? (
                            <span className="text-primary">✓ CV Uploaded</span>
                          ) : (
                            <span className="text-muted-foreground">No CV</span>
                          )}
                        </div>
                        <div className="text-muted-foreground">
                          Completeness: {c.kbCompleteness}%
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {c.preferencesConfirmed ? "✓ Prefs Confirmed" : "✗ Prefs Unconfirmed"}
                        </div>
                      </div>
                    </TableCell>

                    {/* Funnel Counters Pill */}
                    <TableCell>
                      <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                        <span title="Opportunities Mapped">
                          🎯 <strong>{c.totals.mapped}</strong>
                        </span>
                        <span title="Jobs Delivered to Feed">
                          📬 <strong>{c.totals.reached}</strong>
                        </span>
                        <span title="Jobs Opened / Viewed">
                          👁️ <strong>{c.totals.opened}</strong>
                        </span>
                        <span title="Jobs Applied">
                          📝 <strong>{c.totals.applied}</strong>
                        </span>
                        <span title="Resumes Generated">
                          📄 <strong>{c.totals.resumes}</strong>
                        </span>
                        <span title="Cover Letters Generated">
                          ✉️ <strong>{c.totals.coverLetters}</strong>
                        </span>
                      </div>
                    </TableCell>

                    {/* Registered Date */}
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {formatDate(c.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* ── 5. Pagination Controls ─────────────────────────────────────────── */}
      <PaginationControls
        page={page}
        limit={limit}
        totalCount={totalCount}
        totalPages={totalPages}
        onPageChange={setPage}
        onLimitChange={setLimit}
      />
    </div>
  );
}
