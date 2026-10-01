"use client";

import React, { useState, useRef, useMemo } from "react";
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Send,
  Trash2,
  Layers,
  Search,
  Sparkles,
  Check,
  XCircle,
} from "lucide-react";
import {
  useAdminJobPreWarmMutation,
  useGetAdminJobPreWarmHistoryQuery,
} from "@/domains/admin/api/admin.api";
import type {
  AdminJobPreWarmItem,
  AdminJobPreWarmResponse,
} from "@/domains/admin/types/admin.types";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

const MAX_SEARCH_INTENTS_PER_DISPATCH = 25;

/**
 * Robust CSV parser that handles quotes, commas inside quotes, and CRLF / LF linebreaks.
 */
function parseCsv(text: string): Record<string, string>[] {
  const lines: string[] = [];
  let currentLine = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentLine += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if ((char === "\r" || char === "\n") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") {
        i++;
      }
      if (currentLine.trim()) {
        lines.push(currentLine);
      }
      currentLine = "";
    } else {
      currentLine += char;
    }
  }
  if (currentLine.trim()) {
    lines.push(currentLine);
  }

  if (lines.length < 2) return [];

  // Parse header
  const parseLine = (line: string): string[] => {
    const tokens: string[] = [];
    let token = "";
    let inside = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        inside = !inside;
      } else if (c === "," && !inside) {
        tokens.push(token.trim());
        token = "";
      } else {
        token += c;
      }
    }
    tokens.push(token.trim());
    return tokens;
  };

  const headers = parseLine(lines[0]).map((h) => h.toLowerCase().replace(/[\s_-]+/g, ""));
  const rows: Record<string, string>[] = [];

  for (let idx = 1; idx < lines.length; idx++) {
    const values = parseLine(lines[idx]);
    if (values.length === 0 || values.every((v) => !v)) continue;

    const rowObj: Record<string, string> = {};
    headers.forEach((header, i) => {
      rowObj[header] = values[i] ?? "";
    });
    rows.push(rowObj);
  }

  return rows;
}

function resolveRoleQuery(row: Record<string, string>): string {
  return (
    row.rolequery ||
    row.jobtitle ||
    row.title ||
    row.role ||
    row.position ||
    row.query ||
    ""
  ).trim();
}

function resolveWorkMode(row: Record<string, string>): string {
  return (
    row.workmode ||
    row.worklocation ||
    row.locationtype ||
    row.mode ||
    row.location ||
    ""
  ).trim();
}

function resolveEmploymentType(row: Record<string, string>): string {
  return (
    row.employmenttype ||
    row.jobtype ||
    row.type ||
    row.employment ||
    ""
  ).trim();
}

