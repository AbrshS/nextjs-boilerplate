"use client";

import * as React from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { useAppDispatch } from "@/store/hooks";
import { logger } from "@/core/logger";
import { useVerify2FALoginMutation } from "../api/auth.api";
import { verify2FALoginService } from "../services/auth.service";
import type { LoginResponseDto } from "../types/auth.types";
import { getTwoFactorLoginErrorCopy } from "../utils/two-factor-login-error";

const TOTP_PATTERN = /^\d{6}$/u;
const BACKUP_CODE_PATTERN = /^[A-Z0-9]{4}-[A-Z0-9]{4}$/u;

export function TwoFactorLoginChallenge({
  tempToken,
  onVerified,
  onBack,
}: {
  tempToken: string;
  onVerified?: (response: LoginResponseDto) => void;
  onBack: () => void;
}) {
  const dispatch = useAppDispatch();
  const [verify2FALogin, { isLoading }] = useVerify2FALoginMutation();
  const [code, setCode] = React.useState("");
  const [error, setError] = React.useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    const normalizedCode = code.trim().toUpperCase();

    if (
      !TOTP_PATTERN.test(normalizedCode) &&
      !BACKUP_CODE_PATTERN.test(normalizedCode)
    ) {
      setError("Enter a complete 6-digit code or backup code.");
      return;
    }

    try {
      const response = await verify2FALoginService(
        (args) => verify2FALogin(args).unwrap(),
        { tempToken, code: normalizedCode },
        dispatch,
        logger,
      );
      onVerified?.(response);
    } catch (caught: unknown) {
      setError(getTwoFactorLoginErrorCopy(caught));
    }
  };

  return (
    <div className="relative space-y-5">
      <div className="space-y-2 text-center">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
          Two-Factor Verification
        </h2>
        <p className="text-[13px] text-zinc-500 dark:text-zinc-400">
          Enter the current 6-digit code from your authenticator app, or use an
          unused backup code.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label
            htmlFor="two-factor-login-code"
            className="text-[13px] font-semibold text-zinc-600 dark:text-zinc-300"
          >
            Verification Code
          </Label>
          <Input
            id="two-factor-login-code"
            name="two-factor-login-code"
            autoComplete="one-time-code"
            inputMode="text"
            autoFocus
            placeholder="6-digit code or backup code"
            value={code}
            disabled={isLoading}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "two-factor-login-error" : undefined}
            onChange={(event) => {
              setCode(
                event.target.value
                  .toUpperCase()
                  .replace(/[^A-Z0-9-]/gu, "")
                  .slice(0, 9),
              );
              setError("");
            }}
            className="h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-center font-mono text-[16px] tracking-widest transition-all focus-visible:border-orange-500 focus-visible:ring-3 focus-visible:ring-orange-500/20 dark:border-zinc-800 dark:bg-zinc-900"
          />
        </div>

        {error && (
          <p
            id="two-factor-login-error"
            role="alert"
            className="text-center text-sm font-semibold text-red-500"
          >
            {error}
          </p>
        )}

        <Button
          type="submit"
          disabled={!tempToken || !code || isLoading}
          className="mt-2 flex h-12 w-full items-center justify-center rounded-xl bg-black font-bold text-white shadow-md transition-all hover:opacity-90 dark:bg-white dark:text-black"
        >
          {isLoading ? "Verifying..." : "Verify Code"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={isLoading}
          onClick={onBack}
          className="h-10 w-full text-[13px] font-semibold text-zinc-500 transition-colors hover:text-zinc-800 dark:hover:text-zinc-300"
        >
          Back to Sign In
        </Button>
      </form>
    </div>
  );
}
