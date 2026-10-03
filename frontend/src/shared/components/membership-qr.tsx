"use client";

import * as React from "react";
import { QrCodeIcon, ShieldCheckIcon, AlertTriangleIcon, Maximize2Icon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/shared/ui/dialog";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { cn } from "@/shared/utils/cn";

interface MembershipQRProps {
  memberId: string;
  memberName: string;
  membershipTier?: "Enterprise" | "Platinum" | "Professional" | "Developer";
  status?: "ACTIVE" | "SUSPENDED" | "EXPIRED";
  expiresAt?: string;
  className?: string;
}

/**
 * Procedural SVG QR Matrix pattern based on deterministic string hash
 * Renders an authentic looking high-density QR grid without external bundle weight.
 */
function DeterministicQRMatrix({
  value,
  size = 180,
  halo = "emerald",
}: {
  value: string;
  size?: number;
  halo?: "emerald" | "amber" | "rose";
}) {
  const cells = React.useMemo(() => {
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      hash = (hash << 5) - hash + value.charCodeAt(i);
      hash |= 0;
    }

    const gridSize = 21; // standard version 1 QR matrix size
    const matrix: boolean[][] = Array.from({ length: gridSize }, () =>
      Array(gridSize).fill(false)
    );

    // Seed positional marker squares (top-left, top-right, bottom-left)
    const drawFinderPattern = (row: number, col: number) => {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          if (
            r === 0 ||
            r === 6 ||
            c === 0 ||
            c === 6 ||
            (r >= 2 && r <= 4 && c >= 2 && c <= 4)
          ) {
            matrix[row + r][col + c] = true;
          }
        }
      }
    };

    drawFinderPattern(0, 0);
    drawFinderPattern(0, gridSize - 7);
    drawFinderPattern(gridSize - 7, 0);

    // Deterministic pseudo-random fill based on hash
    let seed = Math.abs(hash);
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        // Skip finder areas
        const inFinder =
          (r < 8 && c < 8) ||
          (r < 8 && c >= gridSize - 8) ||
          (r >= gridSize - 8 && c < 8);
        if (!inFinder) {
          seed = (seed * 1103515245 + 12345) & 0x7fffffff;
          matrix[r][c] = seed % 3 === 0 || seed % 5 === 0;
        }
      }
    }

    return matrix;
  }, [value]);

  const gridSize = 21;
  const cellSize = size / gridSize;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="rounded-lg bg-white p-2"
    >
      {cells.map((row, r) =>
        row.map((active, c) =>
          active ? (
            <rect
              key={`${r}-${c}`}
              x={c * cellSize}
              y={r * cellSize}
              width={cellSize - 0.5}
              height={cellSize - 0.5}
              rx={cellSize > 8 ? 1.5 : 0.8}
              className={
                halo === "emerald"
                  ? "fill-slate-900"
                  : halo === "amber"
                  ? "fill-amber-950"
                  : "fill-rose-950"
              }
            />
          ) : null
        )
      )}
    </svg>
  );
}

export function MembershipQR({
  memberId,
  memberName,
  membershipTier = "Enterprise",
  status = "ACTIVE",
  expiresAt = "2027-12-31",
  className,
}: MembershipQRProps) {
  const [zoomOpen, setZoomOpen] = React.useState(false);

  const isActive = status === "ACTIVE";
  const haloColor = isActive ? "emerald" : status === "SUSPENDED" ? "amber" : "rose";

  return (
    <>
      <Card
        className={cn(
          "relative overflow-hidden transition-all duration-200 border-border/70 hover:border-foreground/20",
          className
        )}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex flex-col gap-0.5">
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
              <QrCodeIcon className="size-4 text-primary" />
              Digital Pass
            </CardTitle>
            <CardDescription className="text-xs">
              Instant physical terminal check-in
            </CardDescription>
          </div>
          <Badge
            variant={isActive ? "secondary" : "destructive"}
            className={cn(
              "font-mono text-[10px] uppercase tracking-wider",
              isActive && "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
            )}
          >
            {status}
          </Badge>
        </CardHeader>

        <CardContent className="flex flex-col items-center justify-center py-4">
          {/* QR Container with Active / Inactive Neon Halo Ring */}
          <div
            onClick={() => setZoomOpen(true)}
            className={cn(
              "group/qr relative cursor-pointer rounded-2xl p-3 transition-transform duration-200 hover:scale-[1.02]",
              isActive
                ? "bg-emerald-500/5 ring-2 ring-emerald-500/30"
                : "bg-destructive/5 ring-2 ring-destructive/30"
            )}
          >
            <DeterministicQRMatrix
              value={`${memberId}:${memberName}:${membershipTier}`}
              size={160}
              halo={haloColor}
            />
            <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40 opacity-0 backdrop-blur-[1px] transition-opacity group-hover/qr:opacity-100">
              <span className="flex items-center gap-1 text-xs font-medium text-white">
                <Maximize2Icon className="size-3.5" />
                Zoom Pass
              </span>
            </div>
          </div>

          <div className="mt-3 text-center">
            <div className="font-semibold text-sm text-foreground">{memberName}</div>
            <div className="font-mono text-xs text-muted-foreground">{memberId}</div>
          </div>
        </CardContent>

        <CardFooter className="flex items-center justify-between border-t border-border/60 bg-surface-ivory py-2.5 px-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            {isActive ? (
              <ShieldCheckIcon className="size-3.5 text-emerald-500" />
            ) : (
              <AlertTriangleIcon className="size-3.5 text-amber-500" />
            )}
            <span className="font-medium text-foreground">{membershipTier}</span>
          </div>
          <span className="font-mono text-[11px]">Exp: {expiresAt}</span>
        </CardFooter>
      </Card>

      {/* Expanded Zoom Dialog */}
      <Dialog open={zoomOpen} onOpenChange={setZoomOpen}>
        <DialogContent className="max-w-sm text-center">
          <DialogHeader>
            <DialogTitle>{memberName}</DialogTitle>
            <DialogDescription>
              Scan pass for high-security credential exchange
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center py-6">
            <div
              className={cn(
                "rounded-2xl p-4",
                isActive
                  ? "bg-emerald-500/5 ring-4 ring-emerald-500/20"
                  : "bg-destructive/5 ring-4 ring-destructive/20"
              )}
            >
              <DeterministicQRMatrix
                value={`${memberId}:${memberName}:${membershipTier}`}
                size={240}
                halo={haloColor}
              />
            </div>
            <div className="mt-4 font-mono text-sm font-semibold tracking-wider text-foreground">
              {memberId}
            </div>
            <Badge
              variant="outline"
              className="mt-2 font-mono text-xs uppercase"
            >
              {membershipTier} Pass · {status}
            </Badge>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
