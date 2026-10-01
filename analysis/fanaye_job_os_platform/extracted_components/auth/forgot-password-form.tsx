"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "@/i18n/routing";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { FormField } from "@/shared/forms/form-field";
import { Eye, EyeOff, RotateCw } from "lucide-react";

import { OtpInput } from "@/shared/ui/otp-input";
import { useForgotPasswordMutation, useResetPasswordMutation } from "../api/auth.api";
import { resetPasswordSchema, type ResetPasswordFormValues } from "../schemas/auth.schema";
import { getCandidateAuthErrorCopy } from "../utils/candidate-auth-error";

type Step = "email" | "otp" | "password" | "success";

const RESEND_COOLDOWN = 30; // 30 seconds countdown

export function ForgotPasswordForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const [forgotPassword, { isLoading: isSendingEmail }] = useForgotPasswordMutation();
  const [resetPassword, { isLoading: isResetting }] = useResetPasswordMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  // Countdown timer effect
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResendSuccess(null);
    try {
      await forgotPassword({ email }).unwrap();
      setStep("otp");
      setCountdown(RESEND_COOLDOWN);
    } catch (err) {
      setError(getCandidateAuthErrorCopy(err, "password-reset"));
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || isSendingEmail) return;
    setError(null);
    setResendSuccess(null);
    try {
      await forgotPassword({ email }).unwrap();
      setResendSuccess("A new 6-digit reset code has been sent.");
      setCountdown(RESEND_COOLDOWN);
    } catch (err) {
      setError(getCandidateAuthErrorCopy(err, "password-reset"));
    }
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResendSuccess(null);
    if (otp.length !== 6) {
      setError("Please enter the 6-digit code");
      return;
    }
    setStep("password");
  };

  const handlePasswordSubmit = async (values: ResetPasswordFormValues) => {
    setError(null);
    try {
      await resetPassword({
        email,
        otp,
        newPassword: values.password,
      }).unwrap();
      setStep("success");
    } catch (err) {
      setError(getCandidateAuthErrorCopy(err, "password-reset"));
    }
  };

  if (step === "success") {
    return (
      <div className="space-y-4 bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-center">
        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-zinc-900 dark:text-white font-bold text-[16px]">Password Reset Complete</h3>
        <p className="text-zinc-500 dark:text-zinc-400 text-[14px] leading-relaxed mb-4">
          Your password has been successfully reset. You can now log in using your new credentials.
        </p>
        <Button
          onClick={() => router.push("/login")}
          className="w-full h-12 bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 hover:opacity-90 rounded-xl font-bold transition-all shadow-md focus-visible:ring-3 focus-visible:ring-orange-500/25 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Sign in
        </Button>
      </div>
    );
  }

  if (step === "password") {
    return (
      <form onSubmit={handleSubmit(handlePasswordSubmit)} className="space-y-5" noValidate>
        {error && (
          <div className="text-sm font-medium text-destructive bg-red-50 dark:bg-red-950/20 p-3 rounded-lg border border-red-200/60 dark:border-red-800 text-red-800 dark:text-red-400 text-center">
            {error}
          </div>
        )}

        <FormField
          id="new-password"
          label="New Password"
          type={showPassword ? "text" : "password"}
          placeholder="••••••••••••"
          error={errors.password?.message}
          {...register("password")}
          className="w-full h-12 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-4 pr-12 text-[14px] text-zinc-950 dark:text-white placeholder-zinc-400 shadow-xs focus:outline-none focus-visible:border-orange-500 focus-visible:ring-3 focus-visible:ring-orange-500/20 transition-all"
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors p-1 flex items-center justify-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/30"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
        />

        <FormField
          id="confirm-password"
          label="Confirm New Password"
          type={showPassword ? "text" : "password"}
          placeholder="••••••••••••"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
          className="w-full h-12 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-4 pr-12 text-[14px] text-zinc-950 dark:text-white placeholder-zinc-400 shadow-xs focus:outline-none focus-visible:border-orange-500 focus-visible:ring-3 focus-visible:ring-orange-500/20 transition-all"
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors p-1 flex items-center justify-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/30"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
        />

        <Button
          type="submit"
          disabled={isResetting}
          className="w-full h-12 bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 hover:opacity-90 rounded-xl font-bold transition-all shadow-md mt-2 focus-visible:ring-3 focus-visible:ring-orange-500/25 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isResetting ? "Resetting..." : "Reset password"}
        </Button>
      </form>
    );
  }

  if (step === "otp") {
    return (
      <form onSubmit={handleOtpSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label className="text-zinc-600 dark:text-zinc-300 text-[13px] font-semibold text-center block">
            6-Digit Reset Code
          </Label>
          <OtpInput value={otp} onChange={setOtp} disabled={isSendingEmail} />
          {error && (
            <div className="text-sm font-medium text-destructive bg-red-50 dark:bg-red-950/20 p-3 rounded-lg border border-red-200/60 dark:border-red-800 text-red-800 dark:text-red-400 text-center mt-2">
              {error}
            </div>
          )}
          {resendSuccess && (
            <div className="text-sm font-medium text-emerald-600 dark:text-emerald-400 text-center mt-2">
              {resendSuccess}
            </div>
          )}
          <div className="text-[13px] text-zinc-500 text-center pt-2 leading-relaxed">
            Code sent to <br />
            <strong className="font-semibold text-zinc-700 dark:text-zinc-300">{email}</strong>
          </div>
        </div>

        <Button
          type="submit"
          disabled={otp.length !== 6 || isSendingEmail}
          className="w-full h-12 bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 hover:opacity-90 rounded-xl font-bold transition-all shadow-md mt-2 focus-visible:ring-3 focus-visible:ring-orange-500/25 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Verify Code
        </Button>

        <div className="flex items-center justify-between text-sm pt-2">
          <button
            type="button"
            onClick={handleResend}
            disabled={isSendingEmail || countdown > 0}
            className="inline-flex items-center gap-1.5 text-orange-600 hover:text-orange-700 dark:text-orange-400 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSendingEmail ? (
              <>
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
                Sending...
              </>
            ) : countdown > 0 ? (
              <span>Resend code in {countdown}s</span>
            ) : (
              "Resend code"
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              setStep("email");
              setResendSuccess(null);
              setError(null);
            }}
            className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 font-medium transition-colors"
          >
            Change email address
          </button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleEmailSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-zinc-600 dark:text-zinc-300 text-[13px] font-semibold">
          Your email address
        </Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
          required
          className="w-full h-12 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 text-[14px] text-zinc-950 dark:text-white placeholder-zinc-400 shadow-xs focus:outline-none focus-visible:border-orange-500 focus-visible:ring-3 focus-visible:ring-orange-500/20 transition-all"
        />
      </div>

      {error && (
        <div className="text-sm font-medium text-destructive bg-red-50 dark:bg-red-950/20 p-3 rounded-lg border border-red-200/60 dark:border-red-800 text-red-800 dark:text-red-400 text-center">
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={isSendingEmail || !email}
        className="w-full h-12 bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 hover:opacity-90 rounded-xl font-bold transition-all shadow-md focus-visible:ring-3 focus-visible:ring-orange-500/25 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSendingEmail ? "Sending Code..." : "Send Reset Code"}
      </Button>
    </form>
  );
}
