import type { Metadata } from "next";
import { InvitePatientForm } from "./InvitePatientForm";
import Link from "next/link";

export const metadata: Metadata = { title: "Invite Patient" };

export default function InvitePatientPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        href="/dashboard/patients"
        className="inline-flex text-sm font-medium transition-colors"
        style={{ color: "var(--text-muted)" }}
      >
        ← Back to patients
      </Link>
      <InvitePatientForm />
    </div>
  );
}
