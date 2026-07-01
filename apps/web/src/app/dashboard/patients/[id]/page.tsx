import type { Metadata } from "next";
import { PatientDetailClient } from "@/components/dashboard/PatientDetail";
import Link from "next/link";

export const metadata: Metadata = { title: "Patient" };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!UUID_RE.test(id)) {
    return (
      <div className="max-w-lg mx-auto py-20 text-center space-y-4">
        <div className="text-4xl">🔍</div>
        <h1 className="text-lg font-bold text-slate-800">Patient not found</h1>
        <p className="text-sm text-slate-500">
          The URL <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">{id}</code> is not a
          valid patient ID.
        </p>
        <Link
          href="/dashboard/patients"
          className="inline-block mt-2 px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors"
        >
          Back to patients
        </Link>
      </div>
    );
  }

  return <PatientDetailClient patientId={id} />;
}
