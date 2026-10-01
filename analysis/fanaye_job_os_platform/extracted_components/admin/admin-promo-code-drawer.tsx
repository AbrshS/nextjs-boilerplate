"use client";

import { useEffect, useState } from "react";
import { Sparkles, X, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  useCreateAdminPromoCodeMutation,
  useUpdateAdminPromoCodeMutation,
  useListBillingPlansQuery,
} from "@/domains/admin/api/admin.api";
import type { AdminPromoCode } from "@/domains/admin/types/admin.types";
import toast from "react-hot-toast";

interface AdminPromoCodeDrawerProps {
  open: boolean;
  onClose: () => void;
  promoCode?: AdminPromoCode | null;
}

function generateClientCode(prefix = "TEF"): string {
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${code}`;
}

export function AdminPromoCodeDrawer({
  open,
  onClose,
  promoCode,
}: AdminPromoCodeDrawerProps) {
  const isEditing = Boolean(promoCode);
  const { data: plans } = useListBillingPlansQuery();
  const [createPromo, { isLoading: isCreating }] = useCreateAdminPromoCodeMutation();
  const [updatePromo, { isLoading: isUpdating }] = useUpdateAdminPromoCodeMutation();

  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState(20);
  const [planId, setPlanId] = useState<string>("");
  const [maxUses, setMaxUses] = useState<string>("");
  const [maxUsesPerUser, setMaxUsesPerUser] = useState<number>(1);
  const [startsAt, setStartsAt] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [featuredOnCard, setFeaturedOnCard] = useState(false);
  const [cardBadgeText, setCardBadgeText] = useState("");

  useEffect(() => {
    if (promoCode) {
      setCode(promoCode.code);
      setDescription(promoCode.description ?? "");
      setDiscountPercentage(promoCode.discountPercentage);
      setPlanId(promoCode.planId ?? "");
      setMaxUses(promoCode.maxUses !== null ? String(promoCode.maxUses) : "");
      setMaxUsesPerUser(promoCode.maxUsesPerUser ?? 1);
      setStartsAt(
        promoCode.startsAt ? new Date(promoCode.startsAt).toISOString().slice(0, 16) : "",
      );
      setExpiresAt(
        promoCode.expiresAt ? new Date(promoCode.expiresAt).toISOString().slice(0, 16) : "",
      );
      setIsActive(promoCode.isActive);
      setFeaturedOnCard(promoCode.featuredOnCard);
      setCardBadgeText(promoCode.cardBadgeText ?? "");
    } else {
      setCode(generateClientCode("TEF"));
      setDescription("");
      setDiscountPercentage(20);
      setPlanId("");
      setMaxUses("");
      setMaxUsesPerUser(1);
      setStartsAt("");
      setExpiresAt("");
      setIsActive(true);
      setFeaturedOnCard(false);
      setCardBadgeText("Save 20% with code");
    }
  }, [promoCode, open]);

  if (!open) return null;

  const handleGenerateCode = () => {
    setCode(generateClientCode("TEF"));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      toast.error("Please enter or generate a promo code.");
      return;
    }
    if (discountPercentage < 1 || discountPercentage > 100) {
      toast.error("Discount percentage must be between 1 and 100.");
      return;
    }

    try {
      if (isEditing && promoCode) {
        await updatePromo({
          id: promoCode.id,
          body: {
            description: description.trim() || undefined,
            discountPercentage,
            planId: planId.trim() ? planId : null,
            maxUses: maxUses.trim() ? Number(maxUses) : null,
            maxUsesPerUser,
            startsAt: startsAt ? new Date(startsAt).toISOString() : null,
            expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
            isActive,
            featuredOnCard,
            cardBadgeText: cardBadgeText.trim() || null,
          },
        }).unwrap();
        toast.success(`Promo code ${promoCode.code} updated successfully`);
      } else {
        await createPromo({
          code: code.trim().toUpperCase(),
          description: description.trim() || undefined,
          discountPercentage,
          planId: planId.trim() ? planId : undefined,
          maxUses: maxUses.trim() ? Number(maxUses) : undefined,
          maxUsesPerUser,
          startsAt: startsAt ? new Date(startsAt).toISOString() : undefined,
          expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
          isActive,
          featuredOnCard,
          cardBadgeText: cardBadgeText.trim() || undefined,
        }).unwrap();
        toast.success(`Promo code ${code.toUpperCase()} created successfully`);
      }
      onClose();
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || "Failed to save promo code";
      toast.error(typeof msg === "string" ? msg : "An error occurred");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-card border-l border-border h-full flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-muted/20">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              {isEditing ? `Edit Promo Code: ${promoCode?.code}` : "Create Promo Code"}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Configure discount percentage, plan rules, and redemption limits.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Promo Code Input & Generator */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="promo-code" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Promo Code
              </Label>
              {!isEditing && (
                <button
                  type="button"
                  onClick={handleGenerateCode}
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                >
                  <RefreshCw className="size-3" /> Generate Code
                </button>
              )}
            </div>
            <div className="relative">
              <Input
                id="promo-code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                disabled={isEditing}
                placeholder="e.g. WELCOME20 or TEF-8X2K9P"
                className="font-mono text-sm tracking-wider font-semibold uppercase pr-10"
                maxLength={50}
                required
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-muted-foreground">
                {discountPercentage}% OFF
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="promo-desc" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Description / Campaign Note
            </Label>
            <Input
              id="promo-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. 20% discount for Q4 promotion"
              maxLength={255}
            />
          </div>

          {/* Discount Percentage */}
          <div className="space-y-3 rounded-lg border border-border p-4 bg-muted/10">
            <div className="flex items-center justify-between">
              <Label htmlFor="promo-discount" className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Discount Percentage
              </Label>
              <span className="inline-flex items-center rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                {discountPercentage}%
              </span>
            </div>
            <input
              id="promo-discount"
              type="range"
              min="1"
              max="100"
              step="1"
              value={discountPercentage}
              onChange={(e) => setDiscountPercentage(Number(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-muted-foreground font-mono">
              <span>5%</span>
              <span>20%</span>
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Target Plan Selection */}
          <div className="space-y-2">
            <Label htmlFor="promo-plan" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Applicable Plan
            </Label>
            <select
              id="promo-plan"
              value={planId}
              onChange={(e) => setPlanId(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">All Paid Plans (Global)</option>
              {plans?.map((plan) => (
                <option key={plan.planId} value={plan.planId}>
                  {plan.planName || plan.planCode} ({plan.planCode})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-muted-foreground">
              Restrict discount to a specific plan (e.g. Pro Plan) or allow on any paid plan.
            </p>
          </div>

          {/* Max Uses & Limit Per User */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="promo-max-uses" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Global Limit
              </Label>
              <Input
                id="promo-max-uses"
                type="number"
                min="1"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                placeholder="Unlimited"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="promo-user-limit" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Per-User Limit
              </Label>
              <Input
                id="promo-user-limit"
                type="number"
                min="1"
                value={maxUsesPerUser}
                onChange={(e) => setMaxUsesPerUser(Number(e.target.value) || 1)}
              />
            </div>
          </div>

          {/* Date Validity Bounds */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="promo-start" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Starts At
              </Label>
              <Input
                id="promo-start"
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="promo-expires" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Expires At
              </Label>
              <Input
                id="promo-expires"
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
            </div>
          </div>

          {/* Featured on Pricing Card Switch */}
          <div className="rounded-lg border border-border p-4 bg-muted/10 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="promo-featured" className="text-sm font-medium text-foreground flex items-center gap-1.5">
                  <Sparkles className="size-4 text-amber-500" /> Feature on Pricing Card
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Displays an interactive promotional discount badge on eligible plan cards.
                </p>
              </div>
              <input
                id="promo-featured"
                type="checkbox"
                checked={featuredOnCard}
                onChange={(e) => setFeaturedOnCard(e.target.checked)}
                className="size-4 rounded accent-primary cursor-pointer"
              />
            </div>
            {featuredOnCard && (
              <div className="pt-2 border-t border-border/60">
                <Label htmlFor="promo-badge" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Badge Tag Copy
                </Label>
                <Input
                  id="promo-badge"
                  value={cardBadgeText}
                  onChange={(e) => setCardBadgeText(e.target.value)}
                  placeholder="e.g. Save 20% with code WELCOME20"
                  className="mt-1.5 text-xs"
                />
              </div>
            )}
          </div>

          {/* Active Status Toggle */}
          <div className="flex items-center justify-between rounded-lg border border-border p-4 bg-muted/10">
            <div>
              <Label htmlFor="promo-active" className="text-sm font-medium text-foreground">
                Active Status
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Disable to temporarily pause redemptions without deleting the code.
              </p>
            </div>
            <input
              id="promo-active"
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="size-4 rounded accent-primary cursor-pointer"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose} disabled={isCreating || isUpdating}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating || isUpdating} className="min-w-[120px]">
              {isCreating || isUpdating ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Saving...
                </>
              ) : isEditing ? (
                "Update Code"
              ) : (
                "Create Promo Code"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
