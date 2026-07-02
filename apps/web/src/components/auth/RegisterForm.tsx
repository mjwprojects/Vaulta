"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff, Loader2, MailCheck } from "lucide-react";

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") ?? "/dashboard";
  // Registrations that arrive from an invite link are patients;
  // everyone else registers as a caregiver. 'admin' is rejected by
  // the DB trigger regardless of what the client sends.
  const isInviteFlow = nextUrl.startsWith("/invite/");
  const role = isInviteFlow ? "patient" : "caregiver";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [awaitingConfirm, setAwaitingConfirm] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { data, error: err } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role },
        emailRedirectTo: `${window.location.origin}${nextUrl.startsWith("/") ? nextUrl : "/dashboard"}`,
      },
    });
    setLoading(false);
    if (err) { setError(err.message); return; }

    if (data.session) {
      // Email confirmation disabled — signed in immediately
      router.push(nextUrl.startsWith("/") ? nextUrl : "/dashboard");
      router.refresh();
    } else {
      // Email confirmation required
      setAwaitingConfirm(true);
    }
  }

  const inputStyle = {
    backgroundColor: "var(--surface-raised)",
    border: "1px solid var(--border)",
    color: "var(--text)",
    width: "100%",
    padding: "10px 14px",
    borderRadius: "10px",
    fontSize: "14px",
    outline: "none",
  } as React.CSSProperties;

  if (awaitingConfirm) {
    return (
      <div className="space-y-4 text-center">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center mx-auto"
          style={{ backgroundColor: "rgba(34,197,94,0.1)", border: "2px solid rgba(34,197,94,0.3)" }}
        >
          <MailCheck className="w-7 h-7 text-green-400" />
        </div>
        <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>Check your email</p>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          We&apos;ve sent a confirmation link to <span style={{ color: "var(--text)" }}>{email}</span>.
          Click it to activate your account{isInviteFlow ? " and accept your invite" : ""}.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isInviteFlow && (
        <div
          className="rounded-xl px-4 py-3 text-xs"
          style={{ backgroundColor: "rgba(142,77,255,0.1)", border: "1px solid rgba(142,77,255,0.25)", color: "var(--text-muted)" }}
        >
          Create your account with the same email address your caregiver invited, then you&apos;ll
          be taken back to your invite.
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>
          Full name
        </label>
        <input
          type="text"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Jane Walters"
          style={inputStyle}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>
          Email address
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@family.co.za"
          style={inputStyle}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            style={{ ...inputStyle, paddingRight: "40px" }}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
            style={{ color: "var(--text-muted)" }}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>
          Confirm password
        </label>
        <input
          type={showPassword ? "text" : "password"}
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="••••••••"
          style={inputStyle}
        />
      </div>

      {error && (
        <div className="rounded-xl px-4 py-3 text-sm" style={{ backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5" }}>
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        style={{ background: "linear-gradient(135deg, #8E4DFF, #7c3aed)", color: "#fff" }}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {isInviteFlow ? "Create account & continue" : "Create caregiver account"}
      </button>

      <p className="text-center text-xs mt-4" style={{ color: "var(--text-muted)" }}>
        Already have an account?{" "}
        <Link
          href={`/auth/login${nextUrl !== "/dashboard" ? `?next=${encodeURIComponent(nextUrl)}` : ""}`}
          className="underline"
          style={{ color: "var(--brand)" }}
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
