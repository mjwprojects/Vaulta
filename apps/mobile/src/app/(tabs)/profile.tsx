import { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { router } from "expo-router";
import { supabase } from "@/lib/supabase";

type Profile = { full_name: string; email: string; role: string; mfa_enabled: boolean };
type Consent = { id: string; caregiver: { full_name: string; email: string }; access_level: string; granted_at: string };

export default function ProfileScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [patient, setPatient] = useState<any>(null);
  const [consents, setConsents] = useState<Consent[]>([]);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const [profileRes, patientRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("patients").select("*").eq("profile_id", user.id).single(),
      ]);
      setProfile(profileRes.data);
      setPatient(patientRes.data);

      if (patientRes.data) {
        const { data } = await supabase
          .from("caregiver_consents")
          .select("id, access_level, granted_at, caregiver:profiles!caregiver_id(full_name, email)")
          .eq("patient_id", patientRes.data.id)
          .eq("status", "active");
        setConsents((data ?? []) as any);
      }
    }
    load();
  }, []);

  async function revokeConsent(consentId: string) {
    Alert.alert("Revoke access?", "This caregiver will immediately lose access to your health data.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Revoke",
        style: "destructive",
        onPress: async () => {
          await supabase.from("caregiver_consents")
            .update({ status: "revoked", revoked_at: new Date().toISOString() })
            .eq("id", consentId);
          setConsents((prev) => prev.filter((c) => c.id !== consentId));
        },
      },
    ]);
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.replace("/(auth)/login");
  }

  const initials = profile?.full_name?.split(" ").map((n) => n[0]).join("").slice(0, 2) ?? "?";

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      {/* Avatar */}
      <View style={s.avatarRow}>
        <View style={s.avatar}>
          <Text style={s.initials}>{initials}</Text>
        </View>
        <View>
          <Text style={s.name}>{profile?.full_name ?? "—"}</Text>
          <Text style={s.email}>{profile?.email ?? "—"}</Text>
          <View style={s.roleBadge}>
            <Text style={s.roleText}>{profile?.role ?? "patient"}</Text>
          </View>
        </View>
      </View>

      {/* Patient info */}
      {patient && (
        <Section title="Health profile">
          <InfoRow label="Date of birth"   value={patient.date_of_birth ? new Date(patient.date_of_birth).toLocaleDateString("en-ZA") : "—"} />
          <InfoRow label="Blood type"      value={patient.blood_type ?? "Not set"} />
          <InfoRow label="Condition"       value={patient.primary_condition ?? "Not set"} />
          <InfoRow label="Allergies"       value={patient.allergies?.join(", ") || "None"} />
          <InfoRow label="Emergency contact" value={patient.emergency_contact_name ?? "Not set"} />
        </Section>
      )}

      {/* Caregiver consents */}
      <Section title={`Caregiver access (${consents.length})`}>
        {consents.length === 0 ? (
          <Text style={s.emptyText}>No caregivers have access to your data.</Text>
        ) : (
          consents.map((c) => (
            <View key={c.id} style={s.consentCard}>
              <View style={s.consentAvatar}>
                <Text style={s.consentInitials}>
                  {(c.caregiver as any).full_name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2) ?? "?"}
                </Text>
              </View>
              <View style={s.consentInfo}>
                <Text style={s.consentName}>{(c.caregiver as any).full_name}</Text>
                <Text style={s.consentEmail}>{(c.caregiver as any).email}</Text>
                <Text style={s.consentLevel}>{c.access_level.replace("_", " ")}</Text>
              </View>
              <TouchableOpacity style={s.revokeBtn} onPress={() => revokeConsent(c.id)}>
                <Text style={s.revokeText}>Revoke</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </Section>

      {/* Security */}
      <Section title="Security">
        <InfoRow label="MFA" value={profile?.mfa_enabled ? "Enabled ✅" : "Not enabled ⚠️"} />
      </Section>

      {/* Sign out */}
      <TouchableOpacity style={s.signOutBtn} onPress={signOut} activeOpacity={0.85}>
        <Text style={s.signOutText}>Sign out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>{title}</Text>
      <View style={s.sectionCard}>{children}</View>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.infoRow}>
      <Text style={s.infoLabel}>{label}</Text>
      <Text style={s.infoValue}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container:      { flex: 1, backgroundColor: "#f8fafc" },
  content:        { padding: 20, paddingTop: 60, paddingBottom: 40 },
  avatarRow:      { flexDirection: "row", alignItems: "center", gap: 16, marginBottom: 28 },
  avatar:         { width: 64, height: 64, borderRadius: 32, backgroundColor: "#1469f5", alignItems: "center", justifyContent: "center" },
  initials:       { color: "#fff", fontSize: 24, fontWeight: "800" },
  name:           { fontSize: 20, fontWeight: "800", color: "#0f172a" },
  email:          { color: "#64748b", fontSize: 13, marginTop: 2 },
  roleBadge:      { backgroundColor: "#eff6ff", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, alignSelf: "flex-start", marginTop: 6 },
  roleText:       { color: "#1469f5", fontSize: 11, fontWeight: "700", textTransform: "capitalize" },
  section:        { marginBottom: 24 },
  sectionTitle:   { fontSize: 13, fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10 },
  sectionCard:    { backgroundColor: "#fff", borderRadius: 16, borderWidth: 1, borderColor: "#e2e8f0", overflow: "hidden" },
  infoRow:        { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  infoLabel:      { color: "#64748b", fontSize: 14 },
  infoValue:      { color: "#0f172a", fontSize: 14, fontWeight: "600", maxWidth: "55%", textAlign: "right" },
  emptyText:      { color: "#94a3b8", fontSize: 14, padding: 16, textAlign: "center" },
  consentCard:    { flexDirection: "row", alignItems: "center", padding: 14, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  consentAvatar:  { width: 36, height: 36, borderRadius: 18, backgroundColor: "#e0e7ff", alignItems: "center", justifyContent: "center", marginRight: 12 },
  consentInitials:{ fontSize: 13, fontWeight: "700", color: "#4f46e5" },
  consentInfo:    { flex: 1 },
  consentName:    { fontWeight: "700", color: "#0f172a", fontSize: 14 },
  consentEmail:   { color: "#64748b", fontSize: 12 },
  consentLevel:   { color: "#94a3b8", fontSize: 11, textTransform: "capitalize", marginTop: 2 },
  revokeBtn:      { backgroundColor: "#fef2f2", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: "#fecaca" },
  revokeText:     { color: "#ef4444", fontSize: 12, fontWeight: "700" },
  signOutBtn:     { backgroundColor: "#f1f5f9", borderRadius: 14, padding: 16, alignItems: "center", marginTop: 8 },
  signOutText:    { color: "#ef4444", fontWeight: "700", fontSize: 15 },
});
