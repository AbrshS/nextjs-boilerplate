import React from "react";
import Link from "next/link";
import { SignInForm } from "@/domains/auth/sign-in-form";

export const metadata = {
  title: "Sign In · Fanaye Enterprise",
  description: "Enterprise IAM authentication with Argon2id and multi-device session security.",
};

export default function SignInPage() {
  return (
    <div className="flex min-h-svh w-full flex-col items-center justify-center bg-canvas-cream p-4 sm:p-8">
      {/* Brand Watermark / Header */}
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="flex items-center gap-2 mb-1">
          <div className="size-6 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs tracking-tighter">
            FT
          </div>
          <span className="font-bold tracking-tight text-lg text-foreground">
            Fanaye Technologies
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Enterprise Monorepo Platform · 2026 Edition
        </p>
      </div>

      <SignInForm />

      <div className="mt-4 text-center text-xs text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/sign-up" className="font-medium text-primary hover:underline">
          Register new organization
        </Link>
      </div>
    </div>
  );
}
