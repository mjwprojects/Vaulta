"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Bell,
  ClipboardList,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/* Vaulta glyph — shield + family dots + heart, purple gradient */
function VaultaGlyph({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="vg" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8E4DFF" />
          <stop offset="1" stopColor="#C084FC" />
        </linearGradient>
      </defs>
      {/* Shield */}
      <path
        d="M50 6L14 20v28c0 20 16 36 36 46 20-10 36-26 36-46V20L50 6z"
        stroke="url(#vg)" strokeWidth="5" strokeLinejoin="round" fill="none"
      />
      {/* Family dots */}
      <circle cx="36" cy="34" r="4" fill="url(#vg)" />
      <circle cx="50" cy="28" r="5.5" fill="url(#vg)" />
      <circle cx="64" cy="34" r="4" fill="url(#vg)" />
      {/* Heart */}
      <path
        d="M50 72c-1 0-18-11-18-24 0-6 5-10 10-10 3 0 6 1.5 8 4 2-2.5 5-4 8-4 5 0 10 4 10 10 0 13-17 24-18 24z"
        stroke="url(#vg)" strokeWidth="4.5" strokeLinejoin="round" fill="none"
      />
    </svg>
  );
}

function AlertBadge() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const supabase = createClient();
    (supabase as any).from("alerts").select("id", { count: "exact", head: true }).eq("status", "active")
      .then(({ count: c }: any) => setCount(c ?? 0));
    const ch = supabase.channel("sidebar-alerts")
      .on("postgres_changes", { event: "*", schema: "public", table: "alerts" }, () => {
        (supabase as any).from("alerts").select("id", { count: "exact", head: true }).eq("status", "active")
          .then(({ count: c }: any) => setCount(c ?? 0));
      }).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);
  if (!count) return null;
  return (
    <span className="ml-auto text-xs font-semibold text-white bg-red-500 rounded-full w-5 h-5 flex items-center justify-center leading-none">
      {count > 9 ? "9+" : count}
    </span>
  );
}

const NAV = [
  { href: "/dashboard",          label: "Overview",  icon: LayoutDashboard, exact: true },
  { href: "/dashboard/patients", label: "Patients",  icon: Users },
  { href: "/dashboard/alerts",   label: "Alerts",    icon: Bell },
  { href: "/dashboard/audit",    label: "Audit Log", icon: ClipboardList },
  { href: "/dashboard/settings", label: "Settings",  icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  }

  return (
    <aside
      className="w-64 flex flex-col shrink-0"
      style={{ backgroundColor: "var(--surface)", borderRight: "1px solid var(--border)" }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-5 h-16"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <VaultaGlyph size={34} />
        <div className="flex flex-col leading-tight">
          <span className="text-base font-bold tracking-wide" style={{ color: "var(--text)" }}>
            VAULTA
          </span>
          <span className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: "var(--brand)" }}>
            Family Health
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                active
                  ? "text-white"
                  : "hover:text-white"
              )}
              style={active ? {
                background: "linear-gradient(135deg, rgba(142,77,255,0.25), rgba(192,132,252,0.1))",
                borderLeft: "2px solid var(--brand)",
                color: "var(--text)",
              } : {
                color: "var(--text-muted)",
              }}
            >
              <Icon
                className="w-4 h-4 shrink-0"
                style={{ color: active ? "var(--brand)" : "var(--text-muted)" }}
              />
              {label}
              {label === "Alerts" && <AlertBadge />}
            </Link>
          );
        })}
      </nav>

      {/* Footer — sign out + MJW owner mark */}
      <div className="p-3" style={{ borderTop: "1px solid var(--border)" }}>
        <button
          onClick={signOut}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium w-full transition-colors"
          style={{ color: "var(--text-muted)" }}
          onMouseEnter={e => (e.currentTarget.style.color = "var(--text)")}
          onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
        <p className="text-center text-[10px] mt-3" style={{ color: "var(--text-muted)" }}>
          MJW GROUP
        </p>
      </div>
    </aside>
  );
}
