"use client";
import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { AuthShell } from "@/components/auth/AuthShell";
import { Loader2, MailCheck } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    setLoading(false);
    if (err) { setError(err.message); return; }
    setSent(true);
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

  return (
    <AuthShell heading="Reset Password">
      {sent ? (
        <div className="space-y-4 text-center">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto"
            style={{ backgroundColor: "rgba(34,197,94,0.1)", border: "2px solid rgba(34,197,94,0.3)" }}
          >
            <MailCheck className="w-7 h-7 text-green-400" />
          </div>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            If an account exists for <span style={{ color: "var(--text)" }}>{email}</span>, a
            password reset link is on its way.
          </p>
          <Link href="/auth/login" className="inline-block text-sm underline" style={{ color: "var(--brand)" }}>
            Back to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Enter your email address and we&apos;ll send you a link to reset your password.
          </p>
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
          {error && (
            <div className="rounded-xl px-4 py-3 text-sm" style={{ backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5" }}>
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all disabled:opacity-60"
            style={{ background: "linear-gradient(135deg, #8E4DFF, #7c3aed)", color: "#fff" }}
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Send reset link
          </button>
          <p className="text-center text-xs" style={{ color: "var(--text-muted)" }}>
            <Link href="/auth/login" className="underline" style={{ color: "var(--brand)" }}>
              Back to sign in
            </Link>
          </p>
        </form>
      )}
    </AuthShell>
  );
}
