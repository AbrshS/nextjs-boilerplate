export function AnimatedGlassPageBackground() {
  return (
    <>
      <div
        aria-hidden
        className="animate-auth-bg-gradient pointer-events-none absolute inset-0"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_15%_10%,rgba(251,146,60,0.12),transparent_55%),radial-gradient(90%_70%_at_85%_90%,rgba(99,102,241,0.1),transparent_52%)] dark:bg-[radial-gradient(120%_80%_at_15%_10%,rgba(251,146,60,0.08),transparent_55%),radial-gradient(90%_70%_at_85%_90%,rgba(79,70,229,0.12),transparent_52%)]"
      />
      <div aria-hidden className="auth-bg-orb auth-bg-orb-1" />
      <div aria-hidden className="auth-bg-orb auth-bg-orb-2" />
      <div aria-hidden className="auth-bg-orb auth-bg-orb-3" />
      <div
        aria-hidden
        className="animate-auth-grid-drift pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-[0.2]"
      />
    </>
  );
}
