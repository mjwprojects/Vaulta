"use client";
import { usePatientDetail } from "@/hooks/usePatientDetail";
import { cn, formatDate, formatRelative, severityColor } from "@/lib/utils";
import { VitalsChart } from "./VitalsChart";
import type { VitalPoint } from "./VitalsChart";
import {
  ArrowLeft, AlertTriangle, Pill, Heart, Thermometer,
  Droplets, Wind, Scale, Activity, Loader2, Phone, ShieldAlert,
} from "lucide-react";
import Link from "next/link";
import type { HealthRecord } from "@vaulta/types";

export function PatientDetailClient({ patientId }: { patientId: string }) {
  const { patient, loading, error } = usePatientDetail(patientId);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
    </div>
  );

  if (error || !patient) return (
    <div className="text-center py-16 text-slate-500">
      {error ?? "Patient not found or access not permitted."}
    </div>
  );

  const latestRecord = patient.health_records[0] ?? null;
  const activeAlerts = patient.alerts.filter((a) => a.status === "active");
  const activeMeds = patient.medications.filter((m) => m.is_active);
  const adherence = calcAdherence(patient.medications.flatMap((m) => m.logs));

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/patients" className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
          <ArrowLeft className="w-4 h-4 text-slate-600" />
        </Link>
        <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-lg font-bold shrink-0">
          {patient.profile.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">{patient.profile.full_name}</h1>
          <p className="text-sm text-slate-400">
            {patient.primary_condition ?? "No condition specified"} · DOB {formatDate(patient.date_of_birth)}
            {patient.blood_type && ` · Blood type ${patient.blood_type}`}
          </p>
        </div>
        {activeAlerts.length > 0 && (
          <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold">
            <AlertTriangle className="w-4 h-4" />
            {activeAlerts.length} active alert{activeAlerts.length > 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <QuickStat label="Medication adherence" value={`${adherence}%`}
          color={adherence >= 90 ? "green" : adherence >= 75 ? "amber" : "red"} />
        <QuickStat label="Last check-in"
          value={latestRecord ? formatRelative(latestRecord.recorded_at) : "Never"} color="blue" />
        <QuickStat label="Active medications" value={String(activeMeds.length)} color="blue" />
        <QuickStat label="Active alerts" value={String(activeAlerts.length)}
          color={activeAlerts.length > 0 ? "red" : "green"} />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left — vitals + records */}
        <div className="xl:col-span-2 space-y-6">
          <VitalsChartFromRecords records={patient.health_records} patientName={patient.profile.full_name} />
          <LatestVitals record={latestRecord} />
          <MedicationsCard meds={activeMeds} />
        </div>

        {/* Right — alerts + emergency */}
        <div className="space-y-6">
          <ActiveAlertsCard alerts={activeAlerts} />
          <EmergencyCard patient={patient} />
        </div>
      </div>

      {/* Recent records table */}
      <RecentRecordsTable records={patient.health_records.slice(0, 10)} />
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────

function QuickStat({ label, value, color }: { label: string; value: string; color: string }) {
  const cls = {
    green: "text-green-700", red: "text-red-700", amber: "text-amber-700", blue: "text-brand-700",
  }[color] ?? "text-slate-900";
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4">
      <p className="text-xs text-slate-500 font-medium">{label}</p>
      <p className={cn("text-2xl font-bold mt-1", cls)}>{value}</p>
    </div>
  );
}

function VitalsChartFromRecords({ records, patientName }: { records: HealthRecord[]; patientName: string }) {
  const chartData: VitalPoint[] = records.slice(0, 7).reverse().map((r) => ({
    day: new Date(r.recorded_at).toLocaleDateString("en-ZA", { weekday: "short" }),
    heartRate: r.heart_rate ?? null,
    systolic: r.blood_pressure_systolic ?? null,
    oxygen: r.oxygen_saturation ?? null,
  }));
  return (
    <VitalsChart
      data={chartData}
      title={`Vitals Trend — ${patientName}`}
    />
  );
}

function LatestVitals({ record }: { record: HealthRecord | null }) {
  if (!record) return null;
  const vitals = [
    { icon: Heart,        label: "Heart rate",  value: record.heart_rate ? `${record.heart_rate} bpm` : "—" },
    { icon: Activity,     label: "BP",          value: record.blood_pressure_systolic ? `${record.blood_pressure_systolic}/${record.blood_pressure_diastolic}` : "—" },
    { icon: Wind,         label: "SpO₂",        value: record.oxygen_saturation ? `${record.oxygen_saturation}%` : "—" },
    { icon: Thermometer,  label: "Temp",        value: record.temperature ? `${record.temperature}°C` : "—" },
    { icon: Droplets,     label: "Glucose",     value: record.glucose_mmol ? `${record.glucose_mmol} mmol/L` : "—" },
    { icon: Scale,        label: "Weight",      value: record.weight_kg ? `${record.weight_kg} kg` : "—" },
  ];
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900">Latest Vitals</h3>
        <span className="text-xs text-slate-400">{formatRelative(record.recorded_at)}</span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {vitals.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-slate-400 shrink-0" />
            <div>
              <p className="text-xs text-slate-400">{label}</p>
              <p className="text-sm font-semibold text-slate-800">{value}</p>
            </div>
          </div>
        ))}
      </div>
      {record.symptoms.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          <p className="text-xs text-slate-500 mb-2">Reported symptoms</p>
          <div className="flex flex-wrap gap-1.5">
            {record.symptoms.map((s) => (
              <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MedicationsCard({ meds }: { meds: any[] }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
        <Pill className="w-4 h-4 text-brand-500" />
        <h3 className="font-semibold text-slate-900">Active Medications</h3>
      </div>
      {meds.length === 0 ? (
        <p className="px-5 py-6 text-sm text-slate-400 text-center">No active medications.</p>
      ) : (
        <div className="divide-y divide-slate-100">
          {meds.map((m) => (
            <div key={m.id} className="px-5 py-3.5 flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900 text-sm">{m.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{m.dosage} · {m.frequency}</p>
              </div>
              <span className="text-xs text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full font-medium">
                Active
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ActiveAlertsCard({ alerts }: { alerts: any[] }) {
  if (!alerts.length) return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 text-center text-slate-400 text-sm">
      <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-2">
        <Activity className="w-4 h-4 text-green-500" />
      </div>
      No active alerts
    </div>
  );
  return (
    <div className="bg-white rounded-2xl border border-slate-200">
      <p className="px-5 pt-4 pb-2 font-semibold text-slate-900 border-b border-slate-100 text-sm">Active Alerts</p>
      <div className="divide-y divide-slate-100">
        {alerts.map((a) => (
          <div key={a.id} className="px-4 py-3 flex items-start gap-3">
            <div className={cn("p-1.5 rounded-lg border mt-0.5 shrink-0", severityColor(a.severity))}>
              <AlertTriangle className="w-3 h-3" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">{a.title}</p>
              <p className="text-xs text-slate-500 mt-0.5">{a.message}</p>
              <p className="text-xs text-slate-400 mt-1">{formatRelative(a.created_at)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmergencyCard({ patient }: { patient: any }) {
  return (
    <div className="bg-red-50 rounded-2xl border border-red-200 p-5">
      <div className="flex items-center gap-2 mb-3">
        <ShieldAlert className="w-4 h-4 text-red-600" />
        <h3 className="font-semibold text-red-800 text-sm">Emergency Info</h3>
      </div>
      <div className="space-y-2 text-sm">
        {patient.blood_type && (
          <div className="flex justify-between">
            <span className="text-red-600">Blood type</span>
            <span className="font-bold text-red-800">{patient.blood_type}</span>
          </div>
        )}
        {patient.allergies.length > 0 && (
          <div>
            <p className="text-red-600 mb-1">Allergies</p>
            <div className="flex flex-wrap gap-1">
              {patient.allergies.map((a: string) => (
                <span key={a} className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full border border-red-200">
                  {a}
                </span>
              ))}
            </div>
          </div>
        )}
        {patient.emergency_contact_name && (
          <div className="pt-2 border-t border-red-200">
            <p className="text-red-600 text-xs mb-1">Emergency contact</p>
            <p className="font-semibold text-red-800">{patient.emergency_contact_name}</p>
            {patient.emergency_contact_phone && (
              <a href={`tel:${patient.emergency_contact_phone}`}
                className="flex items-center gap-1 text-red-700 text-xs mt-0.5 hover:underline">
                <Phone className="w-3 h-3" />
                {patient.emergency_contact_phone}
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function RecentRecordsTable({ records }: { records: HealthRecord[] }) {
  if (!records.length) return null;
  return (
    <div className="bg-white rounded-2xl border border-slate-200">
      <p className="px-5 pt-4 pb-3 font-semibold text-slate-900 border-b border-slate-100 text-sm">
        Recent Health Records
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-slate-400 font-medium">
              {["Date","HR","BP","SpO₂","Temp","Glucose","Mood","Symptoms"].map((h) => (
                <th key={h} className="px-4 py-2 text-left whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {records.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-2.5 text-slate-500 whitespace-nowrap">{formatDate(r.recorded_at)}</td>
                <td className="px-4 py-2.5 font-medium">{r.heart_rate ?? "—"}</td>
                <td className="px-4 py-2.5">{r.blood_pressure_systolic ? `${r.blood_pressure_systolic}/${r.blood_pressure_diastolic}` : "—"}</td>
                <td className="px-4 py-2.5">{r.oxygen_saturation ? `${r.oxygen_saturation}%` : "—"}</td>
                <td className="px-4 py-2.5">{r.temperature ? `${r.temperature}°C` : "—"}</td>
                <td className="px-4 py-2.5">{r.glucose_mmol ?? "—"}</td>
                <td className="px-4 py-2.5">{r.mood ?? "—"}</td>
                <td className="px-4 py-2.5 text-xs text-slate-500 max-w-32 truncate">
                  {r.symptoms.join(", ") || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function calcAdherence(logs: any[]): number {
  if (!logs.length) return 100;
  const taken = logs.filter((l) => l.status === "taken").length;
  return Math.round((taken / logs.length) * 100);
}
