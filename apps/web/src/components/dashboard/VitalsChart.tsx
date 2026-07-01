"use client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export type VitalPoint = {
  day: string;
  heartRate?: number | null;
  systolic?: number | null;
  diastolic?: number | null;
  oxygen?: number | null;
};

interface VitalsChartProps {
  data?: VitalPoint[];
  title?: string;
}

export function VitalsChart({ data, title }: VitalsChartProps) {
  const hasData = data && data.length > 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-semibold text-slate-900">
            {title ?? "Vitals Trend"}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Last 7 days</p>
        </div>
        {hasData && (
          <select className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
          </select>
        )}
      </div>

      {!hasData ? (
        <div className="h-[220px] flex flex-col items-center justify-center text-slate-400 text-sm gap-2">
          <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center mb-1">
            <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="font-medium text-slate-500">No vitals recorded yet</p>
          <p className="text-xs text-slate-400">Readings will appear here once a patient logs them</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
              itemStyle={{ color: "#334155" }}
            />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
            <Line type="monotone" dataKey="heartRate" stroke="#2a8aff" strokeWidth={2} dot={false} name="Heart rate" />
            <Line type="monotone" dataKey="systolic" stroke="#ef4444" strokeWidth={2} dot={false} name="Systolic BP" />
            <Line type="monotone" dataKey="oxygen" stroke="#22c55e" strokeWidth={2} dot={false} name="O₂ sat %" />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
