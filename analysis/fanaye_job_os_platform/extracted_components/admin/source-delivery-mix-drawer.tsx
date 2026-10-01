"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Globe, Plus, RefreshCw, Scale, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import {
  usePublishAdminSourceDeliveryPolicyMutation,
  useSaveAdminSourceDeliveryPolicyDraftMutation,
} from "@/domains/admin/api/admin.api";
import type {
  AdminSourceDeliveryPolicyOverview,
  SourceDeliveryPolicyEntry,
} from "@/domains/admin/types/admin.types";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/shared/ui/sheet";
import { Switch } from "@/shared/ui/switch";

interface SourceDeliveryMixDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  overview?: AdminSourceDeliveryPolicyOverview;
  onSuccess?: () => void;
}

export function SourceDeliveryMixDrawer({
  open,
  onOpenChange,
  overview,
  onSuccess,
}: SourceDeliveryMixDrawerProps) {
  const [saveDraft, { isLoading: isSavingDraft }] =
    useSaveAdminSourceDeliveryPolicyDraftMutation();
  const [publishPolicy, { isLoading: isPublishing }] =
    usePublishAdminSourceDeliveryPolicyMutation();

  const [policyName, setPolicyName] = useState("");
  const [entries, setEntries] = useState<SourceDeliveryPolicyEntry[]>([]);

  // Initialize form when opening or when overview data updates
  useEffect(() => {
    if (!open) return;

    const sourceData =
      overview?.draftPolicy?.entries && overview.draftPolicy.entries.length > 0
        ? overview.draftPolicy
        : overview?.activePolicy;

    setPolicyName(sourceData?.name || overview?.draftPolicy?.name || "");

    if (sourceData?.entries && sourceData.entries.length > 0) {
      setEntries(
        sourceData.entries.map((e) => ({
          id: e.id,
          sourceCode: e.sourceCode.toUpperCase(),
          targetPercentage: Number(e.targetPercentage) || 0,
          minPercentage: Number(e.minPercentage) || 0,
          maxPercentage: Number(e.maxPercentage) || 100,
          isFallback: Boolean(e.isFallback),
        })),
      );
    } else if (overview?.availableSources && overview.availableSources.length > 0) {
      // Default initial split if no entries exist
      const count = overview.availableSources.length;
      const base = Math.floor(100 / count);
      const remainder = 100 % count;
      setEntries(
        overview.availableSources.map((sourceCode, index) => ({
          sourceCode: sourceCode.toUpperCase(),
          targetPercentage: index === 0 ? base + remainder : base,
          minPercentage: 0,
          maxPercentage: 100,
          isFallback: false,
        })),
      );
    }
  }, [open, overview]);

  // Primary sources distribute the 100% target quota
  const primaryEntries = useMemo(() => entries.filter((e) => !e.isFallback), [entries]);
  const fallbackEntries = useMemo(() => entries.filter((e) => e.isFallback), [entries]);

  // Current live sum of target percentages across primary sources
  const totalTargetPercentage = useMemo(() => {
    return primaryEntries.reduce((acc, curr) => acc + (Number(curr.targetPercentage) || 0), 0);
  }, [primaryEntries]);

  // Validation state
  const hasRangeErrors = useMemo(() => {
    return entries.some(
      (e) =>
        e.minPercentage > e.targetPercentage ||
        e.targetPercentage > e.maxPercentage ||
        e.minPercentage > e.maxPercentage ||
        e.targetPercentage < 0 ||
        e.targetPercentage > 100,
    );
  }, [entries]);

  const isBalanced = totalTargetPercentage === 100;
  const canPublish = isBalanced && !hasRangeErrors && primaryEntries.length > 0;

  // Recommended Global Remote & Quality Tech Preset
  const RECOMMENDED_GLOBAL_PRESET: Record<
    string,
    { target: number; min: number; max: number; isFallback: boolean }
  > = {
    LINKEDIN: { target: 25, min: 10, max: 50, isFallback: false },
    UPWORK: { target: 15, min: 5, max: 40, isFallback: false },
    REMOTE_OK: { target: 10, min: 5, max: 30, isFallback: false },
    WE_WORK_REMOTELY: { target: 10, min: 5, max: 30, isFallback: false },
    GREENHOUSE: { target: 8, min: 0, max: 25, isFallback: false },
    ASHBY: { target: 8, min: 0, max: 25, isFallback: false },
    HIMALAYAS: { target: 6, min: 0, max: 20, isFallback: false },
    LEVER: { target: 5, min: 0, max: 20, isFallback: false },
    INDEED: { target: 5, min: 0, max: 25, isFallback: false },
    GOOGLE_JOBS: { target: 4, min: 0, max: 20, isFallback: false },
    ETHIOJOBS: { target: 2, min: 0, max: 15, isFallback: false },
    AFRIWORK: { target: 2, min: 0, max: 15, isFallback: false },
  };

  const handleApplyGlobalRemotePreset = () => {
    setPolicyName("Global Remote & Tech Focus (Recommended)");
    setEntries((prev) =>
      prev.map((entry) => {
        const code = entry.sourceCode.toUpperCase();
        const preset = RECOMMENDED_GLOBAL_PRESET[code];
        if (preset) {
          return {
            ...entry,
            targetPercentage: preset.target,
            minPercentage: preset.min,
            maxPercentage: preset.max,
            isFallback: preset.isFallback,
          };
        }
        return {
          ...entry,
          targetPercentage: 0,
          minPercentage: 0,
          maxPercentage: 100,
          isFallback: true,
        };
      }),
    );
    toast.success(
      "Applied Global Remote & Tech Focus preset (100% balanced with 15 fallback scrapers).",
    );
  };

  // Auto-balance evenly across primary (non-fallback) sources
  const handleAutoBalance = () => {
    const targetPrimary = entries.filter((e) => !e.isFallback);
    if (targetPrimary.length === 0) {
      toast.error("At least one source must not be marked as a fallback to auto-balance.");
      return;
    }
    const count = targetPrimary.length;
    const base = Math.floor(100 / count);
    const remainder = 100 % count;

    let primaryIndex = 0;
    setEntries((prev) =>
      prev.map((entry) => {
        if (entry.isFallback) {
          return {
            ...entry,
            targetPercentage: 0,
            minPercentage: 0,
            maxPercentage: Math.max(10, entry.maxPercentage),
          };
        }

        const target = primaryIndex === 0 ? base + remainder : base;
        primaryIndex++;
        return {
          ...entry,
          targetPercentage: target,
          minPercentage: Math.min(entry.minPercentage, target),
          maxPercentage: Math.max(entry.maxPercentage, target),
        };
      }),
    );
    toast.success("Auto-balanced primary target delivery percentages to 100%.");
  };

  // Reset to published active policy
  const handleResetToPublished = () => {
    if (!overview?.activePolicy?.entries) return;
    setPolicyName(overview.activePolicy.name || "");
    setEntries(
      overview.activePolicy.entries.map((e) => ({
        id: e.id,
        sourceCode: e.sourceCode.toUpperCase(),
        targetPercentage: Number(e.targetPercentage) || 0,
        minPercentage: Number(e.minPercentage) || 0,
        maxPercentage: Number(e.maxPercentage) || 100,
        isFallback: Boolean(e.isFallback),
      })),
    );
    toast.success("Reset inputs to active published policy.");
  };

  // Available sources not yet in list
  const unusedSources = useMemo(() => {
    const existing = new Set(entries.map((e) => e.sourceCode));
    return (overview?.availableSources || []).filter((s) => !existing.has(s.toUpperCase()));
  }, [entries, overview?.availableSources]);

  const handleAddSource = (sourceCode: string) => {
    setEntries((prev) => [
      ...prev,
      {
        sourceCode: sourceCode.toUpperCase(),
        targetPercentage: 0,
        minPercentage: 0,
        maxPercentage: 100,
        isFallback: false,
      },
    ]);
  };

  const handleRemoveSource = (indexToRemove: number) => {
    if (entries.length <= 1) {
      toast.error("At least one job source must remain in the delivery mix.");
      return;
    }
    setEntries((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleUpdateEntry = (
    index: number,
    field: keyof SourceDeliveryPolicyEntry,
    value: number | boolean,
  ) => {
    setEntries((prev) =>
      prev.map((entry, idx) => {
        if (idx !== index) return entry;
        return { ...entry, [field]: value };
      }),
    );
  };

  // Save Draft (sum doesn't need to be 100%)
  const handleSaveDraft = async () => {
    try {
      await saveDraft({
        name: policyName.trim() || undefined,
        entries: entries.map((e) => ({
          sourceCode: e.sourceCode,
          targetPercentage: Math.max(0, Math.min(100, Number(e.targetPercentage) || 0)),
          minPercentage: Math.max(0, Math.min(100, Number(e.minPercentage) || 0)),
          maxPercentage: Math.max(0, Math.min(100, Number(e.maxPercentage) || 100)),
          isFallback: Boolean(e.isFallback),
        })),
      }).unwrap();

      toast.success("Delivery mix draft saved successfully.");
      onSuccess?.();
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Failed to save delivery policy draft.");
    }
  };

  // Publish (must sum to 100% and have valid ranges)
  const handlePublish = async () => {
    if (!canPublish) {
      if (!isBalanced) {
        toast.error(`Target delivery percentages sum to ${totalTargetPercentage}%. Must equal exactly 100% to publish.`);
      } else if (hasRangeErrors) {
        toast.error("Please ensure minimum % is not greater than target % and target % is not greater than maximum %.");
      }
      return;
    }

    try {
      await publishPolicy({
        name: policyName.trim() || undefined,
        entries: entries.map((e) => ({
          sourceCode: e.sourceCode,
          targetPercentage: Number(e.targetPercentage),
          minPercentage: Number(e.minPercentage),
          maxPercentage: Number(e.maxPercentage),
          isFallback: Boolean(e.isFallback),
        })),
      }).unwrap();

      toast.success("Delivery mix policy published successfully.");
      onOpenChange(false);
      onSuccess?.();
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Failed to publish delivery policy.");
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-xl md:max-w-2xl"
      >
        {/* Header */}
        <SheetHeader className="shrink-0 border-b bg-background p-5 md:p-6">
          <div className="flex items-center gap-2">
            <Scale className="size-5 text-primary" aria-hidden="true" />
            <SheetTitle className="text-xl font-bold">Configure Delivery Mix</SheetTitle>
          </div>
          <SheetDescription className="text-xs text-muted-foreground">
            Set target delivery distribution quotas, min/max bounds, and fallback rules for candidate job
            recommendations. Published policy must sum to exactly 100%.
          </SheetDescription>
        </SheetHeader>

        {/* Scrollable Form Content */}
        <div className="flex-1 space-y-5 overflow-y-auto p-5 md:p-6">
          {/* Policy Name */}
          <div className="space-y-1.5">
            <Label htmlFor="policyName" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Policy Name / Description (Optional)
            </Label>
            <Input
              id="policyName"
              placeholder="e.g. Standard Diversity Mix Q4"
              value={policyName}
              onChange={(e) => setPolicyName(e.target.value)}
              className="bg-card"
            />
          </div>

          {/* Live Sum Calculation Banner */}
          <div
            className={`rounded-xl border p-4 transition-colors ${
              isBalanced
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                : totalTargetPercentage < 100
                  ? "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                  : "border-destructive/30 bg-destructive/10 text-destructive"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-medium">
                {isBalanced ? (
                  <>
                    <CheckCircle2 className="size-5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                    <span>Balanced Allocation: 100% Delivery Quota</span>
                  </>
                ) : totalTargetPercentage < 100 ? (
                  <>
                    <AlertCircle className="size-5 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                    <span>
                      {100 - totalTargetPercentage}% Remaining to reach 100%
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="size-5 shrink-0 text-destructive" aria-hidden="true" />
                    <span>
                      Over-allocated by {totalTargetPercentage - 100}%. Must equal 100%
                    </span>
                  </>
                )}
              </div>
              <Badge
                variant={isBalanced ? "default" : "secondary"}
                className={`font-mono text-sm font-bold ${
                  isBalanced
                    ? "bg-emerald-600 text-white dark:bg-emerald-500"
                    : ""
                }`}
              >
                {totalTargetPercentage}% / 100%
              </Badge>
            </div>
            {hasRangeErrors ? (
              <p className="mt-2 text-xs text-destructive">
                Invalid range: Ensure minimum % is not greater than target % and target % is not greater than maximum %.
              </p>
            ) : null}
            {fallbackEntries.length > 0 ? (
              <p className="mt-2 text-xs text-muted-foreground">
                Note: {fallbackEntries.length} source{fallbackEntries.length > 1 ? "s are" : " is"} designated as reserve fallback (activated when primary supply is exhausted). Primary sources must sum to 100%.
              </p>
            ) : null}
          </div>

          {/* Quick Helper Tools */}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-muted/40 p-2.5 text-xs text-muted-foreground">
            <span className="font-medium">Quick Distribution Actions:</span>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-xs border-primary/40 bg-primary/5 text-primary hover:bg-primary/10"
                onClick={handleApplyGlobalRemotePreset}
              >
                <Globe className="mr-1.5 size-3.5" aria-hidden="true" />
                Global Remote Preset
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={handleAutoBalance}
              >
                <Scale className="mr-1.5 size-3.5" aria-hidden="true" />
                Auto-Balance Evenly
              </Button>
              {overview?.activePolicy?.entries ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={handleResetToPublished}
                >
                  <RefreshCw className="mr-1.5 size-3.5" aria-hidden="true" />
                  Reset to Active
                </Button>
              ) : null}
            </div>
          </div>

          {/* Unused catalog sources to add */}
          {unusedSources.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-dashed p-3">
              <span className="text-xs text-muted-foreground">Available sources to add:</span>
              {unusedSources.map((sourceCode) => (
                <Button
                  key={sourceCode}
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-7 gap-1 text-xs"
                  onClick={() => handleAddSource(sourceCode)}
                >
                  <Plus className="size-3" aria-hidden="true" />
                  {sourceCode}
                </Button>
              ))}
            </div>
          ) : null}

          {/* Per-source configuration cards */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Source Quotas & Bounds ({entries.length})
            </p>

            {entries.map((entry, index) => {
              const entryRangeInvalid =
                entry.minPercentage > entry.targetPercentage ||
                entry.targetPercentage > entry.maxPercentage;

              return (
                <div
                  key={entry.sourceCode}
                  className={`rounded-xl border bg-card p-4 shadow-xs transition-colors ${
                    entryRangeInvalid ? "border-destructive/50" : ""
                  }`}
                >
                  {/* Card Header: Source & Fallback toggle */}
                  <div className="mb-3 flex items-center justify-between border-b pb-2.5">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-xs font-bold tracking-wider">
                        {entry.sourceCode}
                      </Badge>
                      {entry.isFallback ? (
                        <Badge variant="secondary" className="text-[10px]">
                          Fallback
                        </Badge>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Label
                          htmlFor={`fallback-${entry.sourceCode}`}
                          className="text-xs text-muted-foreground cursor-pointer"
                        >
                          Fallback source
                        </Label>
                        <Switch
                          id={`fallback-${entry.sourceCode}`}
                          checked={entry.isFallback}
                          onCheckedChange={(checked) =>
                            handleUpdateEntry(index, "isFallback", checked)
                          }
                        />
                      </div>

                      {entries.length > 1 ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => handleRemoveSource(index)}
                          title="Remove source from mix"
                        >
                          <Trash2 className="size-3.5" aria-hidden="true" />
                        </Button>
                      ) : null}
                    </div>
                  </div>

                  {/* Input Grid: Target %, Min %, Max % */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor={`target-${entry.sourceCode}`}
                          className="text-xs font-medium"
                        >
                          Target Delivery
                        </Label>
                        <span className="font-mono text-xs font-bold text-primary">
                          {entry.targetPercentage}%
                        </span>
                      </div>
                      <Input
                        id={`target-${entry.sourceCode}`}
                        type="number"
                        min={0}
                        max={100}
                        value={entry.targetPercentage}
                        onChange={(e) =>
                          handleUpdateEntry(
                            index,
                            "targetPercentage",
                            Number(e.target.value) || 0,
                          )
                        }
                        className="bg-background font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor={`min-${entry.sourceCode}`}
                          className="text-xs text-muted-foreground"
                        >
                          Min Bound
                        </Label>
                        <span className="font-mono text-xs text-muted-foreground">
                          {entry.minPercentage}%
                        </span>
                      </div>
                      <Input
                        id={`min-${entry.sourceCode}`}
                        type="number"
                        min={0}
                        max={100}
                        value={entry.minPercentage}
                        onChange={(e) =>
                          handleUpdateEntry(
                            index,
                            "minPercentage",
                            Number(e.target.value) || 0,
                          )
                        }
                        className="bg-background font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor={`max-${entry.sourceCode}`}
                          className="text-xs text-muted-foreground"
                        >
                          Max Bound
                        </Label>
                        <span className="font-mono text-xs text-muted-foreground">
                          {entry.maxPercentage}%
                        </span>
                      </div>
                      <Input
                        id={`max-${entry.sourceCode}`}
                        type="number"
                        min={0}
                        max={100}
                        value={entry.maxPercentage}
                        onChange={(e) =>
                          handleUpdateEntry(
                            index,
                            "maxPercentage",
                            Number(e.target.value) || 0,
                          )
                        }
                        className="bg-background font-mono"
                      />
                    </div>
                  </div>

                  {entryRangeInvalid ? (
                    <p className="mt-2 text-[11px] text-destructive">
                      Target must be between minimum ({entry.minPercentage}%) and maximum ({entry.maxPercentage}%).
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer actions */}
        <SheetFooter className="shrink-0 border-t bg-background p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Total:</span>
            <Badge
              variant={isBalanced ? "default" : "secondary"}
              className={`font-mono text-xs ${
                isBalanced ? "bg-emerald-600 text-white" : ""
              }`}
            >
              {totalTargetPercentage}%
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={isSavingDraft || isPublishing}
              onClick={handleSaveDraft}
            >
              {isSavingDraft ? "Saving..." : "Save Draft"}
            </Button>
            <Button
              type="button"
              variant="default"
              size="sm"
              disabled={!canPublish || isPublishing || isSavingDraft}
              onClick={handlePublish}
            >
              {isPublishing ? "Publishing..." : "Publish Policy"}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
