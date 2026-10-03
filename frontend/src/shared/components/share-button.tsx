"use client";

import * as React from "react";
import { Share2Icon, CheckIcon, CopyIcon } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/utils/cn";

interface ShareButtonProps extends React.ComponentProps<typeof Button> {
  title?: string;
  text?: string;
  url?: string;
  onShared?: () => void;
}

export function ShareButton({
  title = "Fanaye Enterprise",
  text = "Review records and financial reports on Fanaye Platform",
  url,
  variant = "outline",
  size = "sm",
  className,
  onShared,
  ...props
}: ShareButtonProps) {
  const [copied, setCopied] = React.useState(false);

  const handleShare = async () => {
    const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");

    // Native OS Share Sheet (Mobile iOS/Android & modern macOS Safari)
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url: shareUrl,
        });
        onShared?.();
        return;
      } catch (err: unknown) {
        // User aborted share sheet or cancelled
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }
      }
    }

    // Fallback: Copy to clipboard
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        onShared?.();
      } catch {
        // Fail silently
      }
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleShare}
      className={cn("gap-1.5 transition-all duration-200", className)}
      {...props}
    >
      {copied ? (
        <>
          <CheckIcon className="size-3.5 text-emerald-600 animate-in zoom-in-50" />
          <span className="text-emerald-700 font-medium">Copied!</span>
        </>
      ) : (
        <>
          <Share2Icon className="size-3.5" />
          <span>Share</span>
        </>
      )}
    </Button>
  );
}
