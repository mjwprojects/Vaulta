import { Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Log = { id: string; user: string; action: string; resource: string; ip: string; time: string };

export function AuditLog({ userId }: { userId: string }) {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("audit_logs")
      .select("id, action, resource_type, resource_id, metadata, created_at, profiles(full_name)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(200)
      .then(({ data }) => {
        setLogs((data ?? []).map((l: any) => ({
          id: l.id,
          user: l.profiles?.full_name ?? "You",
          action: l.action,
          resource: `${l.resource_type ?? ""}${l.resource_id ? ` — ${l.resource_id}` : ""}`,
          ip: (l.metadata as any)?.ip ?? "—",
          time: new Date(l.created_at).toLocaleString(),
        })));
        setLoading(false);
      });
  }, [userId]);

  return (
    <div className="max-w-4xl space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-brand-50 rounded-xl border border-brand-100">
          <Shield className="w-4 h-4 text-brand-600" />
        </div>
        <div>
          <h2 className="font-bold text-slate-900">Audit Log</h2>
          <p className="text-xs text-slate-400">Immutable record of all data access and actions</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-6 h-6 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-slate-400 font-medium border-b border-slate-100">
                <th className="px-4 py-3 text-left">User</th>
                <th className="px-4 py-3 text-left">Action</th>
                <th className="px-4 py-3 text-left">Resource</th>
                <th className="px-4 py-3 text-left">IP</th>
                <th className="px-4 py-3 text-left">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-slate-400 text-sm">No audit entries yet.</td>
                </tr>
              ) : logs.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-2.5 font-medium text-slate-800">{l.user}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-slate-600">{l.action}</td>
                  <td className="px-4 py-2.5 text-slate-500 truncate max-w-[180px]">{l.resource}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-slate-400">{l.ip}</td>
                  <td className="px-4 py-2.5 text-slate-400 text-xs whitespace-nowrap">{l.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
