"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Loader2, ShieldCheck, User, Bell, KeyRound, Save } from "lucide-react";
import type { Profile } from "@vaulta/types";

export function SettingsClient({ profile }: { profile: Profile | null }) {
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError(null); setSaved(false);
    const supabase = createClient();
    const { error: err } = await supabase
      .from("profiles")
      .update({ full_name: fullName })
      .eq("id", profile?.id ?? "");
    setSaving(false);
    if (err) { setError(err.message); return; }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const TABS = [
    { icon: User,       label: "Profile" },
    { icon: Bell,       label: "Notifications" },
    { icon: ShieldCheck,label: "Security" },
    { icon: KeyRound,   label: "API Access" },
  ];
  const [tab, setTab] = useState("Profile");

  return (
    <div className="max-w-3xl mx-auto">
      {/* Tab bar */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-6 w-fit">
        {TABS.map(({ icon: Icon, label }) => (
          <button
            key={label}
            onClick={() => setTab(label)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              tab === label ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {tab === "Profile" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-5">Profile information</h2>
          <form onSubmit={saveProfile} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Full name</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <input
                value={profile?.email ?? ""}
                disabled
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm bg-slate-50 text-slate-400 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Role</label>
              <input
                value={profile?.role ?? ""}
                disabled
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm bg-slate-50 text-slate-400 cursor-not-allowed capitalize"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={saving}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors",
                saved ? "bg-green-600 text-white" : "bg-brand-600 text-white hover:bg-brand-700",
                "disabled:opacity-60"
              )}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saved ? "Saved!" : "Save changes"}
            </button>
          </form>
        </div>
      )}

      {tab === "Security" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
          <h2 className="font-semibold text-slate-900">Security settings</h2>
          <div className="flex items-center justify-between py-4 border-b border-slate-100">
            <div>
              <p className="font-medium text-slate-900 text-sm">Multi-factor authentication</p>
              <p className="text-xs text-slate-400 mt-0.5">Protect your account with a second factor</p>
            </div>
            <div className={cn(
              "px-3 py-1 rounded-full text-xs font-semibold border",
              profile?.mfa_enabled
                ? "text-green-700 bg-green-50 border-green-200"
                : "text-amber-700 bg-amber-50 border-amber-200"
            )}>
              {profile?.mfa_enabled ? "Enabled" : "Not enabled"}
            </div>
          </div>
          <div className="flex items-center justify-between py-4 border-b border-slate-100">
            <div>
              <p className="font-medium text-slate-900 text-sm">Change password</p>
              <p className="text-xs text-slate-400 mt-0.5">Last changed: unknown</p>
            </div>
            <button className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50 transition-colors">
              Change
            </button>
          </div>
          <div className="flex items-center justify-between py-4">
            <div>
              <p className="font-medium text-slate-900 text-sm">Active sessions</p>
              <p className="text-xs text-slate-400 mt-0.5">Manage devices where you are signed in</p>
            </div>
            <button className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 text-xs font-medium hover:bg-red-50 transition-colors">
              Sign out all
            </button>
          </div>
        </div>
      )}

      {tab === "Notifications" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <h2 className="font-semibold text-slate-900">Notification preferences</h2>
          {[
            { label: "Emergency SOS alerts", desc: "Immediate push + email for patient emergencies", default: true },
            { label: "Critical vital signs", desc: "Alerts when vitals exceed thresholds", default: true },
            { label: "Missed medication", desc: "Notify when patient misses a dose", default: true },
            { label: "Daily summary", desc: "Morning overview of all patient statuses", default: false },
            { label: "Check-in reminders", desc: "Alert if patient hasn't checked in", default: true },
          ].map(({ label, desc, default: on }) => (
            <div key={label} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
              <div>
                <p className="font-medium text-slate-900 text-sm">{label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
              </div>
              <button className={cn(
                "w-10 h-6 rounded-full transition-colors relative",
                on ? "bg-brand-600" : "bg-slate-200"
              )}>
                <span className={cn(
                  "absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform",
                  on ? "translate-x-4" : "translate-x-0.5"
                )} />
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === "API Access" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-2">API Access</h2>
          <p className="text-sm text-slate-500 mb-5">
            Use these credentials to integrate Vaulta with external systems.
          </p>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Project URL</label>
              <code className="block w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs text-slate-700 font-mono break-all">
                {process.env.NEXT_PUBLIC_SUPABASE_URL}
              </code>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Anon key (public)</label>
              <code className="block w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs text-slate-400 font-mono break-all">
                ••••••••••••••••••••••••••••••••••••
              </code>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
