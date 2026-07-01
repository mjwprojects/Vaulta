"use server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type InviteFormState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success"; token: string; patientName: string; inviteUrl: string };

export async function createPatientInviteAction(
  _prev: InviteFormState,
  formData: FormData
): Promise<InviteFormState> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const firstName     = (formData.get("first_name") as string | null)?.trim() ?? "";
  const lastName      = (formData.get("last_name") as string | null)?.trim() ?? "";
  const email         = (formData.get("email") as string | null)?.trim().toLowerCase() ?? "";
  const dob           = (formData.get("date_of_birth") as string | null)?.trim() ?? "";
  const condition     = (formData.get("primary_condition") as string | null)?.trim() ?? "";

  if (!firstName) return { status: "error", message: "First name is required." };
  if (!lastName)  return { status: "error", message: "Last name is required." };
  if (!email || !email.includes("@")) return { status: "error", message: "A valid email address is required." };
  if (!dob)       return { status: "error", message: "Date of birth is required." };

  // Create the patient record (no profile_id yet — linked when patient accepts invite)
  const { data: patient, error: patientErr } = await (supabase as any)
    .from("patients")
    .insert({
      caregiver_id:      user.id,
      first_name:        firstName,
      last_name:         lastName,
      date_of_birth:     dob,
      primary_condition: condition || null,
      allergies:         [],
      status:            "active",
    })
    .select("id")
    .single();

  if (patientErr) {
    console.error("patient insert error:", patientErr);
    return { status: "error", message: "Could not create patient record. Please try again." };
  }

  // Create caregiver consent immediately (caregiver owns this patient)
  await (supabase as any).from("caregiver_consents").insert({
    patient_id:   patient.id,
    caregiver_id: user.id,
    access_level: "full",
    status:       "active",
  });

  // Create the invite record with a secure random token
  const { data: invite, error: inviteErr } = await (supabase as any)
    .from("patient_invites")
    .insert({
      caregiver_id:      user.id,
      patient_id:        patient.id,
      first_name:        firstName,
      last_name:         lastName,
      email,
      date_of_birth:     dob,
      primary_condition: condition || null,
      status:            "pending",
    })
    .select("token")
    .single();

  if (inviteErr) {
    console.error("invite insert error:", inviteErr);
    return { status: "error", message: "Could not create invite link. Please try again." };
  }

  // Audit log
  await (supabase as any).from("audit_logs").insert({
    user_id:       user.id,
    action:        "patient.invite_created",
    resource_type: "patient_invites",
    resource_id:   patient.id,
    metadata:      { patient_id: patient.id, invite_token: invite.token, patient_email: email },
  });

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://vaulta.co.za";
  const inviteUrl = `${baseUrl}/invite/${invite.token}`;

  return {
    status:      "success",
    token:       invite.token,
    patientName: `${firstName} ${lastName}`,
    inviteUrl,
  };
}
