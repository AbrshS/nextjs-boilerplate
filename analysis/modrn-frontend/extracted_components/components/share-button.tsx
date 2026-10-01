"use client";

import { useCallback, useMemo, useState } from "react";
import {
  CheckIcon,
  CopyIcon,
  LinkIcon,
  MailIcon,
  Share2Icon,
} from "lucide-react";
import { toast } from "sonner";
import { buttonVariants } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { cn } from "@/shared/utils/cn";
import {
  canUseNativeShare,
  copyTextToClipboard,
  shareIntentUrl,
  tryNativeShare,
  type SharePayload,
} from "@/shared/utils/share";

type ShareButtonProps = {
  payload: SharePayload;
  /** Prefer native sheet on first tap when available (mobile). Default true. */
  preferNative?: boolean;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  label?: string;
  menuTitle?: string;
  /** Icon-only trigger */
  iconOnly?: boolean;
};

function isCoarsePointer(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: coarse)").matches;
}

export function ShareButton({
  payload,
  preferNative = true,
  variant = "outline",
  size = "sm",
  className,
  label = "Share",
  menuTitle,
  iconOnly = false,
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const nativeOk = useMemo(() => canUseNativeShare(payload), [payload]);

  const onCopy = useCallback(async () => {
    const ok = await copyTextToClipboard(payload.url);
    if (ok) {
      setCopied(true);
      toast.success("Link copied");
      window.setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error("Could not copy link");
    }
  }, [payload.url]);

  const onNative = useCallback(async () => {
    const result = await tryNativeShare(payload);
    if (result === "shared") {
      toast.success("Shared");
      setMenuOpen(false);
    } else if (result === "failed") {
      toast.error("Share failed — try copy link");
    }
  }, [payload]);

  const openChannel = useCallback(
    (channel: "x" | "linkedin" | "facebook" | "whatsapp" | "email") => {
      const href = shareIntentUrl(channel, payload);
      if (channel === "email") {
        window.location.href = href;
      } else {
        window.open(href, "_blank", "noopener,noreferrer");
      }
      setMenuOpen(false);
    },
    [payload],
  );

  const onTriggerClick = useCallback(
    async (e: React.MouseEvent) => {
      if (preferNative && nativeOk && isCoarsePointer()) {
        e.preventDefault();
        e.stopPropagation();
        const result = await tryNativeShare(payload);
        if (result === "shared") {
          toast.success("Shared");
          return;
        }
        if (result === "cancelled") return;
        setMenuOpen(true);
      }
    },
    [preferNative, nativeOk, payload],
  );

  const triggerSize = iconOnly ? "icon" : size;

  return (
    <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
      <DropdownMenuTrigger
        className={cn(
          buttonVariants({ variant, size: triggerSize }),
          "shrink-0 gap-1.5",
          className,
        )}
        aria-label={label}
        onClick={onTriggerClick}
      >
        <Share2Icon className="size-3.5" />
        {!iconOnly ? <span>{label}</span> : null}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-52">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{menuTitle || "Share"}</DropdownMenuLabel>
          {nativeOk ? (
            <DropdownMenuItem
              onClick={() => {
                void onNative();
              }}
            >
              <Share2Icon className="size-4" />
              Share via device…
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem
            onClick={() => {
              void onCopy();
            }}
          >
            {copied ? (
              <CheckIcon className="size-4 text-emerald-600" />
            ) : (
              <CopyIcon className="size-4" />
            )}
            {copied ? "Copied" : "Copy link"}
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => openChannel("whatsapp")}>
            <LinkIcon className="size-4" />
            WhatsApp
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => openChannel("x")}>
            <LinkIcon className="size-4" />
            X / Twitter
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => openChannel("linkedin")}>
            <LinkIcon className="size-4" />
            LinkedIn
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => openChannel("facebook")}>
            <LinkIcon className="size-4" />
            Facebook
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => openChannel("email")}>
            <MailIcon className="size-4" />
            Email
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
