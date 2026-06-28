import { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { supabase } from "@/lib/supabase";

type MedLog = {
  id: string;
  medication_id: string;
  name: string;
  dosage: string;
  scheduled_at: string;
  status: "taken" | "missed" | "pending" | "skipped";
};

export default function MedicationsScreen() {
  const [logs, setLogs] = useState<MedLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadMeds(); }, []);

  async function loadMeds() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: patient } = await supabase.from("patients").select("id").eq("profile_id", user.id).single();
    if (!patient) { setLoading(false); return; }

    const today = new Date().toISOString().split("T")[0];
    const { data } = await supabase
      .from("medication_logs")
      .select("*, medication:medications(name, dosage)")
      .eq("patient_id", patient.id)
      .gte("scheduled_at", today)
      .order("scheduled_at");

    setLogs((data ?? []).map((l: any) => ({
      id: l.id,
      medication_id: l.medication_id,
      name: l.medication?.name ?? "Unknown",
      dosage: l.medication?.dosage ?? "",
      scheduled_at: l.scheduled_at,
      status: l.status,
    })));
    setLoading(false);
  }

  async function markStatus(logId: string, status: "taken" | "skipped") {
    const { error } = await supabase
      .from("medication_logs")
      .update({ status, taken_at: status === "taken" ? new Date().toISOString() : null })
      .eq("id", logId);
    if (error) { Alert.alert("Error", error.message); return; }
    setLogs((prev) => prev.map((l) => l.id === logId ? { ...l, status } : l));
  }

  const pending = logs.filter((l) => l.status === "pending");
  const done    = logs.filter((l) => l.status !== "pending");
  const taken   = logs.filter((l) => l.status === "taken").length;

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <Text style={s.title}>Medications</Text>
      <Text style={s.sub}>Today · {new Date().toLocaleDateString("en-ZA", { day: "numeric", month: "long" })}</Text>

      {/* Progress */}
      <View style={s.progress}>
        <View style={s.progressBar}>
          <View style={[s.progressFill, { width: `${logs.length ? (taken / logs.length) * 100 : 0}%` as any }]} />
        </View>
        <Text style={s.progressText}>{taken}/{logs.length} taken</Text>
      </View>

      {loading ? (
        <ActivityIndicator color="#1469f5" style={{ marginTop: 40 }} />
      ) : logs.length === 0 ? (
        <View style={s.empty}>
          <Text style={s.emptyIcon}>💊</Text>
          <Text style={s.emptyText}>No medications scheduled for today.</Text>
        </View>
      ) : (
        <>
          {pending.length > 0 && (
            <View style={s.group}>
              <Text style={s.groupTitle}>Due</Text>
              {pending.map((l) => <MedCard key={l.id} log={l} onMark={markStatus} />)}
            </View>
          )}
          {done.length > 0 && (
            <View style={s.group}>
              <Text style={s.groupTitle}>Completed</Text>
              {done.map((l) => <MedCard key={l.id} log={l} onMark={markStatus} />)}
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

function MedCard({ log, onMark }: { log: MedLog; onMark: (id: string, s: "taken" | "skipped") => void }) {
  const time = new Date(log.scheduled_at).toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" });
  const STATUS_COLOR: Record<string, string> = {
    taken:   "#22c55e", missed: "#ef4444", skipped: "#f59e0b", pending: "#94a3b8",
  };

  return (
    <View style={s.card}>
      <View style={[s.statusDot, { backgroundColor: STATUS_COLOR[log.status] }]} />
      <View style={s.cardInfo}>
        <Text style={s.medName}>{log.name}</Text>
        <Text style={s.medDose}>{log.dosage} · {time}</Text>
      </View>
      {log.status === "pending" && (
        <View style={s.actions}>
          <TouchableOpacity style={s.takenBtn} onPress={() => onMark(log.id, "taken")}>
            <Text style={s.takenText}>Taken</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.skipBtn} onPress={() => onMark(log.id, "skipped")}>
            <Text style={s.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>
      )}
      {log.status !== "pending" && (
        <Text style={[s.statusBadge, { color: STATUS_COLOR[log.status] }]}>
          {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
        </Text>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container:    { flex: 1, backgroundColor: "#f8fafc" },
  content:      { padding: 20, paddingTop: 60, paddingBottom: 40 },
  title:        { fontSize: 26, fontWeight: "800", color: "#0f172a" },
  sub:          { color: "#94a3b8", fontSize: 14, marginTop: 4, marginBottom: 20 },
  progress:     { marginBottom: 24 },
  progressBar:  { height: 6, backgroundColor: "#e2e8f0", borderRadius: 3, overflow: "hidden", marginBottom: 6 },
  progressFill: { height: "100%", backgroundColor: "#1469f5", borderRadius: 3 },
  progressText: { fontSize: 12, color: "#64748b", fontWeight: "600" },
  group:        { marginBottom: 20 },
  groupTitle:   { fontSize: 12, fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 },
  card:         { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 14, padding: 16, marginBottom: 8, borderWidth: 1, borderColor: "#e2e8f0" },
  statusDot:    { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  cardInfo:     { flex: 1 },
  medName:      { fontWeight: "700", color: "#0f172a", fontSize: 15 },
  medDose:      { color: "#94a3b8", fontSize: 13, marginTop: 2 },
  actions:      { flexDirection: "row", gap: 8 },
  takenBtn:     { backgroundColor: "#1469f5", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7 },
  takenText:    { color: "#fff", fontWeight: "700", fontSize: 13 },
  skipBtn:      { borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7 },
  skipText:     { color: "#94a3b8", fontWeight: "600", fontSize: 13 },
  statusBadge:  { fontWeight: "700", fontSize: 13 },
  empty:        { alignItems: "center", paddingVertical: 48 },
  emptyIcon:    { fontSize: 48, marginBottom: 12 },
  emptyText:    { color: "#94a3b8", fontSize: 15 },
});
