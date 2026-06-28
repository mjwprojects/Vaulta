import { useState, useEffect } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "./lib/supabase";
import { useDashboardData } from "./lib/useSupabaseData";
import { Sidebar } from "./components/Sidebar";
import { TitleBar } from "./components/TitleBar";
import { Overview } from "./views/Overview";
import { Patients } from "./views/Patients";
import { Alerts } from "./views/Alerts";
import { AuditLog } from "./views/AuditLog";
import { Login } from "./views/Login";

export type View = "overview" | "patients" | "alerts" | "audit";

export function App() {
  const [view, setView] = useState<View>("overview");
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const { patients, alerts, loading, refresh } = useDashboardData(user?.id);

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Login />;

  const activeAlerts = alerts.filter((a) => a.status === "active");
  const VIEWS: Record<View, React.ReactNode> = {
    overview: <Overview patients={patients} alerts={activeAlerts} loading={loading} />,
    patients: <Patients patients={patients} loading={loading} />,
    alerts:   <Alerts alerts={alerts} loading={loading} onRefresh={refresh} />,
    audit:    <AuditLog userId={user.id} />,
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <TitleBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar active={view} onChange={setView} alertCount={activeAlerts.length} />
        <main className="flex-1 overflow-y-auto p-5 bg-slate-50">
          {VIEWS[view]}
        </main>
      </div>
    </div>
  );
}
