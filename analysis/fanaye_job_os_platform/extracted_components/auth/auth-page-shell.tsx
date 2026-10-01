import { Link } from "@/i18n/routing";
import { AnimatedGlassPageBackground } from "@/shared/components/animated-glass-background";
import { glassPanelClassName } from "@/shared/components/glass-panel";
import { SimpleThemeToggle } from "@/shared/components/simple-theme-toggle";
import { TefTefLogo } from "@/shared/components/teftef-logo";
import { cn } from "@/shared/utils/cn";

type AuthPageShellProps = {
  children: React.ReactNode;
  className?: string;
};

export function AuthPageShell({ children, className }: AuthPageShellProps) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background transition-colors duration-300">
      <AnimatedGlassPageBackground />

      <div className="absolute top-6 right-6 z-20">
        <SimpleThemeToggle />
      </div>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-10 sm:px-6">
        {/* <Link
          href="/"
          className="mb-8 transition-opacity hover:opacity-80"
          aria-label="Go to home"
        >
          <TefTefLogo className="h-7 w-auto text-foreground" />
        </Link> */}

        <div
          className={cn(
            glassPanelClassName,
            "w-full max-w-[420px] px-6 py-8 md:px-8 md:py-10",
            className,
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
