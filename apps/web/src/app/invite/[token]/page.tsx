import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { AcceptInviteClient } from "./AcceptInviteClient";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export const metadata: Metadata = { title: "Accept Invite — Vaulta" };
export const dynamic = "force-dynamic";

export default async function AcceptInvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!UUID_RE.test(token)) {
    return <InvalidToken reason="This invite link is not valid." />;
  }

  // Use admin client to read invite details — patient_invites is RLS-protected
  // (only caregivers can read their own rows via anon key).
  let admin: ReturnType<typeof createAdminClient>;
  try {
    admin = createAdminClient();
  } catch {
    return <InvalidToken reason="Server configuration error. Please contact support." />;
  }

  const { data: invite, error } = await admin
    .from("patient_invites")
    .select("id, token, first_name, last_name, primary_condition, status, expires_at, caregiver_id")
    .eq("token", token)
    .single();

  if (error || !invite) {
    return <InvalidToken reason="This invite link could not be found." />;
  }

  if (invite.status === "accepted") {
    return <InvalidToken reason="This invite has already been accepted. Please sign in to access your dashboard." showSignIn />;
  }

  if (invite.status === "revoked") {
    return <InvalidToken reason="This invite link has been revoked by your caregiver." />;
  }

  if (new Date(invite.expires_at) < new Date()) {
    return <InvalidToken reason="This invite link has expired. Please ask your caregiver to send a new one." />;
  }

  // Get signed-in user (if any) — use regular client for auth session
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <AcceptInviteClient
      token={token}
      inviteId={invite.id}
      firstName={invite.first_name}
      lastName={invite.last_name}
      condition={invite.primary_condition}
      isSignedIn={!!user}
      userEmail={user?.email ?? null}
    />
  );
}

function InvalidToken({ reason, showSignIn }: { reason: string; showSignIn?: boolean }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: "var(--bg)" }}
    >
      <div
        className="max-w-md w-full rounded-2xl border p-8 text-center space-y-4"
        style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
      >
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center mx-auto"
          style={{ backgroundColor: "rgba(239,68,68,0.1)", border: "2px solid rgba(239,68,68,0.3)" }}
        >
          <ShieldAlert className="w-7 h-7 text-red-400" />
        </div>
        <h1 className="text-lg font-bold" style={{ color: "var(--text)" }}>Invite Unavailable</h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>{reason}</p>
        {showSignIn && (
          <Link
            href="/auth/login"
            className="inline-block mt-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ backgroundColor: "var(--brand)" }}
          >
            Sign in to Vaulta
          </Link>
        )}
      </div>
    </div>
  );
}
