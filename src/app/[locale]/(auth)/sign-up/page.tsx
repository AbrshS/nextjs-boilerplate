import React from "react";
import Link from "next/link";
import { SignUpForm } from "@/domains/auth/sign-up-form";

export const metadata = {
  title: "Register · Fanaye Enterprise",
  description: "Create your corporate account with k-anonymity breach verification.",
};

export default function SignUpPage() {
  return (
    <div className="flex min-h-svh w-full flex-col items-center justify-center bg-canvas-cream p-4 sm:p-8">
      {/* Brand Header */}
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

      <SignUpForm />

      <div className="mt-4 text-center text-xs text-muted-foreground">
        Already have an enterprise account?{" "}
        <Link href="/sign-in" className="font-medium text-primary hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
}
