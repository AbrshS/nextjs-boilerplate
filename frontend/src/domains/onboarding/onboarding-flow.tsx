"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  BuildingIcon,
  CoinsIcon,
  ShieldCheckIcon,
  FileTextIcon,
  CheckIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  KeyIcon,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/shared/ui/select";
import { Switch } from "@/shared/ui/switch";
import { Badge } from "@/shared/ui/badge";
import { OnboardingStepper } from "@/shared/components/onboarding-stepper";
import { LegalDocument } from "@/shared/components/legal-document";
import { ProfilePreparingWait } from "@/shared/components/profile-preparing-wait";
import { getOrCreateDeviceId } from "@/core/network/api-client";

const STEPS = [
  { id: "org", title: "Organization", description: "Identity & Registration" },
  { id: "financial", title: "Financial Ledger", description: "Currencies & Fiscal Year" },
  { id: "security", title: "Security & Passkeys", description: "Device Verification" },
  { id: "legal", title: "Governance Terms", description: "Master Agreement" },
  { id: "provisioning", title: "Provisioning", description: "Workspace Setup" },
];

export function OnboardingFlow() {
  const router = useRouter();
  const [currentStepIndex, setCurrentStepIndex] = React.useState(0);

  // Form State
  const [orgName, setOrgName] = React.useState("Fanaye Technologies Corp");
  const [orgTaxId, setOrgTaxId] = React.useState("ET-99420-TX");
  const [baseCurrency, setBaseCurrency] = React.useState("USD");
  const [fiscalMonth, setFiscalMonth] = React.useState("January");
  const [enablePasskey, setEnablePasskey] = React.useState(true);
  const [enable2FA, setEnable2FA] = React.useState(true);
  const [deviceId, setDeviceId] = React.useState("");

  React.useEffect(() => {
    setDeviceId(getOrCreateDeviceId());
  }, []);

  const nextStep = () => {
    setCurrentStepIndex((prev) => Math.min(STEPS.length - 1, prev + 1));
  };

  const prevStep = () => {
    setCurrentStepIndex((prev) => Math.max(0, prev - 1));
  };

  return (
    <div className="w-full max-w-3xl space-y-6">
      {/* Tabular Header Stepper */}
      <OnboardingStepper
        steps={STEPS}
        currentStepIndex={currentStepIndex}
        onStepClick={(idx) => {
          if (idx < currentStepIndex) setCurrentStepIndex(idx);
        }}
      />

      {/* Step 1: Organization Profile */}
      {currentStepIndex === 0 && (
        <Card className="border-border/80 shadow-none">
          <CardHeader className="border-b border-border/60 bg-surface-ivory pb-4">
            <div className="flex items-center gap-2">
              <BuildingIcon className="size-5 text-primary" />
              <CardTitle className="text-base font-semibold">
                Organization & Corporate Entity
              </CardTitle>
            </div>
            <CardDescription className="text-xs">
              Configure your primary corporate identity and legal jurisdiction.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="org-name" className="text-xs font-medium">
                  Legal Entity Name
                </Label>
                <Input
                  id="org-name"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="e.g. Acme Corp"
                  className="text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tax-id" className="text-xs font-medium">
                  Tax Registration Number / TIN
                </Label>
                <Input
                  id="tax-id"
                  value={orgTaxId}
                  onChange={(e) => setOrgTaxId(e.target.value)}
                  placeholder="e.g. 12-3456789"
                  className="text-xs font-mono"
                />
              </div>
            </div>

            <div className="rounded-lg border border-border/60 bg-surface-ivory p-3 text-xs text-muted-foreground flex items-center justify-between">
              <span>Jurisdiction: Federal Democratic Republic of Ethiopia / Global Multi-Entity</span>
              <Badge variant="outline" className="font-mono text-[10px]">Verified</Badge>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2 border-t border-border/60 bg-surface-ivory pt-4">
            <Button size="sm" onClick={nextStep} className="gap-1.5">
              Next: Financial Preferences
              <ArrowRightIcon className="size-3.5" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Step 2: Financial Ledger Preferences */}
      {currentStepIndex === 1 && (
        <Card className="border-border/80 shadow-none">
          <CardHeader className="border-b border-border/60 bg-surface-ivory pb-4">
            <div className="flex items-center gap-2">
              <CoinsIcon className="size-5 text-primary" />
              <CardTitle className="text-base font-semibold">
                Financial Ledger & Reporting
              </CardTitle>
            </div>
            <CardDescription className="text-xs">
              Establish default base reporting currencies and accounting periods.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Primary Reporting Currency</Label>
                <Select value={baseCurrency} onValueChange={setBaseCurrency}>
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Select Currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD - United States Dollar ($)</SelectItem>
                    <SelectItem value="ETB">ETB - Ethiopian Birr (Br)</SelectItem>
                    <SelectItem value="EUR">EUR - Euro (€)</SelectItem>
                    <SelectItem value="GBP">GBP - British Pound (£)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Fiscal Year Commences</Label>
                <Select value={fiscalMonth} onValueChange={setFiscalMonth}>
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Select Month" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="January">January (Calendar Year)</SelectItem>
                    <SelectItem value="July">July (Mid-Year)</SelectItem>
                    <SelectItem value="October">October (Q4 Alignment)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-lg border border-border/60 bg-surface-ivory p-3 space-y-1">
              <div className="text-xs font-semibold text-foreground">Double-Entry Ledger Active</div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Transactions recorded into the Hexagonal ledger require immutable cryptographic balance verification between debits and credits.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t border-border/60 bg-surface-ivory pt-4">
            <Button variant="outline" size="sm" onClick={prevStep} className="gap-1.5">
              <ArrowLeftIcon className="size-3.5" />
              Back
            </Button>
            <Button size="sm" onClick={nextStep} className="gap-1.5">
              Next: Security Keys
              <ArrowRightIcon className="size-3.5" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Step 3: Security & Passkeys */}
      {currentStepIndex === 2 && (
        <Card className="border-border/80 shadow-none">
          <CardHeader className="border-b border-border/60 bg-surface-ivory pb-4">
            <div className="flex items-center gap-2">
              <ShieldCheckIcon className="size-5 text-primary" />
              <CardTitle className="text-base font-semibold">
                Multi-Device Cryptographic Enrollment
              </CardTitle>
            </div>
            <CardDescription className="text-xs">
              Enforce hardware-backed authentication across all active sessions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            {/* Device Identity Pill */}
            <div className="flex items-center justify-between rounded-lg border border-border/60 bg-surface-ivory p-3">
              <div className="flex items-center gap-2.5">
                <KeyIcon className="size-4 text-primary" />
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-foreground">Current Node Fingerprint</span>
                  <span className="font-mono text-[11px] text-muted-foreground">{deviceId}</span>
                </div>
              </div>
              <Badge variant="secondary" className="text-[10px] font-mono uppercase">
                Active Node
              </Badge>
            </div>

            {/* Toggle Switches */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between rounded-lg border border-border/60 p-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-medium text-foreground">
                    Enroll WebAuthn Passkeys / Biometrics
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Enables Touch ID, Windows Hello, or YubiKey hardware signature.
                  </div>
                </div>
                <Switch checked={enablePasskey} onCheckedChange={setEnablePasskey} />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border/60 p-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-medium text-foreground">
                    Mandatory TOTP Two-Factor Authentication
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Enforce time-synced 6-digit one-time codes for ledger operations.
                  </div>
                </div>
                <Switch checked={enable2FA} onCheckedChange={setEnable2FA} />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t border-border/60 bg-surface-ivory pt-4">
            <Button variant="outline" size="sm" onClick={prevStep} className="gap-1.5">
              <ArrowLeftIcon className="size-3.5" />
              Back
            </Button>
            <Button size="sm" onClick={nextStep} className="gap-1.5">
              Next: Governance Terms
              <ArrowRightIcon className="size-3.5" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Step 4: Legal Terms Review */}
      {currentStepIndex === 3 && (
        <LegalDocument
          onAccept={() => nextStep()}
          onDecline={() => {
            alert("Governance agreements must be signed to initialize the workspace.");
          }}
        />
      )}

      {/* Step 5: Preparing Workspace */}
      {currentStepIndex === 4 && (
        <ProfilePreparingWait
          onComplete={() => {
            router.push("/dashboard");
          }}
        />
      )}
    </div>
  );
}
