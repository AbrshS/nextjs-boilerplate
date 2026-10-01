"use client";

import { X, Loader2, Users } from "lucide-react";
import { useListAdminPromoCodeRedemptionsQuery } from "@/domains/admin/api/admin.api";
import type { AdminPromoCode } from "@/domains/admin/types/admin.types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";

interface AdminPromoCodeRedemptionsModalProps {
  open: boolean;
  onClose: () => void;
  promoCode: AdminPromoCode | null;
}

export function AdminPromoCodeRedemptionsModal({
  open,
  onClose,
  promoCode,
}: AdminPromoCodeRedemptionsModalProps) {
  const { data, isLoading } = useListAdminPromoCodeRedemptionsQuery(
    { id: promoCode?.id ?? "", limit: 50 },
    { skip: !open || !promoCode?.id },
  );

  if (!open || !promoCode) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-card border border-border rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Users className="size-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">
                Redemption History: <span className="font-mono text-primary">{promoCode.code}</span>
              </h3>
              <p className="text-xs text-muted-foreground">
                Total Redemptions: {data?.total ?? promoCode.usedCount}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-muted-foreground">
              <Loader2 className="size-6 animate-spin mb-2" />
              <p className="text-xs">Loading redemption logs...</p>
            </div>
          ) : !data?.items?.length ? (
            <div className="py-12 text-center text-muted-foreground">
              <p className="text-sm font-medium">No redemptions yet</p>
              <p className="text-xs mt-1">This promo code has not been redeemed by any candidates.</p>
            </div>
          ) : (
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead className="text-xs font-semibold">Candidate</TableHead>
                    <TableHead className="text-xs font-semibold">Original</TableHead>
                    <TableHead className="text-xs font-semibold">Discount</TableHead>
                    <TableHead className="text-xs font-semibold">Final Paid</TableHead>
                    <TableHead className="text-xs font-semibold">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.map((redemption) => (
                    <TableRow key={redemption.id} className="hover:bg-muted/30">
                      <TableCell className="py-2.5">
                        <div className="font-medium text-xs text-foreground">
                          {redemption.user.fullName || "Candidate"}
                        </div>
                        <div className="text-[11px] text-muted-foreground font-mono">
                          {redemption.user.email}
                        </div>
                      </TableCell>
                      <TableCell className="py-2.5 text-xs text-muted-foreground">
                        {Number(redemption.originalAmount)} {redemption.currency}
                      </TableCell>
                      <TableCell className="py-2.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        -{Number(redemption.discountAmount)} {redemption.currency}
                      </TableCell>
                      <TableCell className="py-2.5 text-xs font-bold text-foreground">
                        {Number(redemption.finalAmount)} {redemption.currency}
                      </TableCell>
                      <TableCell className="py-2.5 text-[11px] text-muted-foreground whitespace-nowrap">
                        {new Date(redemption.createdAt).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        <div className="px-6 py-3 border-t border-border bg-muted/20 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium rounded-md border border-border bg-background hover:bg-muted transition-colors text-foreground"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
