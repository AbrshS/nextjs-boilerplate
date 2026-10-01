import { Link } from "@/i18n/routing";
import { ArrowLeftIcon } from "lucide-react";

export function LegalDocument({
  title,
  effectiveDate,
  children,
}: {
  title: string;
  effectiveDate: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-svh bg-background">
      <div className="mx-auto w-full max-w-3xl px-6 py-10 md:py-14">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeftIcon className="size-3.5" />
          Back to sign in
        </Link>

        <header className="mt-8 space-y-2 border-b border-border/60 pb-6">
          <p className="text-[10px] font-black uppercase text-primary">
            MODRN RN Collective
          </p>
          <h1 className="text-3xl font-black md:text-4xl">
            {title}
          </h1>
          <p className="text-sm text-muted-foreground">
            Effective date: {effectiveDate}
          </p>
        </header>

        <article className="mt-8 space-y-8 text-sm leading-relaxed [&_h2]:text-base [&_h2]:font-black [&_h2]:text-foreground [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:space-y-1.5 [&_ol]:pl-5 [&_p]:text-muted-foreground [&_li]:text-muted-foreground">
          {children}
        </article>

        <footer className="mt-12 border-t border-border/60 pt-6 text-xs text-muted-foreground">
          <p>
            Questions? Contact{" "}
            <a
              href="mailto:support@modrnrncollective.com"
              className="font-semibold text-foreground underline underline-offset-2 hover:text-primary"
            >
              support@modrnrncollective.com
            </a>
            .
          </p>
          <p className="mt-3">
            © {new Date().getFullYear()} MODRN RN Collective. All rights
            reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}
