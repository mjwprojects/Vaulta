"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Email address
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@clinic.co.za"
          className={cn(
            "w-full px-3.5 py-2.5 rounded-xl border text-sm",
            "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent",
            "placeholder:text-slate-400 transition-shadow"
          )}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className={cn(
              "w-full px-3.5 py-2.5 rounded-xl border text-sm pr-10",
              "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent",
              "placeholder:text-slate-400 transition-shadow"
            )}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className={cn(
          "w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl",
          "bg-brand-600 text-white text-sm font-semibold",
          "hover:bg-brand-700 active:bg-brand-800 transition-colors",
          "disabled:opacity-60 disabled:cursor-not-allowed"
        )}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        Sign in
      </button>

      <p className="text-center text-xs text-slate-500 mt-4">
        MFA-protected · Fully audited · Consent-based access
      </p>
    </form>
  );
}
