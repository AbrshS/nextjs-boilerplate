import React from "react";
import { OnboardingFlow } from "@/domains/onboarding/onboarding-flow";

export const metadata = {
  title: "Onboarding Wizard · Fanaye Enterprise",
  description: "Configure corporate identity, financial ledgers, and cryptographic keys.",
};

export default function OnboardingPage() {
  return (
    <div className="flex min-h-svh w-full flex-col items-center justify-center bg-canvas-cream p-4 sm:p-8">
      {/* Brand Header */}
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="flex items-center gap-2 mb-1">
          <div className="size-6 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs tracking-tighter">
            FT
          </div>
          <span className="font-bold tracking-tight text-lg text-foreground">
            Fanaye Enterprise Setup
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Hexagonal Persistence · Zero-Shadow Workspaces
        </p>
      </div>

      <OnboardingFlow />
    </div>
  );
}
