import { Users, Bell, Activity, ShieldCheck, AlertTriangle, Pill, Clock } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import type { PatientRow, AlertRow } from "../lib/useSupabaseData";

function cn(...c: (string | boolean | undefined)[]) { return c.filter(Boolean).join(" "); }

const COLOR = {
  blue:  "bg-blue-50 text-blue-600",
  red:   "bg-red-50 text-red-600",
  green: "bg-green-50 text-green-600",
  amber: "bg-amber-50 text-amber-600",
};

const SEV: Record<string, string> = {
  critical: "text-red-600 bg-red-50",
  high:     "text-orange-600 bg-orange-50",
  medium:   "text-amber-600 bg-amber-50",
  low:      "text-blue-600 bg-blue-50",
};

const ST: Record<string, string> = {
  critical: "text-red-600 bg-red-50 border-red-100",
  warning:  "text-amber-600 bg-amber-50 border-amber-100",
  stable:   "text-green-600 bg-green-50 border-green-100",
};

type Props = { patients: PatientRow[]; alerts: AlertRow[]; loading: boolean };

export function Overview({ patients, alerts, loading }: Props) {
  const criticalCount = alerts.filter((a) => a.severity === "critical").length;
  const avgAdherence = patients.length
    ? Math.round(patients.reduce((s, p) => s + p.adherence, 0) / patients.length)
    : 100;

  const stats = [
    { label: "Patients",        value: String(patients.length), sub: `${patients.filter(p => p.status === "stable").length} stable`,     icon: Users,       color: "blue"  as const },
    { label: "Active Alerts",   value: String(alerts.length),   sub: criticalCount > 0 ? `${criticalCount} critical` : "None critical",   icon: Bell,        color: "red"   as const },
    { label: "Adherence (avg)", value: `${avgAdherence}%`,      sub: "Today's medication",                                                icon: ShieldCheck, color: "green" as const },
    { label: "Check-ins today", value: `${patients.length}`,    sub: "Active patients",                                                   icon: Activity,    color: "amber" as const },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {stats.map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-slate-200 p-4 flex items-start gap-3">
            <div className={cn("p-2 rounded-xl", COLOR[color])}>
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">{label}</p>
              <p className="text-xl font-bold text-slate-900">{value}</p>
              <p className="text-xs text-slate-400">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-5 gap-4">
        {/* Vitals placeholder chart — would need per-patient selection */}
        <div className="col-span-3 bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-semibold text-slate-900 text-sm">Vitals Overview</p>
              <p className="text-xs text-slate-400">Select a patient to view their vitals</p>
            </div>
          </div>
          {patients.length === 0 ? (
            <div className="h-[180px] flex items-center justify-center text-slate-400 text-sm">
              No patients yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={[]} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 11 }} />
                <Line type="monotone" dataKey="hr"  stroke="#2a8aff" strokeWidth={2} dot={false} name="Heart rate" />
                <Line type="monotone" dataKey="sys" stroke="#ef4444" strokeWidth={2} dot={false} name="Systolic" />
                <Line type="monotone" dataKey="o2"  stroke="#22c55e" strokeWidth={2} dot={false} name="SpO₂ %" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="col-span-2 bg-white rounded-2xl border border-slate-200 flex flex-col">
          <p className="px-4 pt-4 pb-2 font-semibold text-slate-900 text-sm border-b border-slate-100">
            Active Alerts
          </p>
          <div className="divide-y divide-slate-100 flex-1">
            {alerts.length === 0 ? (
              <p className="px-4 py-6 text-xs text-slate-400 text-center">All patients stable</p>
            ) : alerts.slice(0, 5).map((a) => (
              <div key={a.id} className="flex items-start gap-2.5 px-4 py-3">
                <div className={cn("p-1.5 rounded-lg mt-0.5 shrink-0", SEV[a.severity] ?? "text-slate-600 bg-slate-50")}>
                  {a.type === "emergency" ? <AlertTriangle className="w-3 h-3" /> : <Pill className="w-3 h-3" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-900 truncate">{a.patient}</p>
                  <p className="text-xs text-slate-500 mt-0.5 leading-snug">{a.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Patient table */}
      <div className="bg-white rounded-2xl border border-slate-200">
        <p className="px-4 pt-4 pb-2 font-semibold text-slate-900 text-sm border-b border-slate-100">
          Patients
        </p>
        {patients.length === 0 ? (
          <p className="px-4 py-8 text-center text-slate-400 text-sm">No patients under your care yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-slate-400 font-medium">
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Condition</th>
                <th className="px-4 py-2 text-right">Adherence</th>
                <th className="px-4 py-2 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {patients.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors cursor-pointer">
                  <td className="px-4 py-2.5 font-medium text-slate-900 whitespace-nowrap">{p.name}</td>
                  <td className="px-4 py-2.5 text-slate-500 whitespace-nowrap">{p.condition}</td>
                  <td className={cn(
                    "px-4 py-2.5 text-right font-semibold",
                    p.adherence >= 90 ? "text-green-600" : p.adherence >= 75 ? "text-amber-600" : "text-red-600"
                  )}>
                    {p.adherence}%
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full border", ST[p.status])}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
