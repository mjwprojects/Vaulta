import type { PatientRow } from "../lib/useSupabaseData";

function cn(...c: (string | boolean | undefined)[]) { return c.filter(Boolean).join(" "); }

const ST: Record<string, string> = {
  critical: "text-red-600 bg-red-50 border-red-200",
  warning:  "text-amber-600 bg-amber-50 border-amber-200",
  stable:   "text-green-600 bg-green-50 border-green-200",
};

type Props = { patients: PatientRow[]; loading: boolean };

export function Patients({ patients, loading }: Props) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-slate-900">Patients</h2>
          <p className="text-xs text-slate-400">{patients.length} patients under your care</p>
        </div>
      </div>

      {patients.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-sm">
          No patients yet.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-slate-400 font-medium border-b border-slate-100">
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Condition</th>
                <th className="px-4 py-3 text-right">Adherence</th>
                <th className="px-4 py-3 text-right">Alerts</th>
                <th className="px-4 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {patients.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors cursor-pointer">
                  <td className="px-4 py-3 font-medium text-slate-900">{p.name}</td>
                  <td className="px-4 py-3 text-slate-500">{p.condition}</td>
                  <td className={cn(
                    "px-4 py-3 text-right font-semibold",
                    p.adherence >= 90 ? "text-green-600" : p.adherence >= 75 ? "text-amber-600" : "text-red-600"
                  )}>
                    {p.adherence}%
                  </td>
                  <td className="px-4 py-3 text-right text-slate-500">
                    {p.alertCount > 0 ? <span className="text-red-600 font-semibold">{p.alertCount}</span> : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full border", ST[p.status])}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
