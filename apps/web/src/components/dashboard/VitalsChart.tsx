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

const DATA = [
  { day: "Mon", heartRate: 72, systolic: 128, diastolic: 82, oxygen: 97 },
  { day: "Tue", heartRate: 75, systolic: 132, diastolic: 85, oxygen: 96 },
  { day: "Wed", heartRate: 70, systolic: 126, diastolic: 80, oxygen: 98 },
  { day: "Thu", heartRate: 78, systolic: 140, diastolic: 90, oxygen: 95 },
  { day: "Fri", heartRate: 74, systolic: 138, diastolic: 88, oxygen: 96 },
  { day: "Sat", heartRate: 71, systolic: 130, diastolic: 83, oxygen: 97 },
  { day: "Sun", heartRate: 73, systolic: 158, diastolic: 96, oxygen: 96 },
];

export function VitalsChart() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-semibold text-slate-900">Vitals Trend — Sarah Dlamini</h2>
          <p className="text-xs text-slate-400 mt-0.5">Last 7 days</p>
        </div>
        <select className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500">
          <option>Last 7 days</option>
          <option>Last 30 days</option>
          <option>Last 90 days</option>
        </select>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={DATA} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
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
    </div>
  );
}
