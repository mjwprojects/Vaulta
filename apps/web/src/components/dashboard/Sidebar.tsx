"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldCheck,
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

function AlertBadge() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const supabase = createClient();
    supabase.from("alerts").select("id", { count: "exact", head: true }).eq("status", "active")
      .then(({ count: c }) => setCount(c ?? 0));
    const ch = supabase.channel("sidebar-alerts")
      .on("postgres_changes", { event: "*", schema: "public", table: "alerts" }, () => {
        supabase.from("alerts").select("id", { count: "exact", head: true }).eq("status", "active")
          .then(({ count: c }) => setCount(c ?? 0));
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
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/patients", label: "Patients", icon: Users },
  { href: "/dashboard/alerts", label: "Alerts", icon: Bell },
  { href: "/dashboard/audit", label: "Audit Log", icon: ClipboardList },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
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
    <aside className="w-64 flex flex-col bg-white border-r border-slate-200 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-6 h-16 border-b border-slate-100">
        <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
          <ShieldCheck className="w-5 h-5 text-white" />
        </div>
        <span className="text-lg font-bold text-slate-900">Vaulta</span>
        <span className="ml-auto text-xs font-medium text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded">
          2.0
        </span>
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
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-brand-50 text-brand-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Icon className={cn("w-4 h-4", active ? "text-brand-600" : "text-slate-400")} />
              {label}
              {label === "Alerts" && (
                <AlertBadge />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Sign out */}
      <div className="p-3 border-t border-slate-100">
        <button
          onClick={signOut}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 w-full transition-colors"
        >
          <LogOut className="w-4 h-4 text-slate-400" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
