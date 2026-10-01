"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  Tag,
  Sparkles,
  Users,
  Edit2,
  Trash2,
  Power,
  Loader2,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Badge } from "@/shared/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import {
  useListAdminPromoCodesQuery,
  useUpdateAdminPromoCodeMutation,
  useDeleteAdminPromoCodeMutation,
} from "@/domains/admin/api/admin.api";
import type { AdminPromoCode } from "@/domains/admin/types/admin.types";
import { AdminPromoCodeDrawer } from "./admin-promo-code-drawer";
import { AdminPromoCodeRedemptionsModal } from "./admin-promo-code-redemptions-modal";
import toast from "react-hot-toast";

export function AdminPromoCodeTab() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedPromo, setSelectedPromo] = useState<AdminPromoCode | null>(null);

  const [redemptionsModalOpen, setRedemptionsModalOpen] = useState(false);
  const [redemptionsPromo, setRedemptionsPromo] = useState<AdminPromoCode | null>(null);

  const { data, isLoading, isFetching } = useListAdminPromoCodesQuery({
    page,
    limit: 20,
    search: search.trim() || undefined,
    status: statusFilter,
  });

  const [updatePromo] = useUpdateAdminPromoCodeMutation();
  const [deletePromo] = useDeleteAdminPromoCodeMutation();

  const handleCreate = () => {
    setSelectedPromo(null);
    setDrawerOpen(true);
  };

  const handleEdit = (promo: AdminPromoCode) => {
    setSelectedPromo(promo);
    setDrawerOpen(true);
  };

  const handleViewRedemptions = (promo: AdminPromoCode) => {
    setRedemptionsPromo(promo);
    setRedemptionsModalOpen(true);
  };

  const handleToggleStatus = async (promo: AdminPromoCode) => {
    try {
      await updatePromo({
        id: promo.id,
        body: { isActive: !promo.isActive },
      }).unwrap();
      toast.success(
        `Promo code ${promo.code} ${!promo.isActive ? "activated" : "deactivated"}`,
      );
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (promo: AdminPromoCode) => {
    if (!confirm(`Are you sure you want to delete promo code "${promo.code}"?`)) {
      return;
    }
    try {
      await deletePromo(promo.id).unwrap();
      toast.success(`Promo code ${promo.code} deleted`);
    } catch {
      toast.error("Failed to delete promo code");
    }
  };

  const isExpired = (promo: AdminPromoCode) => {
    return promo.expiresAt && new Date(promo.expiresAt) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Tag className="size-5 text-primary" /> Promo Code Discount Engine
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Create, configure, and manage standard or custom discount codes for candidate plans.
          </p>
        </div>
        <Button onClick={handleCreate} className="self-start sm:self-auto gap-1.5 shadow-xs">
          <Plus className="size-4" /> Create Promo Code
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search promo codes..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(["ALL", "ACTIVE", "INACTIVE", "EXPIRED"] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => {
                setStatusFilter(status);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                statusFilter === status
                  ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {status === "ALL"
                ? "All Codes"
                : status === "ACTIVE"
                  ? "Active"
                  : status === "INACTIVE"
                    ? "Inactive"
                    : "Expired"}
            </button>
          ))}
        </div>
      </div>

      {/* Table Section */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="text-xs font-semibold">Code</TableHead>
              <TableHead className="text-xs font-semibold">Discount</TableHead>
              <TableHead className="text-xs font-semibold">Target Plan</TableHead>
              <TableHead className="text-xs font-semibold">Redemptions</TableHead>
              <TableHead className="text-xs font-semibold">Featured</TableHead>
              <TableHead className="text-xs font-semibold">Status</TableHead>
              <TableHead className="text-xs font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="py-16 text-center text-muted-foreground">
                  <Loader2 className="size-6 animate-spin mx-auto mb-2" />
                  <p className="text-xs">Loading promo codes...</p>
                </TableCell>
              </TableRow>
            ) : !data?.items?.length ? (
              <TableRow>
                <TableCell colSpan={7} className="py-16 text-center text-muted-foreground">
                  <Tag className="size-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm font-semibold text-foreground">No promo codes found</p>
                  <p className="text-xs mt-0.5">
                    {search ? "No codes match your search query." : "Get started by generating your first promo code."}
                  </p>
                  {!search && (
                    <Button variant="outline" size="sm" onClick={handleCreate} className="mt-4 gap-1">
                      <Plus className="size-3.5" /> Create Promo Code
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              data.items.map((promo) => {
                const expired = isExpired(promo);
                const percentUsed = promo.maxUses
                  ? Math.min(100, Math.round((promo.usedCount / promo.maxUses) * 100))
                  : null;

                return (
                  <TableRow key={promo.id} className="hover:bg-muted/25 transition-colors">
                    {/* Promo Code & Description */}
                    <TableCell className="py-3 font-medium">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold tracking-wider px-2.5 py-1 rounded bg-muted text-foreground border border-border/80">
                          {promo.code}
                        </span>
                      </div>
                      {promo.description && (
                        <p className="text-[11px] text-muted-foreground mt-1 line-clamp-1">
                          {promo.description}
                        </p>
                      )}
                    </TableCell>

                    {/* Discount % */}
                    <TableCell className="py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25">
                        {promo.discountPercentage}% OFF
                      </span>
                    </TableCell>

                    {/* Target Plan */}
                    <TableCell className="py-3 text-xs text-foreground">
                      {promo.plan ? (
                        <span className="font-medium">{promo.plan.planName}</span>
                      ) : (
                        <span className="text-muted-foreground italic">All Paid Plans</span>
                      )}
                    </TableCell>

                    {/* Redemptions */}
                    <TableCell className="py-3">
                      <div className="space-y-1 max-w-[130px]">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-foreground">{promo.usedCount}</span>
                          <span className="text-muted-foreground text-[11px]">
                            {promo.maxUses ? `/ ${promo.maxUses}` : "uses"}
                          </span>
                        </div>
                        {percentUsed !== null && (
                          <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                percentUsed >= 100
                                  ? "bg-rose-500"
                                  : percentUsed >= 75
                                    ? "bg-amber-500"
                                    : "bg-primary"
                              }`}
                              style={{ width: `${percentUsed}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* Featured On Card */}
                    <TableCell className="py-3">
                      {promo.featuredOnCard ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full">
                          <Sparkles className="size-3" /> Featured
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>

                    {/* Status Badge */}
                    <TableCell className="py-3">
                      {expired ? (
                        <Badge variant="outline" className="text-rose-600 border-rose-500/30 bg-rose-500/10 text-[11px]">
                          <Clock className="size-3 mr-1" /> Expired
                        </Badge>
                      ) : promo.isActive ? (
                        <Badge variant="outline" className="text-emerald-600 border-emerald-500/30 bg-emerald-500/10 text-[11px]">
                          <CheckCircle2 className="size-3 mr-1" /> Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground border-border bg-muted/40 text-[11px]">
                          Paused
                        </Badge>
                      )}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewRedemptions(promo)}
                          title="View Redemptions"
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                        >
                          <Users className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(promo)}
                          title={promo.isActive ? "Deactivate" : "Activate"}
                          className={`h-8 w-8 p-0 ${promo.isActive ? "text-muted-foreground hover:text-amber-600" : "text-emerald-600 hover:text-emerald-700"}`}
                        >
                          <Power className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(promo)}
                          title="Edit Code"
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                        >
                          <Edit2 className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(promo)}
                          title="Delete Code"
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-rose-600"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Drawers and Modals */}
      <AdminPromoCodeDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        promoCode={selectedPromo}
      />

      <AdminPromoCodeRedemptionsModal
        open={redemptionsModalOpen}
        onClose={() => setRedemptionsModalOpen(false)}
        promoCode={redemptionsPromo}
      />
    </div>
  );
}
