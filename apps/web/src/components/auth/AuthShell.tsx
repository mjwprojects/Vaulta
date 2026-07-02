function VaultaLogo() {
  return (
    <svg width="52" height="52" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lg-shell" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8E4DFF" />
          <stop offset="1" stopColor="#C084FC" />
        </linearGradient>
      </defs>
      <path d="M50 6L14 20v28c0 20 16 36 36 46 20-10 36-26 36-46V20L50 6z"
        stroke="url(#lg-shell)" strokeWidth="5" strokeLinejoin="round" fill="none" />
      <circle cx="36" cy="34" r="4" fill="url(#lg-shell)" />
      <circle cx="50" cy="28" r="5.5" fill="url(#lg-shell)" />
      <circle cx="64" cy="34" r="4" fill="url(#lg-shell)" />
      <path d="M50 72c-1 0-18-11-18-24 0-6 5-10 10-10 3 0 6 1.5 8 4 2-2.5 5-4 8-4 5 0 10 4 10 10 0 13-17 24-18 24z"
        stroke="url(#lg-shell)" strokeWidth="4.5" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function AuthShell({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ backgroundColor: "var(--bg)" }}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-8"
        style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <div className="flex flex-col items-center mb-8">
          <VaultaLogo />
          <div className="mt-3 text-center leading-tight">
            <div className="text-2xl font-bold tracking-widest" style={{ color: "var(--text)" }}>
              VAULTA
            </div>
            <div className="text-xs font-semibold tracking-widest uppercase mt-0.5" style={{ color: "#8E4DFF" }}>
              Family Health
            </div>
          </div>
        </div>

        <p className="text-center text-sm mb-6" style={{ color: "var(--text-muted)" }}>
          Family health, safely organised.
        </p>

        <div className="mb-6">
          <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: "var(--text-muted)" }}>
            {heading}
          </p>
        </div>

        {children}
      </div>

      <div className="mt-6 flex items-center gap-4 text-xs" style={{ color: "var(--text-muted)" }}>
        <span>VAULTA</span>
        <span style={{ color: "var(--border)" }}>·</span>
        <span>FAMILY HEALTH</span>
        <span style={{ color: "var(--border)" }}>·</span>
        <span>MJW GROUP</span>
      </div>
    </div>
  );
}
