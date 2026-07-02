import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export const metadata: Metadata = { title: "Platform Admin" };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Backend-enforced gate: role comes from the profiles table (RLS-protected,
  // role changes blocked by DB trigger) — never from anything client-supplied.
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?next=/admin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/dashboard");

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg)" }}>
      <header
        className="h-16 flex items-center gap-4 px-6"
        style={{ backgroundColor: "var(--surface)", borderBottom: "1px solid var(--border)" }}
      >
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-sm"
          style={{ color: "var(--text-muted)" }}
        >
          <ArrowLeft className="w-4 h-4" />
          Dashboard
        </Link>
        <div className="flex items-center gap-2 ml-2">
          <ShieldCheck className="w-5 h-5" style={{ color: "var(--brand)" }} />
          <span className="font-bold text-sm tracking-wide" style={{ color: "var(--text)" }}>
            VAULTA PLATFORM ADMIN
          </span>
        </div>
        <span className="ml-auto text-xs" style={{ color: "var(--text-muted)" }}>
          {profile.full_name || user.email}
        </span>
      </header>
      <main className="p-6 max-w-6xl mx-auto">{children}</main>
    </div>
  );
}
