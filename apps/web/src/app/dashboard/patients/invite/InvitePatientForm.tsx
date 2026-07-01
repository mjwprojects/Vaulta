"use client";
import { useActionState, useEffect, useRef, useState } from "react";
import { createPatientInviteAction, type InviteFormState } from "./actions";
import { UserPlus, Mail, Copy, CheckCircle2, AlertCircle, Loader2, ExternalLink } from "lucide-react";
import Link from "next/link";

const INIT: InviteFormState = { status: "idle" };

export function InvitePatientForm() {
  const [state, action, pending] = useActionState(createPatientInviteAction, INIT);
  const [copied, setCopied] = useState(false);
  const linkRef = useRef<HTMLInputElement>(null);

  function copyLink() {
    if (state.status !== "success") return;
    navigator.clipboard.writeText(state.inviteUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  // Success state — show invite link
  if (state.status === "success") {
    return (
      <div
        className="rounded-2xl border p-8 space-y-6"
        style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
      >
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "rgba(34,197,94,0.15)", border: "2px solid rgba(34,197,94,0.4)" }}>
            <CheckCircle2 className="w-7 h-7 text-green-400" />
          </div>
          <h2 className="text-xl font-bold" style={{ color: "var(--text)" }}>
            Patient created!
          </h2>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            <strong style={{ color: "var(--text)" }}>{state.patientName}</strong> has been added to your
            dashboard. Share the invite link below so they can set up their own account.
          </p>
        </div>

        {/* Invite link box */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>
            Patient invite link
          </p>
          <div className="flex items-center gap-2">
            <input
              ref={linkRef}
              readOnly
              value={state.inviteUrl}
              className="flex-1 px-3 py-2.5 rounded-xl text-sm outline-none truncate"
              style={{
                backgroundColor: "var(--surface-raised)",
                border: "1px solid var(--border)",
                color: "var(--text)",
              }}
              onClick={() => linkRef.current?.select()}
            />
            <button
              onClick={copyLink}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shrink-0"
              style={{
                backgroundColor: copied ? "rgba(34,197,94,0.2)" : "rgba(142,77,255,0.2)",
                border: `1px solid ${copied ? "rgba(34,197,94,0.4)" : "rgba(142,77,255,0.4)"}`,
                color: copied ? "#4ade80" : "var(--brand)",
              }}
            >
              {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
            This link expires in 7 days. The patient will be asked to create a Vaulta account when they open it.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2" style={{ borderTop: "1px solid var(--border)" }}>
          <Link
            href="/dashboard/patients"
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-center transition-colors"
            style={{ backgroundColor: "var(--brand)", color: "#fff" }}
          >
            View all patients
          </Link>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 rounded-xl border text-sm font-medium transition-colors"
            style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
          >
            Add another
          </button>
        </div>
      </div>
    );
  }

  // Form state
  return (
    <div
      className="rounded-2xl border p-8"
      style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
    >
      {/* Header */}
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

      {/* Error banner */}
      {state.status === "error" && (
        <div
          className="flex items-start gap-3 p-4 rounded-xl mb-5 text-sm"
          style={{ backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5" }}
        >
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          {state.message}
        </div>
      )}

      <form action={action} className="space-y-5">
        {/* Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="First name" required>
            <Input name="first_name" type="text" placeholder="e.g. Sarah" />
          </Field>
          <Field label="Last name" required>
            <Input name="last_name" type="text" placeholder="e.g. Dlamini" />
          </Field>
        </div>

        <Field label="Patient email address" required hint="The patient will receive an invite link at this address.">
          <Input name="email" type="email" placeholder="patient@example.com" />
        </Field>

        <Field label="Primary condition" hint="e.g. Type 2 Diabetes, Hypertension">
          <Input name="primary_condition" type="text" placeholder="e.g. Type 2 Diabetes" />
        </Field>

        <Field label="Date of birth" required>
          <Input name="date_of_birth" type="date" />
        </Field>

        {/* Invite method selector (visual only — email flow coming) */}
        <div className="pt-2" style={{ borderTop: "1px solid var(--border)" }}>
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
            How would you like to add this patient?
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <MethodCard
              icon={<ExternalLink className="w-5 h-5 shrink-0" style={{ color: "var(--brand)" }} />}
              title="Generate invite link"
              desc="Copy and share a secure link"
              active
            />
            <MethodCard
              icon={<Mail className="w-5 h-5 shrink-0" style={{ color: "var(--text-muted)" }} />}
              title="Send email invite"
              desc="Email integration coming soon"
              disabled
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={pending}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-60"
            style={{ backgroundColor: "var(--brand)" }}
          >
            {pending && <Loader2 className="w-4 h-4 animate-spin" />}
            {pending ? "Creating patient…" : "Create patient & generate link"}
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
  );
}

// ── Helpers ───────────────────────────────────────────────────

function Field({ label, required, hint, children }: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text)" }}>
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs mt-1.5" style={{ color: "var(--text-muted)" }}>{hint}</p>}
    </div>
  );
}

function Input({ name, type, placeholder }: { name: string; type: string; placeholder?: string }) {
  return (
    <input
      name={name}
      type={type}
      placeholder={placeholder}
      required={false}
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

function MethodCard({ icon, title, desc, active, disabled }: {
  icon: React.ReactNode; title: string; desc: string; active?: boolean; disabled?: boolean;
}) {
  return (
    <div
      className="flex items-center gap-3 p-4 rounded-xl"
      style={{
        backgroundColor: active ? "rgba(142,77,255,0.12)" : "var(--surface-raised)",
        border: active ? "2px solid rgba(142,77,255,0.5)" : "2px solid var(--border)",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {icon}
      <div>
        <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>{title}</p>
        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{desc}</p>
      </div>
    </div>
  );
}
