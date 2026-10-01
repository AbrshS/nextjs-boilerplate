"use client";

import * as React from "react";
import { useRouter, Link } from "@/i18n/routing";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { env } from "@/config/env.config";

import { OtpInput } from "@/shared/ui/otp-input";

import { useLoginMutation, useResendVerificationMutation, useVerifyEmailMutation } from "../api/auth.api";
import { loginService, verifyEmailService } from "../services/auth.service";
import { logger } from "@/core/logger";
import { normalizeError } from "@/core/errors/normalize-error";
import { getCandidateAuthErrorCopy } from "../utils/candidate-auth-error";
import { comingSoonMessage } from "@/shared/coming-soon/coming-soon";
import { TwoFactorLoginChallenge } from "./two-factor-login-challenge";
import { getCandidatePostAuthDestination } from "@/domains/job-sharing/utils/pending-job-share";

export function LoginForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [loginMutation, { isLoading }] = useLoginMutation();
  const [resendVerification, { isLoading: isResendingVerification }] = useResendVerificationMutation();
  const [verifyEmail, { isLoading: isVerifyingOtp }] = useVerifyEmailMutation();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState<string | null>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const oauthError = params.get("oauthError");
      if (oauthError) {
        if (oauthError === "OAUTH_EMAIL_ALREADY_EXISTS") {
          return "This email already exists. Please sign in with email and password.";
        }
        if (oauthError === "OAUTH_EMAIL_NOT_VERIFIED") {
          return "Your provider email is not verified.";
        }
        if (oauthError === "OAUTH_INVALID_STATE") {
          return "OAuth session expired. Please try again.";
        }
        if (oauthError === "OAUTH_FAILED") {
          return "OAuth sign-in failed. Please try again.";
        }
        return "OAuth sign-in failed. Please try again.";
      }
    }
    return null;
  });
  const [errorCode, setErrorCode] = React.useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = React.useState<string | null>(null);
  const [showVerifiedSuccess, setShowVerifiedSuccess] = React.useState(
    () =>
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("verified") === "true",
  );

  const [requires2FA, setRequires2FA] = React.useState(false);
  const [tempToken, setTempToken] = React.useState("");

  const [showUnverifiedOtp, setShowUnverifiedOtp] = React.useState(false);
  const [unverifiedOtp, setUnverifiedOtp] = React.useState("");
  const [unverifiedOtpError, setUnverifiedOtpError] = React.useState("");

  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  React.useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === "ADMIN" || user?.role === "SUPER_ADMIN") {
        router.push("/admin");
      } else {
        router.push(getCandidatePostAuthDestination());
      }
    }
  }, [isAuthenticated, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setErrorCode(null);
    setResendSuccess(null);
    setShowVerifiedSuccess(false);
    try {
      const response = await loginService(
        (args) => loginMutation(args).unwrap(),
        { email, password },
        dispatch,
        logger
      );
      if (response && response.requiresTwoFactor) {
        if (!response.tempToken) {
          setError("We couldn't start two-factor verification. Sign in again.");
          return;
        }
        setTempToken(response.tempToken);
        setRequires2FA(true);
      }
    } catch (err) {
      const normalized = normalizeError(err);
      setError(
        normalized.code === "EMAIL_NOT_VERIFIED"
          ? "Please verify your email before signing in."
          : getCandidateAuthErrorCopy(err, "login"),
      );
      setErrorCode(normalized.code);
    }
  };

  const handleResendVerification = async () => {
    setResendSuccess(null);
    setError(null);
    try {
      await resendVerification({ email }).unwrap();
      setShowUnverifiedOtp(true);
      setUnverifiedOtp("");
      setUnverifiedOtpError("");
    } catch (err) {
      setError(getCandidateAuthErrorCopy(err, "verification"));
    }
  };

  const handleUnverifiedOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUnverifiedOtpError("");
    if (unverifiedOtp.length !== 6) {
      setUnverifiedOtpError("Please enter the 6-digit verification code.");
      return;
    }
    try {
      const res = await verifyEmailService(
        (args) => verifyEmail(args).unwrap(),
        { email, otp: unverifiedOtp },
        dispatch,
        logger
      );
      if (res.user) {
        if (res.user.role === "ADMIN" || res.user.role === "SUPER_ADMIN") {
          router.push("/admin");
        } else {
          router.push(getCandidatePostAuthDestination());
        }
      }
    } catch (err) {
      setUnverifiedOtpError(getCandidateAuthErrorCopy(err, "verification"));
    }
  };

  const startOAuth = (provider: "google" | "github") => {
    if (env.comingSoonMode) {
      setError(comingSoonMessage);
      setErrorCode("COMING_SOON_MODE");
      return;
    }

    window.location.assign(`${env.apiUrl}/auth/oauth/${provider}`);
  };

  if (showUnverifiedOtp) {
    return (
      <div className="space-y-5 relative">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Verify Email</h2>
          <p className="text-[13px] text-zinc-500 dark:text-zinc-400">
            Enter the 6-digit verification code sent to <strong className="text-zinc-700 dark:text-zinc-200">{email}</strong>
          </p>
        </div>
        <form onSubmit={handleUnverifiedOtpSubmit} className="space-y-4">
          <div className="space-y-2">
            <OtpInput
              value={unverifiedOtp}
              onChange={setUnverifiedOtp}
              disabled={isVerifyingOtp}
            />
          </div>
          {unverifiedOtpError && (
            <p className="text-sm text-red-500 text-center font-semibold">{unverifiedOtpError}</p>
          )}
          <Button
            type="submit"
            disabled={unverifiedOtp.length !== 6 || isVerifyingOtp}
            className="w-full h-12 bg-black text-white dark:bg-white dark:text-black hover:opacity-90 rounded-xl font-bold transition-all shadow-md mt-2 flex items-center justify-center"
          >
            {isVerifyingOtp ? "Verifying..." : "Verify & Continue"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setShowUnverifiedOtp(false)}
            className="w-full h-10 text-[13px] font-semibold text-zinc-500 hover:text-zinc-850 dark:hover:text-zinc-350 transition-colors"
          >
            Back to Sign In
          </Button>
        </form>
      </div>
    );
  }

  if (requires2FA) {
    return (
      <TwoFactorLoginChallenge
        tempToken={tempToken}
        onBack={() => {
          setTempToken("");
          setRequires2FA(false);
        }}
      />
    );
  }

  return (
    <div className="space-y-5 relative">
      {showVerifiedSuccess && (
        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800 text-emerald-800 dark:text-emerald-400 p-3.5 rounded-xl text-sm font-semibold transition-all text-center">
          Email verified successfully! Please sign in.
        </div>
      )}
      {/* Floating Theme Toggle */}
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Email Input */}
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-zinc-600 dark:text-zinc-300 text-[13px] font-semibold">
            Your email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="natalia.brak@knmstudio.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-12 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 text-[14px] text-zinc-950 dark:text-white placeholder-zinc-400 shadow-xs focus:outline-none focus-visible:border-orange-500 focus-visible:ring-3 focus-visible:ring-orange-500/20 transition-all"
          />
        </div>

        {/* Password Input */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-zinc-600 dark:text-zinc-300 text-[13px] font-semibold">
              Password
            </Label>
            <Link href="/forgot-password" className="text-[13px] font-semibold text-orange-500 hover:text-orange-600 transition-colors">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••••••"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-4 pr-12 text-[14px] text-zinc-950 dark:text-white placeholder-zinc-400 shadow-xs focus:outline-none focus-visible:border-orange-500 focus-visible:ring-3 focus-visible:ring-orange-500/20 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-md p-1 text-zinc-400 transition-colors hover:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/30 dark:hover:text-zinc-300"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="space-y-2 rounded-xl border border-foreground/10 bg-white p-3 text-sm font-medium text-foreground/70 shadow-sm dark:bg-zinc-950">
            <p>{error}</p>
            {errorCode === "EMAIL_NOT_VERIFIED" && (
              <Button
                type="button"
                variant="outline"
                disabled={!email || isResendingVerification}
                onClick={handleResendVerification}
                className="h-9 rounded-lg px-3 text-xs font-semibold"
              >
                {isResendingVerification ? "Sending..." : "Resend verification code"}
              </Button>
            )}
          </div>
        )}
        {resendSuccess && (
          <div className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
            {resendSuccess}
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 hover:opacity-90 rounded-xl font-bold transition-all shadow-md mt-2 flex items-center justify-center gap-2 focus-visible:ring-3 focus-visible:ring-orange-500/25 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative flex items-center justify-center my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-zinc-200 dark:border-zinc-800"></div>
        </div>
        <span className="relative px-3 text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 bg-white dark:bg-zinc-950 uppercase tracking-wider">
          or continue with
        </span>
      </div>

      {/* Social Logins */}
      <div className="grid grid-cols-2 gap-3">
        {/* Google */}
        <button
          type="button"
          onClick={() => startOAuth("google")}
          className="flex h-12 min-w-0 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-800 shadow-xs transition-colors hover:border-zinc-300 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-orange-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-zinc-700 dark:hover:bg-zinc-800/70"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
          </svg>
          <span className="truncate">Google</span>
        </button>

        {/* GitHub */}
        <button
          type="button"
          onClick={() => startOAuth("github")}
          className="flex h-12 min-w-0 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-800 shadow-xs transition-colors hover:border-zinc-300 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-orange-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-zinc-700 dark:hover:bg-zinc-800/70"
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
          </svg>
          <span className="truncate">GitHub</span>
        </button>
      </div>
    </div>
  );
}
