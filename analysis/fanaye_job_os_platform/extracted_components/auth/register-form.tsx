"use client";

import * as React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "@/i18n/routing";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logger } from "@/core/logger";
import { getCandidateAuthErrorCopy } from "../utils/candidate-auth-error";
import { comingSoonMessage } from "@/shared/coming-soon/coming-soon";
import { useRegisterMutation, useVerifyEmailMutation, useResendVerificationMutation } from "../api/auth.api";
import { OtpInput } from "@/shared/ui/otp-input";
import { registerService, verifyEmailService } from "../services/auth.service";
import { registerSchema, type RegisterFormValues } from "../schemas/auth.schema";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import { FormField } from "@/shared/forms/form-field";
import { Eye, EyeOff } from "lucide-react";
import { env } from "@/config/env.config";
import { getCandidatePostAuthDestination } from "@/domains/job-sharing/utils/pending-job-share";

type Step = 'register' | 'otp';

export function RegisterForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [step, setStep] = useState<Step>('register');
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [registerMutation, { isLoading: isRegistering }] = useRegisterMutation();
  const [verifyEmail, { isLoading: isVerifying }] = useVerifyEmailMutation();
  const [resendVerification, { isLoading: isResending }] = useResendVerificationMutation();

  const [error, setError] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
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

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "User",
    },
  });

  const onSubmitRegister = async (values: RegisterFormValues) => {
    setError(null);
    try {
      const payload = {
        email: values.email,
        password: values.password,
        fullName: values.name,
      };
      await registerService(
        (args) => registerMutation(args).unwrap(),
        payload,
        dispatch,
        logger
      );
      setRegisteredEmail(values.email);
      setStep('otp');
    } catch (err) {
      setError(getCandidateAuthErrorCopy(err, "register"));
    }
  };

  const handleOtpSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    if (otp.length !== 6) {
      setError("Please enter the 6-digit code");
      return;
    }
    try {
      const res = await verifyEmailService(
        (args) => verifyEmail(args).unwrap(),
        { email: registeredEmail, otp },
        dispatch,
        logger
      );
      if (res.user) {
        if (res.user.role === "ADMIN" || res.user.role === "SUPER_ADMIN") {
          router.push("/admin");
        } else {
          router.push(getCandidatePostAuthDestination());
        }
      } else {
        router.push("/login?verified=true");
      }
    } catch (err) {
      setError(getCandidateAuthErrorCopy(err, "verification"));
    }
  };

  const handleResend = async () => {
    setError(null);
    setResendSuccess(null);
    try {
      await resendVerification({ email: registeredEmail }).unwrap();
      setResendSuccess("A new verification code has been sent.");
    } catch (err) {
      setError(getCandidateAuthErrorCopy(err, "verification"));
    }
  };

  const startOAuth = (provider: "google" | "github") => {
    if (env.comingSoonMode) {
      setError(comingSoonMessage);
      return;
    }

    window.location.assign(`${env.apiUrl}/auth/oauth/${provider}`);
  };

  if (step === 'otp') {
    return (
      <form onSubmit={handleOtpSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label className="text-zinc-600 dark:text-zinc-300 text-[13px] font-semibold text-center block">
            6-Digit Verification Code
          </Label>
          <OtpInput
            value={otp}
            onChange={setOtp}
            disabled={isVerifying}
          />
          {error && <div className="mt-2 rounded-lg border border-foreground/10 bg-white p-3 text-center text-sm font-medium text-foreground/70 shadow-sm dark:bg-zinc-950">{error}</div>}
          {resendSuccess && <div className="text-sm font-medium text-emerald-600 dark:text-emerald-400 text-center mt-2">{resendSuccess}</div>}
          <div className="text-[13px] text-zinc-500 text-center pt-2 leading-relaxed">
            Code sent to <br /><strong className="font-semibold text-zinc-700 dark:text-zinc-300">{registeredEmail}</strong>
          </div>
        </div>

        <Button
          type="submit"
          disabled={otp.length !== 6 || isVerifying}
          className="w-full h-12 bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 hover:opacity-90 rounded-xl font-bold transition-all shadow-md mt-2 focus-visible:ring-3 focus-visible:ring-orange-500/25 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isVerifying ? "Verifying..." : "Verify & Continue"}
        </Button>
        <button
          type="button"
          onClick={handleResend}
          disabled={isResending}
          className="w-full text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 mt-2 font-medium"
        >
          {isResending ? "Sending..." : "Resend code"}
        </button>
      </form>
    );
  }

  return (
    <div className="space-y-5">
      <form onSubmit={handleSubmit(onSubmitRegister)} className="space-y-3" noValidate>
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs font-semibold text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </div>
        )}
        <FormField
          id="reg-email"
          type="email"
          label="Email"
          placeholder="you@example.com"
          autoComplete="email"
          error={errors.email?.message}
          className="w-full h-12 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 text-[14px] text-zinc-950 dark:text-white placeholder-zinc-400 shadow-xs focus:outline-none focus-visible:border-orange-500 focus-visible:ring-3 focus-visible:ring-orange-500/20 transition-all"
          {...register("email")}
        />

        <FormField
          id="reg-password"
          type={showPassword ? "text" : "password"}
          label="Password"
          placeholder="••••••••"
          autoComplete="new-password"
          error={errors.password?.message}
          className="w-full h-12 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-4 pr-12 text-[14px] text-zinc-950 dark:text-white placeholder-zinc-400 shadow-xs focus:outline-none focus-visible:border-orange-500 focus-visible:ring-3 focus-visible:ring-orange-500/20 transition-all"
          {...register("password")}
          rightElement={
            <button
              type="button"
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors p-1 flex items-center justify-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/30"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          }
        />

        <FormField
          id="confirmPassword"
          type={showPassword ? "text" : "password"}
          label="Confirm Password"
          placeholder="••••••••"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          className="w-full h-12 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-4 pr-12 text-[14px] text-zinc-950 dark:text-white placeholder-zinc-400 shadow-xs focus:outline-none focus-visible:border-orange-500 focus-visible:ring-3 focus-visible:ring-orange-500/20 transition-all"
          {...register("confirmPassword")}
          rightElement={
            <button
              type="button"
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors p-1 flex items-center justify-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/30"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          }
        />


        <Button
          id="register-submit"
          type="submit"
          className="w-full h-12 bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 hover:opacity-90 rounded-xl font-bold transition-all shadow-md mt-2 flex items-center justify-center gap-2 focus-visible:ring-3 focus-visible:ring-orange-500/25 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isRegistering}
        >
          {isRegistering ? "Creating account…" : "Create account"}
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
