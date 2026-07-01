"use server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type AcceptState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success" };

export async function acceptInviteAction(
  _prev: AcceptState,
  formData: FormData
): Promise<AcceptState> {
  const token    = formData.get("token") as string;
  const inviteId = formData.get("invite_id") as string;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // Store the token in a cookie-safe way — redirect to login with return URL
    redirect(`/auth/login?next=/invite/${token}`);
  }

  // Use admin client to bypass RLS for the linking operation
  const admin = createAdminClient();

  // Fetch the invite (re-validate)
  const { data: invite, error: inviteErr } = await admin
    .from("patient_invites")
    .select("*")
    .eq("token", token)
    .eq("id", inviteId)
    .single();

  if (inviteErr || !invite) {
    return { status: "error", message: "Invite not found or already used." };
  }
  if (invite.status !== "pending") {
    return { status: "error", message: "This invite is no longer valid." };
  }
  if (new Date(invite.expires_at) < new Date()) {
    return { status: "error", message: "This invite has expired." };
  }

  // Check this user isn't already linked to this patient
  const { data: existingConsent } = await admin
    .from("caregiver_consents")
    .select("id")
    .eq("patient_id", invite.patient_id)
    .eq("caregiver_id", user.id)
    .single();

  if (!existingConsent) {
    // Ensure the user's profile exists
    const { data: profile } = await admin
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single();

    if (!profile) {
      await admin.from("profiles").insert({
        id:        user.id,
        email:     user.email!,
        full_name: user.user_metadata?.full_name ?? invite.first_name + " " + invite.last_name,
        role:      "patient",
      });
    }
  }

  // Link the patient record to this user's profile
  await admin
    .from("patients")
    .update({ profile_id: user.id })
    .eq("id", invite.patient_id)
    .is("profile_id", null); // Only update if not already linked

  // Mark invite accepted
  await admin
    .from("patient_invites")
    .update({ status: "accepted", accepted_at: new Date().toISOString() })
    .eq("id", invite.id);

  // Audit log
  await admin.from("audit_logs").insert({
    user_id:       user.id,
    action:        "patient.invite_accepted",
    resource_type: "patient_invites",
    resource_id:   invite.patient_id,
    metadata:      { invite_id: invite.id, caregiver_id: invite.caregiver_id },
  });

  return { status: "success" };
}
