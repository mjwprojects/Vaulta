import { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { supabase } from "@/lib/supabase";

type Summary = { checkInToday: boolean; medsDue: number; medsTotal: number; activeAlerts: number };

export default function HomeScreen() {
  const [name, setName] = useState("");
  const [summary, setSummary] = useState<Summary>({ checkInToday: false, medsDue: 0, medsTotal: 0, activeAlerts: 0 });

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();
      setName(profile?.full_name?.split(" ")[0] ?? "");

      const today = new Date().toISOString().split("T")[0];
      const { data: records } = await supabase.from("health_records")
        .select("id").gte("recorded_at", today).limit(1);

      const { data: patient } = await supabase.from("patients").select("id").eq("profile_id", user.id).single();
      if (!patient) return;

      const [medsRes, alertsRes] = await Promise.all([
        supabase.from("medication_logs").select("status").eq("patient_id", patient.id)
          .gte("scheduled_at", today),
        supabase.from("alerts").select("id", { count: "exact", head: true })
          .eq("patient_id", patient.id).eq("status", "active"),
      ]);

      const logs = medsRes.data ?? [];
      setSummary({
        checkInToday: (records?.length ?? 0) > 0,
        medsDue: logs.filter((l) => l.status === "pending").length,
        medsTotal: logs.length,
        activeAlerts: alertsRes.count ?? 0,
      });
    }
    load();
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <View style={s.header}>
        <Text style={s.greeting}>{greeting()}, {name || "there"} 👋</Text>
        <Text style={s.date}>{new Date().toLocaleDateString("en-ZA", { weekday: "long", day: "numeric", month: "long" })}</Text>
      </View>

      {/* Status cards */}
      <View style={s.cards}>
        <StatusCard
          icon={summary.checkInToday ? "✅" : "📋"}
          label="Daily check-in"
          value={summary.checkInToday ? "Done" : "Not done"}
          color={summary.checkInToday ? "#22c55e" : "#f59e0b"}
          onPress={() => router.push("/(tabs)/checkin")}
        />
        <StatusCard
          icon="💊"
          label="Medications"
          value={`${summary.medsTotal - summary.medsDue}/${summary.medsTotal} taken`}
          color={summary.medsDue === 0 ? "#22c55e" : "#f59e0b"}
          onPress={() => router.push("/(tabs)/medications")}
        />
      </View>

      {summary.activeAlerts > 0 && (
        <View style={s.alertBanner}>
          <Text style={s.alertText}>⚠️ You have {summary.activeAlerts} active alert{summary.activeAlerts > 1 ? "s" : ""}</Text>
        </View>
      )}

      {/* Quick actions */}
      <Text style={s.sectionTitle}>Quick actions</Text>
      <View style={s.actions}>
        <ActionBtn icon="📋" label="Check-in" onPress={() => router.push("/(tabs)/checkin")} />
        <ActionBtn icon="💊" label="Log meds" onPress={() => router.push("/(tabs)/medications")} />
        <ActionBtn icon="🆘" label="SOS" onPress={() => router.push("/(tabs)/sos")} danger />
        <ActionBtn icon="👤" label="Profile" onPress={() => router.push("/(tabs)/profile")} />
      </View>

      {/* Health tip */}
      <View style={s.tip}>
        <Text style={s.tipTitle}>💡 Health tip</Text>
        <Text style={s.tipText}>
          Consistent daily check-ins help your caregivers spot changes early.
          Take 2 minutes to log your vitals and how you are feeling today.
        </Text>
      </View>
    </ScrollView>
  );
}

function StatusCard({ icon, label, value, color, onPress }: any) {
  return (
    <TouchableOpacity style={[s.card, { borderLeftColor: color, borderLeftWidth: 3 }]} onPress={onPress} activeOpacity={0.8}>
      <Text style={s.cardIcon}>{icon}</Text>
      <Text style={s.cardLabel}>{label}</Text>
      <Text style={[s.cardValue, { color }]}>{value}</Text>
    </TouchableOpacity>
  );
}

function ActionBtn({ icon, label, onPress, danger }: any) {
  return (
    <TouchableOpacity
      style={[s.actionBtn, danger && s.dangerBtn]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={s.actionIcon}>{icon}</Text>
      <Text style={[s.actionLabel, danger && s.dangerLabel]}>{label}</Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  container:    { flex: 1, backgroundColor: "#f8fafc" },
  content:      { padding: 20, paddingTop: 60 },
  header:       { marginBottom: 24 },
  greeting:     { fontSize: 26, fontWeight: "800", color: "#0f172a" },
  date:         { color: "#94a3b8", fontSize: 14, marginTop: 4 },
  cards:        { flexDirection: "row", gap: 12, marginBottom: 16 },
  card:         { flex: 1, backgroundColor: "#fff", borderRadius: 16, padding: 16, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  cardIcon:     { fontSize: 24, marginBottom: 6 },
  cardLabel:    { fontSize: 11, color: "#94a3b8", fontWeight: "600", textTransform: "uppercase" },
  cardValue:    { fontSize: 16, fontWeight: "700", marginTop: 2 },
  alertBanner:  { backgroundColor: "#fef3c7", borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: "#fde68a" },
  alertText:    { color: "#92400e", fontWeight: "600", fontSize: 14 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#0f172a", marginBottom: 12 },
  actions:      { flexDirection: "row", gap: 10, marginBottom: 24 },
  actionBtn:    { flex: 1, backgroundColor: "#fff", borderRadius: 14, padding: 14, alignItems: "center", borderWidth: 1, borderColor: "#e2e8f0" },
  dangerBtn:    { backgroundColor: "#fef2f2", borderColor: "#fecaca" },
  actionIcon:   { fontSize: 22, marginBottom: 4 },
  actionLabel:  { fontSize: 11, fontWeight: "600", color: "#475569" },
  dangerLabel:  { color: "#ef4444" },
  tip:          { backgroundColor: "#eff6ff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#bfdbfe" },
  tipTitle:     { fontWeight: "700", color: "#1e40af", marginBottom: 6 },
  tipText:      { color: "#3b82f6", fontSize: 13, lineHeight: 20 },
});
