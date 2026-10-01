"use client";

import * as React from "react";
import QRCode from "qrcode";
import { cn } from "@/shared/utils/cn";
import { XIcon, AlertTriangleIcon } from "lucide-react";

// Points to the local dev server when running locally so the QR is scannable
// in demos. In production this becomes the real domain.
const BASE_URL =
  typeof window !== "undefined" && window.location.hostname === "localhost"
    ? `${window.location.protocol}//${window.location.host}`
    : "https://modrnrncollective.com";

interface MembershipQRProps {
  token: string;
  isActive: boolean;
  size?: number;
  /** If true renders the card inline (dashboard). If false renders the settings block. */
  variant?: "card" | "block";
  lastRegenerated?: string;
}

/** Soft neon rim + restrained outer bloom (green active / red inactive). */
function qrNeonClass(isActive: boolean) {
  return isActive
    ? [
        "border-2 border-emerald-400/90",
        "shadow-[0_0_4px_1px_rgba(52,211,153,0.55),0_0_12px_4px_rgba(16,185,129,0.28),0_0_24px_8px_rgba(16,185,129,0.12)]",
      ].join(" ")
    : [
        "border-2 border-red-500/90",
        "shadow-[0_0_4px_1px_rgba(248,113,113,0.55),0_0_12px_4px_rgba(239,68,68,0.28),0_0_24px_8px_rgba(220,38,38,0.12)]",
      ].join(" ");
}

function qrNeonEnlargedClass(isActive: boolean) {
  return isActive
    ? [
        "border-[3px] border-emerald-400/90",
        "shadow-[0_0_6px_2px_rgba(52,211,153,0.6),0_0_18px_6px_rgba(16,185,129,0.3),0_0_36px_12px_rgba(16,185,129,0.14)]",
      ].join(" ")
    : [
        "border-[3px] border-red-500/90",
        "shadow-[0_0_6px_2px_rgba(248,113,113,0.6),0_0_18px_6px_rgba(239,68,68,0.3),0_0_36px_12px_rgba(220,38,38,0.14)]",
      ].join(" ");
}

export function MembershipQR({
  token,
  isActive,
  size = 96,
  variant = "card",
  lastRegenerated = "2026-07-09",
}: MembershipQRProps) {
  const [dataUrl, setDataUrl] = React.useState<string | null>(null);
  const [enlarged, setEnlarged] = React.useState(false);

  const verifyUrl = `${BASE_URL}/en/verify/${encodeURIComponent(token)}`;
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  React.useEffect(() => {
    QRCode.toDataURL(verifyUrl, {
      width: size * 2,
      margin: 1,
      color: { dark: "#000000", light: "#FFFFFF" },
    })
      .then(setDataUrl)
      .catch(() => setDataUrl(null));
  }, [verifyUrl, size]);

  const enlargedOverlay = enlarged ? (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 p-8 backdrop-blur-md"
      onClick={() => setEnlarged(false)}
    >
      <button
        onClick={() => setEnlarged(false)}
        className="absolute top-5 right-5 rounded-full bg-muted p-2 transition-colors hover:bg-muted/80"
        aria-label="Close"
      >
        <XIcon className="size-5" />
      </button>

      <div className="flex w-full max-w-xs flex-col items-center gap-5">
        <div
          className={cn(
            "rounded-2xl bg-white p-5",
            qrNeonEnlargedClass(isActive),
          )}
        >
          {dataUrl ? (
            <img
              src={dataUrl}
              alt="Membership verification QR"
              width={240}
              height={240}
              className="block"
            />
          ) : (
            <div className="size-60 animate-pulse rounded bg-muted" />
          )}
        </div>

        <div className="space-y-1 text-center">
          <p className="text-lg font-bold">{today}</p>
          <p
            className={cn(
              "text-sm font-semibold",
              isActive ? "text-emerald-500" : "text-destructive",
            )}
          >
            {isActive
              ? "Active member"
              : "Inactive — partners will see red"}
          </p>
          <p className="max-w-56 text-xs leading-relaxed text-muted-foreground">
            Partners only see Active or Inactive. Requires a verified license
            and active paid membership (trial and beta are inactive).
          </p>
        </div>
      </div>
    </div>
  ) : null;

  if (variant === "card") {
    return (
      <>
        <div className="flex flex-col items-center gap-1.5">
          <button
            onClick={() => setEnlarged(true)}
            className={cn(
              "group relative cursor-zoom-in rounded-xl bg-white p-2.5 transition-transform hover:scale-105",
              qrNeonClass(isActive),
            )}
            title="Tap to enlarge for scanning"
            aria-label="Enlarge QR code"
          >
            {dataUrl ? (
              <img
                src={dataUrl}
                alt="Membership verification QR"
                width={size}
                height={size}
                className="block rounded"
              />
            ) : (
              <div
                className="animate-pulse rounded bg-muted"
                style={{ width: size, height: size }}
              />
            )}
          </button>
          <p className="text-center text-[9px] leading-snug opacity-70">
            Show partners to claim
            <br />
            member discounts
          </p>
          {!isActive && (
            <div className="flex items-center gap-1 text-[9px] font-medium text-amber-400">
              <AlertTriangleIcon className="size-2.5" />
              Inactive — partners will see red
            </div>
          )}
        </div>
        {enlargedOverlay}
      </>
    );
  }

  // variant === "block" — settings Tab 4
  return (
    <>
      <div className="space-y-3 rounded-xl border bg-muted/20 p-4">
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "shrink-0 cursor-zoom-in rounded-xl bg-white p-2.5",
              qrNeonClass(isActive),
            )}
            onClick={() => setEnlarged(true)}
            title="Click to enlarge"
          >
            {dataUrl ? (
              <img
                src={dataUrl}
                alt="Membership verification QR"
                width={80}
                height={80}
                className="block"
              />
            ) : (
              <div className="size-20 animate-pulse rounded bg-muted" />
            )}
          </div>
          <div className="min-w-0 space-y-1.5">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold">Membership QR Code</p>
              <span
                className={cn(
                  "rounded border px-1.5 py-0.5 text-[10px] font-semibold",
                  isActive
                    ? "border-emerald-500/30 bg-emerald-500/8 text-emerald-600 dark:text-emerald-400"
                    : "border-destructive/30 bg-destructive/8 text-destructive",
                )}
              >
                {isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Last regenerated {lastRegenerated}
            </p>
            <button
              onClick={() => setEnlarged(true)}
              className="text-[11px] text-primary hover:underline"
            >
              Enlarge for scanning →
            </button>
          </div>
        </div>

        <p className="border-t pt-3 text-[11px] leading-relaxed text-muted-foreground">
          Partners scanning this code see Active only when your license is
          verified and you have an active paid membership. Free trial and beta
          show as Inactive. No personal information is visible.
        </p>
      </div>
      {enlargedOverlay}
    </>
  );
}