export function AdminJobPreWarmTab() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [parsedItems, setParsedItems] = useState<AdminJobPreWarmItem[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState("");
  const [postedWithinDays, setPostedWithinDays] = useState(7);
  const [dragActive, setDragActive] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<AdminJobPreWarmResponse | null>(null);

  const [adminJobPreWarm, { isLoading: isDispatching }] = useAdminJobPreWarmMutation();
  const {
    data: historyData,
    isLoading: isLoadingHistory,
    isFetching: isFetchingHistory,
    refetch: refetchHistory,
  } = useGetAdminJobPreWarmHistoryQuery();

  const handleFileProcess = (file: File) => {
    setErrorText(null);
    setLastResult(null);

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setErrorText("Please upload a valid .csv file.");
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (!content) {
        setErrorText("File appears to be empty.");
        return;
      }

      try {
        const rawRows = parseCsv(content);
        if (rawRows.length === 0) {
          setErrorText("No valid rows found in CSV. Please ensure you have headers.");
          return;
        }

        const items: AdminJobPreWarmItem[] = [];
        for (const row of rawRows) {
          const role = resolveRoleQuery(row);
          if (!role) continue;

          items.push({
            roleQuery: role,
            workMode: resolveWorkMode(row) || undefined,
            employmentType: resolveEmploymentType(row) || undefined,
          });
        }

        if (items.length === 0) {
          setErrorText(
            "Could not detect role query column. Supported header names: roleQuery, job title, title, role, position.",
          );
          return;
        }

        setParsedItems(items);
      } catch (err: unknown) {
        setErrorText(
          `Failed to parse CSV: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    };

    reader.readAsText(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const downloadSampleTemplate = () => {
    const csvContent =
      "roleQuery,workMode,employmentType\n" +
      '"Senior React Developer",Remote,Full-time\n' +
      '"Full Stack Node.js Engineer",Remote,Full-time\n' +
      '"Python Backend Specialist",Hybrid,Contract\n' +
      '"DevOps / SRE Engineer",Remote,Full-time\n' +
      '"UI/UX Product Designer",Remote,Full-time\n' +
      '"Machine Learning Engineer",Remote,Contract\n' +
      '"Mobile Flutter Developer",Remote,Full-time\n' +
      '"Data Analyst",On-site,Full-time\n' +
      '"QA Automation Engineer",Remote,Part-time\n' +
      '"Cybersecurity Analyst",Remote,Full-time\n';

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "event_job_pre_warm_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredPreview = useMemo(() => {
    if (!searchFilter.trim()) return parsedItems;
    const q = searchFilter.toLowerCase();
    return parsedItems.filter(
      (item) =>
        item.roleQuery.toLowerCase().includes(q) ||
        (item.workMode && item.workMode.toLowerCase().includes(q)) ||
        (item.employmentType && item.employmentType.toLowerCase().includes(q)),
    );
  }, [parsedItems, searchFilter]);

  const chunkCount = Math.ceil(parsedItems.length / MAX_SEARCH_INTENTS_PER_DISPATCH);

  const handleExecuteDispatch = async () => {
    if (parsedItems.length === 0) return;
    setErrorText(null);

    try {
      const response = await adminJobPreWarm({
        items: parsedItems,
        postedWithinDays,
      }).unwrap();

      setLastResult(response);
      refetchHistory();
    } catch (err: unknown) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message ||
        (err instanceof Error ? err.message : "Failed to execute pre-warm dispatches.");
      setErrorText(msg);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Overview Context Card */}
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-background p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Sparkles className="h-4 w-4" />
              </div>
              <h2 className="text-lg font-bold tracking-tight">Event Job Inventory Pre-Warming</h2>
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Aptio Safe Chunking Active
              </span>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
              Pre-populate live job inventory ahead of high-volume events (e.g. 30K guests).
              Upload a CSV with target roles; TefTef auto-chunks into batches of &le; 25 intents to strictly obey Aptio limits,
              dispatches them sequentially, and publishes the returned catalog jobs directly to the database.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={downloadSampleTemplate}
              className="gap-2 text-xs h-9 rounded-xl border-dashed"
            >
              <Download className="h-3.5 w-3.5" /> Sample CSV Template
            </Button>
          </div>
        </div>
      </div>

      {/* CSV Uploader & Parameter Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dropzone Card */}
        <div className="lg:col-span-2 rounded-2xl border bg-card p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <UploadCloud className="h-4 w-4 text-primary" />
              Upload Role Targets CSV
            </h3>
            {parsedItems.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setParsedItems([]);
                  setFileName(null);
                  setLastResult(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="h-8 text-xs text-destructive hover:text-destructive gap-1"
              >
                <Trash2 className="h-3.5 w-3.5" /> Clear
              </Button>
            )}
          </div>

          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
              dragActive
                ? "border-primary bg-primary/5 scale-[0.99]"
                : "border-border hover:border-primary/50 hover:bg-muted/40"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileProcess(e.target.files[0]);
                }
              }}
            />
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <FileSpreadsheet className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium">
                  {fileName ? (
                    <span className="text-primary font-semibold">{fileName}</span>
                  ) : (
                    "Click to browse or drag & drop CSV file here"
                  )}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Expected columns: <code className="bg-muted px-1 py-0.5 rounded text-[11px]">roleQuery</code>,{" "}
                  <code className="bg-muted px-1 py-0.5 rounded text-[11px]">workMode</code> (optional),{" "}
                  <code className="bg-muted px-1 py-0.5 rounded text-[11px]">employmentType</code> (optional)
                </p>
              </div>
            </div>
          </div>

          {errorText && (
            <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 border border-destructive/20 p-3 rounded-xl">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorText}</span>
            </div>
          )}
        </div>

        {/* Dispatch Parameters & Chunk Calculator */}
        <div className="rounded-2xl border bg-card p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              Dispatch Configuration
            </h3>

            <div className="space-y-2">
              <Label className="text-xs">Observation Window (Posted Within)</Label>
              <select
                value={postedWithinDays}
                onChange={(e) => setPostedWithinDays(Number(e.target.value))}
                className="w-full rounded-xl border bg-background px-3 py-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <option value={3}>Past 3 Days</option>
                <option value={7}>Past 7 Days (Recommended)</option>
                <option value={14}>Past 14 Days</option>
                <option value={30}>Past 30 Days</option>
              </select>
            </div>

            <div className="rounded-xl border bg-muted/40 p-3.5 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Roles Parsed:</span>
                <span className="font-semibold">{parsedItems.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Aptio Intent Limit:</span>
                <span className="font-semibold">{MAX_SEARCH_INTENTS_PER_DISPATCH} per batch</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-muted-foreground">Dispatches to Create:</span>
                <span className="font-bold text-primary">{chunkCount} dispatch{chunkCount === 1 ? "" : "es"}</span>
              </div>
            </div>
          </div>

          <Button
            type="button"
            disabled={parsedItems.length === 0 || isDispatching}
            onClick={handleExecuteDispatch}
            className="w-full h-11 gap-2 rounded-xl font-semibold shadow-sm"
          >
            {isDispatching ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Dispatching {chunkCount} Chunks...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Launch Pre-Warm Dispatches ({chunkCount})
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Execution Results Summary */}
      {lastResult && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
            <CheckCircle2 className="h-5 w-5" />
            <span>Pre-Warm Dispatches Successfully Launched!</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-xl border bg-background/80 p-3">
              <div className="text-xs text-muted-foreground">Total Roles</div>
              <div className="text-xl font-extrabold">{lastResult.totalRoles}</div>
            </div>
            <div className="rounded-xl border bg-background/80 p-3">
              <div className="text-xs text-muted-foreground">Unique Target Roles</div>
              <div className="text-xl font-extrabold text-primary">{lastResult.uniqueRoles}</div>
            </div>
            <div className="rounded-xl border bg-background/80 p-3">
              <div className="text-xs text-muted-foreground">Dispatches Created</div>
              <div className="text-xl font-extrabold text-emerald-600">{lastResult.successfulDispatches}</div>
            </div>
            <div className="rounded-xl border bg-background/80 p-3">
              <div className="text-xs text-muted-foreground">Failed Dispatches</div>
              <div className={`text-xl font-extrabold ${lastResult.failedDispatches > 0 ? "text-destructive" : "text-muted-foreground"}`}>
                {lastResult.failedDispatches}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-semibold text-muted-foreground">Dispatched Chunks Details:</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {lastResult.dispatches.map((d) => (
                <div
                  key={d.dispatchId}
                  className="rounded-lg border bg-background p-2.5 text-xs flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <div className="font-mono text-[11px] font-semibold text-primary truncate max-w-[200px]">
                      {d.dispatchId}
                    </div>
                    <div className="text-muted-foreground text-[11px]">
                      Chunk {d.chunkIndex + 1}/{d.chunkCount} &bull; {d.criteriaCount} intents
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      d.status === "ACKNOWLEDGED"
                        ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                        : "bg-destructive/10 text-destructive border border-destructive/20"
                    }`}
                  >
                    {d.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CSV Live Preview Table */}
      {parsedItems.length > 0 && (
        <div className="rounded-2xl border bg-card p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold">Parsed Role Targets Preview</h3>
              <p className="text-xs text-muted-foreground">
                Showing {filteredPreview.length} of {parsedItems.length} rows parsed from CSV
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search preview..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="pl-8 text-xs h-9 rounded-xl"
              />
            </div>
          </div>

          <div className="rounded-xl border overflow-hidden">
            <div className="max-h-72 overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="bg-muted/50 sticky top-0 border-b">
                  <tr className="text-left font-semibold text-muted-foreground">
                    <th className="py-2.5 px-4 w-12">#</th>
                    <th className="py-2.5 px-4">Role Query (Job Title)</th>
                    <th className="py-2.5 px-4">Work Mode</th>
                    <th className="py-2.5 px-4">Employment Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredPreview.map((item, idx) => (
                    <tr key={`${item.roleQuery}-${idx}`} className="hover:bg-muted/30 transition-colors">
                      <td className="py-2.5 px-4 font-mono text-muted-foreground text-[11px]">{idx + 1}</td>
                      <td className="py-2.5 px-4 font-medium text-foreground">{item.roleQuery}</td>
                      <td className="py-2.5 px-4">
                        {item.workMode ? (
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              item.workMode.toLowerCase().includes("remote")
                                ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                                : item.workMode.toLowerCase().includes("hybrid")
                                  ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                                  : "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                            }`}
                          >
                            {item.workMode}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-[11px]">Any / All</span>
                        )}
                      </td>
                      <td className="py-2.5 px-4">
                        {item.employmentType ? (
                          <span className="rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] font-semibold text-violet-600 border border-violet-500/20">
                            {item.employmentType}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-[11px]">Any / All</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Pre-Warm Dispatches History */}
      <div className="rounded-2xl border bg-card p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              Recent Pre-Warm Dispatches History
            </h3>
            <p className="text-xs text-muted-foreground">
              Audit trail of dispatches created through bulk CSV event preparation
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => refetchHistory()}
            disabled={isFetchingHistory}
            className="gap-2 text-xs h-8 rounded-xl"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetchingHistory ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {isLoadingHistory ? (
          <div className="text-xs text-muted-foreground p-6 text-center">Loading dispatch history...</div>
        ) : !historyData || historyData.length === 0 ? (
          <div className="rounded-xl border border-dashed p-8 text-center text-xs text-muted-foreground">
            No previous pre-warm dispatches found. Upload a CSV to start pre-warming.
          </div>
        ) : (
          <div className="rounded-xl border overflow-hidden">
            <div className="max-h-80 overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="bg-muted/50 sticky top-0 border-b">
                  <tr className="text-left font-semibold text-muted-foreground">
                    <th className="py-2.5 px-4">Dispatch ID</th>
                    <th className="py-2.5 px-4">Chunk</th>
                    <th className="py-2.5 px-4">Criteria Count</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4">Dispatched At</th>
                    <th className="py-2.5 px-4">Roles Sample</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {historyData.map((d) => (
                    <tr key={d.dispatchId} className="hover:bg-muted/30 transition-colors">
                      <td className="py-2.5 px-4 font-mono text-[11px] text-primary">{d.dispatchId.slice(0, 8)}...</td>
                      <td className="py-2.5 px-4 text-muted-foreground">
                        {typeof d.chunkIndex === "number" && typeof d.chunkCount === "number"
                          ? `${d.chunkIndex + 1} / ${d.chunkCount}`
                          : "1 / 1"}
                      </td>
                      <td className="py-2.5 px-4 font-semibold">{d.criteriaCount}</td>
                      <td className="py-2.5 px-4">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            d.status === "ACKNOWLEDGED" || d.status === "COMPLETED"
                              ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                              : d.status === "FAILED"
                                ? "bg-destructive/10 text-destructive border border-destructive/20"
                                : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                          }`}
                        >
                          {d.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-muted-foreground text-[11px]">
                        {new Date(d.createdAt).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-4 text-muted-foreground truncate max-w-xs text-[11px]">
                        {d.roles && d.roles.length > 0 ? d.roles.slice(0, 3).join(", ") : "—"}
                        {d.roles && d.roles.length > 3 ? ` (+${d.roles.length - 3} more)` : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
