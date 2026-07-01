import type { Metadata } from "next";
import { UserPlus, Copy, Mail } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = { title: "Invite Patient" };

export default function InvitePatientPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/patients"
          className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          ← Back to patients
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-brand-50 border border-brand-100">
            <UserPlus className="w-5 h-5 text-brand-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Invite a Patient</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Add a patient to your care dashboard
            </p>
          </div>
        </div>

        <InvitePatientForm />
      </div>
    </div>
  );
}

function InvitePatientForm() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            First name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Sarah"
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Last name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Dlamini"
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Patient email address <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          placeholder="patient@example.com"
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        />
        <p className="text-xs text-slate-400 mt-1.5">
          The patient will receive an invite link at this address.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Primary condition (optional)
        </label>
        <input
          type="text"
          placeholder="e.g. Type 2 Diabetes, Hypertension"
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Date of birth <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        />
      </div>

      <div className="pt-2 border-t border-slate-100">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          How would you like to add this patient?
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            className="flex items-center gap-3 p-4 rounded-xl border-2 border-brand-200 bg-brand-50 text-left hover:border-brand-400 transition-colors"
          >
            <Mail className="w-5 h-5 text-brand-600 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-brand-800">Send invite email</p>
              <p className="text-xs text-brand-600 mt-0.5">Patient receives a secure link</p>
            </div>
          </button>
          <button
            type="button"
            className="flex items-center gap-3 p-4 rounded-xl border-2 border-slate-200 bg-white text-left hover:border-slate-300 transition-colors"
          >
            <Copy className="w-5 h-5 text-slate-500 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-slate-700">Copy invite link</p>
              <p className="text-xs text-slate-500 mt-0.5">Share the link manually</p>
            </div>
          </button>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        <strong>Note:</strong> Full patient invite flow with database integration is coming in the
        next update. This form will create the patient record and send a secure invite link.
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="flex-1 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors"
        >
          Create patient &amp; send invite
        </button>
        <Link
          href="/dashboard/patients"
          className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
        >
          Cancel
        </Link>
      </div>
    </div>
  );
}
