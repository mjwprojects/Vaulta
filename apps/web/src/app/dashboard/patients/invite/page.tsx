import type { Metadata } from "next";
import { UserPlus, Copy, Mail } from "lucide-react";
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

      <div
        className="rounded-2xl border p-8"
        style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-3 mb-7">
          <div
            className="p-3 rounded-xl border"
            style={{ backgroundColor: "rgba(142,77,255,0.15)", borderColor: "rgba(142,77,255,0.3)" }}
          >
            <UserPlus className="w-5 h-5" style={{ color: "var(--brand)" }} />
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: "var(--text)" }}>Invite a Patient</h1>
            <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
              Add a patient to your care dashboard
            </p>
          </div>
        </div>

        <form className="space-y-5">
          {/* Name row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="First name" required>
              <Input type="text" placeholder="e.g. Sarah" />
            </Field>
            <Field label="Last name" required>
              <Input type="text" placeholder="e.g. Dlamini" />
            </Field>
          </div>

          <Field label="Patient email address" required hint="The patient will receive an invite link at this address.">
            <Input type="email" placeholder="patient@example.com" />
          </Field>

          <Field label="Primary condition" hint="e.g. Type 2 Diabetes, Hypertension">
            <Input type="text" placeholder="e.g. Type 2 Diabetes" />
          </Field>

          <Field label="Date of birth" required>
            <Input type="date" />
          </Field>

          {/* Invite method */}
          <div className="pt-2" style={{ borderTop: "1px solid var(--border)" }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
              How would you like to add this patient?
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <MethodButton
                icon={<Mail className="w-5 h-5 shrink-0" style={{ color: "var(--brand)" }} />}
                title="Send invite email"
                desc="Patient receives a secure link"
                active
              />
              <MethodButton
                icon={<Copy className="w-5 h-5 shrink-0" style={{ color: "var(--text-muted)" }} />}
                title="Copy invite link"
                desc="Share the link manually"
              />
            </div>
          </div>

          {/* Info banner */}
          <div
            className="rounded-xl p-4 text-sm"
            style={{ backgroundColor: "rgba(142,77,255,0.1)", border: "1px solid rgba(142,77,255,0.3)", color: "var(--text-muted)" }}
          >
            <strong style={{ color: "var(--text)" }}>Note:</strong> Full patient invite flow with
            database integration is coming in the next update. This form will create the patient
            record and send a secure invite link.
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors"
              style={{ backgroundColor: "var(--brand)" }}
            >
              Create patient &amp; send invite
            </button>
            <Link
              href="/dashboard/patients"
              className="px-5 py-2.5 rounded-xl border text-sm font-medium transition-colors"
              style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text)" }}>
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {hint && (
        <p className="text-xs mt-1.5" style={{ color: "var(--text-muted)" }}>
          {hint}
        </p>
      )}
    </div>
  );
}

function Input({ type, placeholder }: { type: string; placeholder?: string }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all"
      style={{
        backgroundColor: "var(--surface-raised)",
        border: "1px solid var(--border)",
        color: "var(--text)",
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = "var(--brand)";
        e.currentTarget.style.boxShadow = "0 0 0 3px rgba(142,77,255,0.15)";
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.boxShadow = "none";
      }}
    />
  );
}

function MethodButton({
  icon,
  title,
  desc,
  active,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      className="flex items-center gap-3 p-4 rounded-xl text-left transition-all"
      style={{
        backgroundColor: active ? "rgba(142,77,255,0.12)" : "var(--surface-raised)",
        border: active ? "2px solid rgba(142,77,255,0.5)" : "2px solid var(--border)",
      }}
    >
      {icon}
      <div>
        <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>{title}</p>
        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{desc}</p>
      </div>
    </button>
  );
}
