"use client";

import * as React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "@/i18n/routing";
import { Button } from "@/shared/ui/button";
import { FormField } from "@/shared/forms/form-field";
import { Eye, EyeOff } from "lucide-react";
import { useResetPasswordMutation } from "../api/auth.api";
import { resetPasswordSchema, type ResetPasswordFormValues } from "../schemas/auth.schema";
import { getCandidateAuthErrorCopy } from "../utils/candidate-auth-error";

function getResetPasswordParams() {
  if (typeof window === "undefined") {
    return { email: null, otp: null, error: null };
  }

  const params = new URLSearchParams(window.location.search);
  const email = params.get("email");
  const otp = params.get("otp") || params.get("token");

  if (!email || !otp) {
    return {
      email: null,
      otp: null,
      error: "Invalid or missing password reset parameters in the URL.",
    };
  }

  return { email, otp, error: null };
}

export function ResetPasswordForm() {
  const router = useRouter();
  const [resetParams] = useState(getResetPasswordParams);
  const { email, otp } = resetParams;
  const [error, setError] = useState<string | null>(resetParams.error);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (values: ResetPasswordFormValues) => {
    if (!email || !otp) {
      setError("Cannot reset password: email or verification code is missing.");
      return;
    }
    setError(null);
    try {
      await resetPassword({
        email,
        otp,
        newPassword: values.password,
      }).unwrap();
      setIsSuccess(true);
    } catch (err) {
      setError(getCandidateAuthErrorCopy(err, "password-reset"));
    }
  };

  if (error && (!email || !otp)) {
    return (
      <div className="space-y-4 bg-red-50 dark:bg-red-950/20 border border-red-200/60 dark:border-red-800 text-red-800 dark:text-red-400 p-5 rounded-2xl text-center">
        <h3 className="font-bold text-[16px]">Reset Link Expired or Invalid</h3>
        <p className="text-sm leading-relaxed">
          The link you followed is invalid or has expired. Please request a new password reset link.
        </p>
      </div>
    );
  }

  if (isSuccess) {
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {error && <div className="text-sm font-medium text-destructive">{error}</div>}

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
        disabled={isLoading}
        className="w-full h-12 bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 hover:opacity-90 rounded-xl font-bold transition-all shadow-md mt-2 focus-visible:ring-3 focus-visible:ring-orange-500/25 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? "Resetting..." : "Reset password"}
      </Button>
    </form>
  );
}
