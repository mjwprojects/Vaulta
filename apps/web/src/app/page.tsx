import Link from "next/link";
import Image from "next/image";

function VaultaGlyph({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lg-hero" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8E4DFF" />
          <stop offset="1" stopColor="#C084FC" />
        </linearGradient>
      </defs>
      <path d="M50 6L14 20v28c0 20 16 36 36 46 20-10 36-26 36-46V20L50 6z"
        stroke="url(#lg-hero)" strokeWidth="5" strokeLinejoin="round" fill="none" />
      <circle cx="36" cy="34" r="4" fill="url(#lg-hero)" />
      <circle cx="50" cy="28" r="5.5" fill="url(#lg-hero)" />
      <circle cx="64" cy="34" r="4" fill="url(#lg-hero)" />
      <path d="M50 72c-1 0-18-11-18-24 0-6 5-10 10-10 3 0 6 1.5 8 4 2-2.5 5-4 8-4 5 0 10 4 10 10 0 13-17 24-18 24z"
        stroke="url(#lg-hero)" strokeWidth="4.5" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

const features = [
  {
    icon: "🗂️",
    title: "Medical Records",
    desc: "Store diagnoses, lab results, and clinical notes for every family member — all in one secure place.",
  },
  {
    icon: "💊",
    title: "Medication Tracking",
    desc: "Track medications, dosages, schedules, and refill reminders across your whole household.",
  },
  {
    icon: "🚨",
    title: "Emergency Summaries",
    desc: "One-tap emergency cards with allergies, blood type, conditions, and contacts — ready when seconds count.",
  },
  {
    icon: "📋",
    title: "Care Plans",
    desc: "Manage ongoing care plans, appointment notes, and treatment timelines in a single clear view.",
  },
  {
    icon: "🔔",
    title: "Allergy & Alert System",
    desc: "Critical health alerts are surfaced immediately — allergies, contraindications, and urgent flags.",
  },
  {
    icon: "🔒",
    title: "Privacy First",
    desc: "Secure access controls, encrypted transport, protected storage, and audited permission-based sharing.",
  },
];

const stats = [
  { value: "1 vault", label: "for your whole family" },
  { value: "Always on", label: "accessible anywhere" },
  { value: "Zero friction", label: "in an emergency" },
];

export default function LandingPage() {
  return (
    <div style={{ backgroundColor: "var(--bg)", color: "var(--text)", minHeight: "100vh", fontFamily: "Inter, sans-serif" }}>

      {/* Nav */}
      <nav style={{ borderBottom: "1px solid var(--border)", backgroundColor: "rgba(11,6,20,0.85)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <VaultaGlyph size={36} />
            <div style={{ lineHeight: 1.1 }}>
              <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: "0.15em", color: "var(--text)" }}>VAULTA</div>
              <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--brand)" }}>Family Health</div>
            </div>
          </div>
          <Link
            href="/auth/login"
            style={{
              background: "linear-gradient(135deg, #8E4DFF, #7c3aed)",
              color: "#fff",
              padding: "8px 20px",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Sign In
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "96px 24px 80px", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(142,77,255,0.12)", border: "1px solid rgba(142,77,255,0.3)", borderRadius: 999, padding: "6px 16px", marginBottom: 32, fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", color: "var(--brand-hi)", textTransform: "uppercase" }}>
          🛡️ Your family's health, protected
        </div>

        <h1 style={{ fontSize: "clamp(2.4rem, 6vw, 4rem)", fontWeight: 800, lineHeight: 1.1, marginBottom: 24, letterSpacing: "-0.02em" }}>
          Family Health,<br />
          <span style={{ background: "linear-gradient(135deg, #8E4DFF, #C084FC)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Safely Organised.
          </span>
        </h1>

        <p style={{ fontSize: "clamp(1rem, 2.5vw, 1.2rem)", color: "var(--text-muted)", maxWidth: 560, margin: "0 auto 40px", lineHeight: 1.7 }}>
          Vaulta is a secure health vault for families — keeping medical records, care plans, allergies, and emergency information organised and accessible exactly when it matters most.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            href="/auth/login"
            style={{
              background: "linear-gradient(135deg, #8E4DFF, #7c3aed)",
              color: "#fff",
              padding: "14px 32px",
              borderRadius: 12,
              fontSize: 15,
              fontWeight: 700,
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            Get Started →
          </Link>
          <a
            href="#features"
            style={{
              border: "1px solid var(--border)",
              color: "var(--text-muted)",
              padding: "14px 32px",
              borderRadius: 12,
              fontSize: 15,
              fontWeight: 600,
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            Learn More
          </a>
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", gap: 0, justifyContent: "center", marginTop: 72, borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", flexWrap: "wrap" }}>
          {stats.map((s, i) => (
            <div key={i} style={{ flex: "1 1 160px", padding: "28px 24px", borderRight: i < stats.length - 1 ? "1px solid var(--border)" : "none", textAlign: "center" }}>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text)", marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 96px" }}>
        <h2 style={{ textAlign: "center", fontSize: "clamp(1.6rem, 4vw, 2.4rem)", fontWeight: 700, marginBottom: 12 }}>
          Everything your family needs
        </h2>
        <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 15, marginBottom: 56, maxWidth: 480, margin: "0 auto 56px" }}>
          Built around the real moments that matter — routine care, emergencies, and everything in between.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
          {features.map((f) => (
            <div
              key={f.title}
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 16,
                padding: 28,
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 14 }}>{f.icon}</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.65 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 96px" }}>
        <div
          style={{
            background: "linear-gradient(135deg, rgba(142,77,255,0.15) 0%, rgba(92,33,182,0.1) 100%)",
            border: "1px solid rgba(142,77,255,0.3)",
            borderRadius: 24,
            padding: "56px 48px",
            textAlign: "center",
          }}
        >
          <div style={{ marginBottom: 20 }}>
            <VaultaGlyph size={56} />
          </div>
          <h2 style={{ fontSize: "clamp(1.5rem, 4vw, 2.2rem)", fontWeight: 800, marginBottom: 14 }}>
            Ready to protect your family's health?
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: 15, maxWidth: 440, margin: "0 auto 32px", lineHeight: 1.7 }}>
            Join Vaulta and give your family the security of having everything organised — ready for any moment.
          </p>
          <Link
            href="/auth/login"
            style={{
              background: "linear-gradient(135deg, #8E4DFF, #7c3aed)",
              color: "#fff",
              padding: "14px 36px",
              borderRadius: 12,
              fontSize: 15,
              fontWeight: 700,
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            Sign In to Vaulta →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--border)", padding: "32px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <VaultaGlyph size={24} />
            <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.12em" }}>VAULTA</span>
          </div>
          <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
            © {new Date().getFullYear()} Vaulta · MJW GROUP · Privacy-first · Secure by design
          </p>
        </div>
      </footer>
    </div>
  );
}
