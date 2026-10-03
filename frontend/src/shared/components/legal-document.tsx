"use client";

import * as React from "react";
import { FileTextIcon, ShieldCheckIcon, CheckIcon, ChevronRightIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { cn } from "@/shared/utils/cn";

export type LegalSection = {
  id: string;
  title: string;
  content: string;
};

interface LegalDocumentProps {
  title?: string;
  version?: string;
  effectiveDate?: string;
  sections?: LegalSection[];
  onAccept?: () => void;
  onDecline?: () => void;
  className?: string;
}

const DEFAULT_SECTIONS: LegalSection[] = [
  {
    id: "sec-1",
    title: "1. Scope of Master Services & Digital Ledger",
    content:
      "Fanaye Technologies provides enterprise computational orchestration, financial ledger auditing, and decentralized cryptographic identity verification. By utilizing the platform, you agree to execute transactions and verify state changes in strict accordance with the cryptographic signatures issued to your authenticated sessions.",
  },
  {
    id: "sec-2",
    title: "2. Cryptographic Key Custody & Multi-Device Isolation",
    content:
      "All master credentials, Argon2id salts, and WebAuthn public keys are isolated within hardware-backed security modules. Users are solely responsible for protecting physical access to enrolled authenticator devices. Compromised devices must be immediately revoked via the security management portal.",
  },
  {
    id: "sec-3",
    title: "3. Have I Been Pwned (HIBP) Breach Telemetry",
    content:
      "To prevent credential-stuffing vulnerabilities, new password submissions are checked via k-anonymity SHA-1 hash prefixes against HIBP registries. No plaintext passwords or complete hash digests are ever exposed to third-party networks during this verification process.",
  },
  {
    id: "sec-4",
    title: "4. Asynchronous Queue Processing & Message Retention",
    content:
      "Transactional emails, PDF receipts, and audit log dispatches are processed asynchronously via BullMQ and Redis queues. Message payloads are encrypted in transit and purged automatically following delivery verification.",
  },
  {
    id: "sec-5",
    title: "5. Compliance, Governance & Dispute Resolution",
    content:
      "All system activities are recorded into an append-only audit trail. In the event of an operational dispute, the cryptographic hash of the ledger state shall serve as the definitive single source of truth.",
  },
];

export function LegalDocument({
  title = "Master Enterprise Services & Cryptographic Terms",
  version = "v2026.3.1",
  effectiveDate = "October 2026",
  sections = DEFAULT_SECTIONS,
  onAccept,
  onDecline,
  className,
}: LegalDocumentProps) {
  const [agreed, setAgreed] = React.useState(false);
  const [activeSectionId, setActiveSectionId] = React.useState(sections[0]?.id);
  const contentRef = React.useRef<HTMLDivElement>(null);

  const scrollToSection = (id: string) => {
    setActiveSectionId(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <Card className={cn("overflow-hidden border-border/80 shadow-none", className)}>
      <CardHeader className="border-b border-border/60 bg-surface-ivory pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2">
            <FileTextIcon className="size-5 text-primary" />
            <CardTitle className="text-base font-semibold">{title}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-xs">
              {version}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Effective: {effectiveDate}
            </Badge>
          </div>
        </div>
        <CardDescription className="text-xs mt-1">
          Please review the following enterprise service agreements and cryptographic custody terms.
        </CardDescription>
      </CardHeader>

      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr]">
        {/* Navigation Sidebar */}
        <aside className="border-r border-border/60 bg-surface-ivory/50 p-3 hidden md:block">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-2 py-1 mb-1">
            Sections
          </div>
          <nav className="flex flex-col gap-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={cn(
                  "flex items-center justify-between rounded-md px-2 py-1.5 text-left text-xs transition-colors",
                  activeSectionId === section.id
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <span className="truncate">{section.title}</span>
                <ChevronRightIcon className="size-3 shrink-0 opacity-50" />
              </button>
            ))}
          </nav>
        </aside>

        {/* Scrollable Content Body */}
        <CardContent
          ref={contentRef}
          className="max-h-[380px] overflow-y-auto p-6 space-y-6 text-sm text-foreground/90 leading-relaxed"
        >
          {sections.map((section) => (
            <div
              key={section.id}
              id={section.id}
              className="scroll-mt-6 border-b border-border/40 pb-6 last:border-b-0 last:pb-0"
            >
              <h3 className="font-semibold text-foreground text-sm mb-2 flex items-center gap-2">
                <ShieldCheckIcon className="size-4 text-primary shrink-0" />
                {section.title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {section.content}
              </p>
            </div>
          ))}
        </CardContent>
      </div>

      <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/60 bg-surface-ivory p-4">
        {/* Checkbox Acknowledgment */}
        <label className="flex items-center gap-2.5 text-xs text-foreground cursor-pointer select-none">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="size-4 rounded border-border/80 text-primary focus:ring-primary"
          />
          <span>I have read, understood, and accept these cryptographic service terms.</span>
        </label>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {onDecline && (
            <Button
              variant="outline"
              size="sm"
              onClick={onDecline}
            >
              Decline
            </Button>
          )}
          {onAccept && (
            <Button
              variant="default"
              size="sm"
              disabled={!agreed}
              onClick={onAccept}
              className="gap-1.5"
            >
              <CheckIcon className="size-3.5" />
              Accept Terms
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
