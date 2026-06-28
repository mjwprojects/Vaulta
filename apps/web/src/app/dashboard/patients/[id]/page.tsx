import type { Metadata } from "next";
import { PatientDetailClient } from "@/components/dashboard/PatientDetail";

export const metadata: Metadata = { title: "Patient" };

export default async function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PatientDetailClient patientId={id} />;
}
