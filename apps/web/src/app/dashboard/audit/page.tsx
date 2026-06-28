import type { Metadata } from "next";
import { formatDate, formatTime } from "@/lib/utils";
import { Shield } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Audit Log" };
export const dynamic = "force-dynamic";

export default async function AuditPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: logs } = await supabase
    .from("audit_logs")
    .select("id, action, resource_type, resource_id, metadata, created_at, profiles(full_name)")
    .eq("user_id", user?.id ?? "")
    .order("created_at", { ascending: false })
    .limit(200);

  const rows = (logs ?? []).map((l: any) => ({
    id: l.id,
    user: l.profiles?.full_name ?? "You",
    action: l.action as string,
    resource: `${l.resource_type ?? ""}${l.resource_id ? ` — ${l.resource_id}` : ""}`,
    ip: (l.metadata as any)?.ip ?? "—",
    time: l.created_at as string,
  }));

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-brand-50 rounded-xl border border-brand-100">
          <Shield className="w-5 h-5 text-brand-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Audit Log</h1>
          <p className="text-sm text-slate-500">Immutable record of all data access and actions</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs text-slate-500 font-semibold uppercase tracking-wide">
              <th className="px-5 py-3 text-left">User</th>
              <th className="px-5 py-3 text-left">Action</th>
              <th className="px-5 py-3 text-left">Resource</th>
              <th className="px-5 py-3 text-left">IP</th>
              <th className="px-5 py-3 text-left">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-slate-400">No audit entries yet.</td>
              </tr>
            ) : rows.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-5 py-3 font-medium text-slate-800">{r.user}</td>
                <td className="px-5 py-3 font-mono text-xs text-slate-600">{r.action}</td>
                <td className="px-5 py-3 text-slate-600 truncate max-w-xs">{r.resource}</td>
                <td className="px-5 py-3 text-slate-500 font-mono text-xs">{r.ip}</td>
                <td className="px-5 py-3 text-slate-500 whitespace-nowrap">
                  {formatDate(r.time)} {formatTime(r.time)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
