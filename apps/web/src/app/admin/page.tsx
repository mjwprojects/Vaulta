import { createClient } from "@/lib/supabase/server";
import { formatDate, formatTime } from "@/lib/utils";
import { Users, HeartPulse, Mail, FileCheck } from "lucide-react";

export const dynamic = "force-dynamic";

// Read-only platform oversight. All queries run under the signed-in admin's
// session and rely on the "Admins view all ..." RLS policies from migration 003.
export default async function AdminPage() {
  const supabase = await createClient();

  const [profilesRes, patientsRes, invitesRes, consentsRes] = await Promise.all([
    supabase.from("profiles").select("id, email, full_name, role, created_at").order("created_at", { ascending: false }),
    supabase.from("patients").select("id, status, profile_id, caregiver_id"),
    supabase.from("patient_invites").select("id, first_name, last_name, email, status, expires_at, created_at, caregiver_id").order("created_at", { ascending: false }).limit(50),
    supabase.from("caregiver_consents").select("id, status"),
  ]);

  const profiles = profilesRes.data ?? [];
  const patients = patientsRes.data ?? [];
  const invites = invitesRes.data ?? [];
  const consents = consentsRes.data ?? [];

  const caregiverName: Record<string, string> = {};
  for (const p of profiles) caregiverName[p.id] = p.full_name || p.email;

  const stats = [
    { label: "Registered users", value: profiles.length, icon: Users, note: `${profiles.filter((p) => p.role === "caregiver").length} caregivers · ${profiles.filter((p) => p.role === "patient").length} patients · ${profiles.filter((p) => p.role === "admin").length} admins` },
    { label: "Patient records", value: patients.length, icon: HeartPulse, note: `${patients.filter((p) => p.profile_id).length} linked to accounts` },
    { label: "Invitations", value: invites.length, icon: Mail, note: `${invites.filter((i) => i.status === "pending").length} pending · ${invites.filter((i) => i.status === "accepted").length} accepted` },
    { label: "Active consents", value: consents.filter((c) => c.status === "active").length, icon: FileCheck, note: `${consents.filter((c) => c.status === "revoked").length} revoked` },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, note }) => (
          <div
            key={label}
            className="rounded-2xl p-5"
            style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Icon className="w-4 h-4" style={{ color: "var(--brand)" }} />
              <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{label}</p>
            </div>
            <p className="text-2xl font-bold" style={{ color: "var(--text)" }}>{value}</p>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{note}</p>
          </div>
        ))}
      </div>

      {/* Users */}
      <section
        className="rounded-2xl overflow-hidden"
        style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <h2 className="px-5 pt-4 pb-3 font-semibold text-sm" style={{ color: "var(--text)", borderBottom: "1px solid var(--border)" }}>
          Users
        </h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
              <th className="px-5 py-2.5 text-left font-semibold">Name</th>
              <th className="px-5 py-2.5 text-left font-semibold">Email</th>
              <th className="px-5 py-2.5 text-left font-semibold">Role</th>
              <th className="px-5 py-2.5 text-left font-semibold">Joined</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((p) => (
              <tr key={p.id} style={{ borderTop: "1px solid var(--border)" }}>
                <td className="px-5 py-3 font-medium" style={{ color: "var(--text)" }}>{p.full_name || "—"}</td>
                <td className="px-5 py-3" style={{ color: "var(--text-muted)" }}>{p.email}</td>
                <td className="px-5 py-3">
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-semibold capitalize"
                    style={p.role === "admin"
                      ? { backgroundColor: "rgba(142,77,255,0.15)", color: "var(--brand)", border: "1px solid rgba(142,77,255,0.3)" }
                      : { backgroundColor: "var(--surface-raised)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
                  >
                    {p.role}
                  </span>
                </td>
                <td className="px-5 py-3 whitespace-nowrap" style={{ color: "var(--text-muted)" }}>{formatDate(p.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Invitations */}
      <section
        className="rounded-2xl overflow-hidden"
        style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <h2 className="px-5 pt-4 pb-3 font-semibold text-sm" style={{ color: "var(--text)", borderBottom: "1px solid var(--border)" }}>
          Recent invitations
        </h2>
        {invites.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm" style={{ color: "var(--text-muted)" }}>No invitations yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                <th className="px-5 py-2.5 text-left font-semibold">Invitee</th>
                <th className="px-5 py-2.5 text-left font-semibold">Email</th>
                <th className="px-5 py-2.5 text-left font-semibold">Caregiver</th>
                <th className="px-5 py-2.5 text-left font-semibold">Status</th>
                <th className="px-5 py-2.5 text-left font-semibold">Sent</th>
                <th className="px-5 py-2.5 text-left font-semibold">Expires</th>
              </tr>
            </thead>
            <tbody>
              {invites.map((i) => (
                <tr key={i.id} style={{ borderTop: "1px solid var(--border)" }}>
                  <td className="px-5 py-3 font-medium" style={{ color: "var(--text)" }}>{i.first_name} {i.last_name}</td>
                  <td className="px-5 py-3" style={{ color: "var(--text-muted)" }}>{i.email}</td>
                  <td className="px-5 py-3" style={{ color: "var(--text-muted)" }}>{caregiverName[i.caregiver_id] ?? "—"}</td>
                  <td className="px-5 py-3">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-semibold capitalize"
                      style={{
                        backgroundColor: i.status === "accepted" ? "rgba(34,197,94,0.12)" : i.status === "pending" ? "rgba(245,158,11,0.12)" : "rgba(239,68,68,0.12)",
                        color: i.status === "accepted" ? "#4ade80" : i.status === "pending" ? "#fbbf24" : "#f87171",
                      }}
                    >
                      {i.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap" style={{ color: "var(--text-muted)" }}>
                    {formatDate(i.created_at)} {formatTime(i.created_at)}
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap" style={{ color: "var(--text-muted)" }}>{formatDate(i.expires_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
        Read-only oversight view. All access is RLS-enforced and admin actions are audit-logged.
      </p>
    </div>
  );
}
