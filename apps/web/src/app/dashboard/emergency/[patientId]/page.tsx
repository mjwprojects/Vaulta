import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { ShieldAlert, Phone, Pill, AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = { title: "Emergency Summary" };

export default async function EmergencyPage({ params }: { params: { patientId: string } }) {
  const supabase = await createClient();

  const { data: patient } = await supabase
    .from("patients")
    .select(`
      *,
      profile:profiles(full_name),
      medications(name, dosage, frequency, is_active),
      emergency_summary:emergency_summaries(*)
    `)
    .eq("id", params.patientId)
    .single();

  // Log audit event (fire and forget)
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    supabase.from("audit_logs").insert({
      user_id: user.id,
      action: "emergency_summary_viewed",
      resource_type: "patient",
      resource_id: params.patientId,
      metadata: {},
    });
  }

  if (!patient) return (
    <div className="text-center py-16 text-slate-500">Patient not found or access not permitted.</div>
  );

  const es = patient.emergency_summary as any;
  const activeMeds = (patient.medications as any[]).filter((m) => m.is_active);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href={`/dashboard/patients/${params.patientId}`}
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
          <ArrowLeft className="w-4 h-4 text-slate-600" />
        </Link>
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-red-600" />
          <h1 className="text-xl font-bold text-slate-900">Emergency Medical Summary</h1>
        </div>
      </div>

      {/* Critical banner */}
      <div className="bg-red-600 text-white rounded-2xl p-5">
        <p className="text-xs font-semibold uppercase tracking-wider opacity-75 mb-1">Patient</p>
        <p className="text-2xl font-bold">{(patient.profile as any).full_name}</p>
        <div className="flex flex-wrap gap-4 mt-3 text-sm">
          <span>DOB: {formatDate(patient.date_of_birth)}</span>
          {patient.blood_type && (
            <span className="font-bold bg-white text-red-700 px-2 py-0.5 rounded-lg">
              Blood type: {patient.blood_type}
            </span>
          )}
          {es?.dnr && (
            <span className="font-bold bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-lg">
              DNR ON FILE
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Allergies */}
        <div className="bg-white rounded-2xl border-2 border-red-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <h2 className="font-bold text-red-800">Allergies</h2>
          </div>
          {patient.allergies.length === 0 ? (
            <p className="text-slate-400 text-sm">No known allergies</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {patient.allergies.map((a: string) => (
                <span key={a} className="px-3 py-1 bg-red-50 text-red-700 border border-red-200 rounded-full text-sm font-semibold">
                  {a}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Emergency contact */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Phone className="w-4 h-4 text-brand-600" />
            <h2 className="font-bold text-slate-800">Emergency Contact</h2>
          </div>
          {patient.emergency_contact_name ? (
            <>
              <p className="font-semibold text-slate-900">{patient.emergency_contact_name}</p>
              {patient.emergency_contact_phone && (
                <a href={`tel:${patient.emergency_contact_phone}`}
                  className="text-brand-600 text-lg font-bold hover:underline block mt-1">
                  {patient.emergency_contact_phone}
                </a>
              )}
            </>
          ) : (
            <p className="text-slate-400 text-sm">No emergency contact on file</p>
          )}
        </div>
      </div>

      {/* Active medications */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Pill className="w-4 h-4 text-brand-600" />
          <h2 className="font-bold text-slate-800">Current Medications</h2>
        </div>
        {activeMeds.length === 0 ? (
          <p className="text-slate-400 text-sm">No active medications</p>
        ) : (
          <div className="space-y-2">
            {activeMeds.map((m: any, i: number) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                <div>
                  <p className="font-semibold text-slate-900">{m.name}</p>
                  <p className="text-sm text-slate-500">{m.dosage}</p>
                </div>
                <span className="text-sm text-slate-400">{m.frequency}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Critical conditions */}
      {es?.critical_conditions?.length > 0 && (
        <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5">
          <h2 className="font-bold text-amber-800 mb-3">Critical Conditions</h2>
          <ul className="list-disc list-inside space-y-1 text-sm text-amber-800">
            {es.critical_conditions.map((c: string) => <li key={c}>{c}</li>)}
          </ul>
        </div>
      )}

      {/* Notes */}
      {es?.notes && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="font-bold text-slate-800 mb-2">Clinical Notes</h2>
          <p className="text-slate-600 text-sm leading-relaxed">{es.notes}</p>
        </div>
      )}

      <p className="text-center text-xs text-slate-400 pb-4">
        This summary is auto-generated · Last updated: {formatDate(new Date().toISOString())}
      </p>
    </div>
  );
}
