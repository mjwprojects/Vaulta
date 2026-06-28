import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = { title: "Sign In" };

function VaultaGlyph() {
  return (
    <svg width="44" height="44" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8E4DFF" />
          <stop offset="1" stopColor="#C084FC" />
        </linearGradient>
      </defs>
      <path d="M50 6L14 20v28c0 20 16 36 36 46 20-10 36-26 36-46V20L50 6z"
        stroke="url(#lg)" strokeWidth="5" strokeLinejoin="round" fill="none" />
      <circle cx="36" cy="34" r="4" fill="url(#lg)" />
      <circle cx="50" cy="28" r="5.5" fill="url(#lg)" />
      <circle cx="64" cy="34" r="4" fill="url(#lg)" />
      <path d="M50 72c-1 0-18-11-18-24 0-6 5-10 10-10 3 0 6 1.5 8 4 2-2.5 5-4 8-4 5 0 10 4 10 10 0 13-17 24-18 24z"
        stroke="url(#lg)" strokeWidth="4.5" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "var(--bg)" }}>
      {/* Brand panel */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12"
        style={{
          background: "linear-gradient(160deg, #151022 0%, #0B0614 50%, #1a0a2e 100%)",
          borderRight: "1px solid var(--border)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <VaultaGlyph />
          <div className="flex flex-col leading-tight">
            <span className="text-xl font-bold tracking-widest" style={{ color: "var(--text)" }}>VAULTA</span>
            <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#8E4DFF" }}>Family Health</span>
          </div>
        </div>

        {/* Hero copy */}
        <div>
          <h1 className="text-4xl font-bold leading-tight mb-5" style={{ color: "var(--text)" }}>
            Family Health,<br />Safely Organised.
          </h1>
          <p className="text-lg leading-relaxed" style={{ color: "var(--text-muted)" }}>
            Secure records. Clear care. Always accessible when it matters most.
          </p>

          {/* Feature list */}
          <ul className="mt-8 space-y-3">
            {[
              "Medical records & care plans",
              "Emergency contacts & allergy alerts",
              "Medication tracking & appointment notes",
              "Exportable emergency summaries",
            ].map((f) => (
              <li key={f} className="flex items-center gap-3 text-sm" style={{ color: "var(--text-muted)" }}>
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: "#8E4DFF" }} />
                {f}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          © {new Date().getFullYear()} Vaulta · MJW GROUP
        </p>
      </div>

      {/* Form panel */}
      <div
        className="flex-1 flex flex-col items-center justify-center p-8"
        style={{ backgroundColor: "var(--bg)" }}
      >
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <VaultaGlyph />
            <div className="flex flex-col leading-tight">
              <span className="text-lg font-bold tracking-widest" style={{ color: "var(--text)" }}>VAULTA</span>
              <span className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: "#8E4DFF" }}>Family Health</span>
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-1" style={{ color: "var(--text)" }}>Welcome back</h2>
          <p className="mb-8 text-sm" style={{ color: "var(--text-muted)" }}>Sign in to your Vaulta account</p>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
