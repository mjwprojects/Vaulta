import { useState, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, Animated, Vibration } from "react-native";
import { supabase } from "@/lib/supabase";

export default function SOSScreen() {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const pulse = useRef(new Animated.Value(1)).current;

  function startPulse() {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.15, duration: 600, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }

  async function triggerSOS() {
    Alert.alert(
      "🆘 Send Emergency SOS?",
      "This will immediately alert all your caregivers with your emergency status.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send SOS",
          style: "destructive",
          onPress: async () => {
            setSending(true);
            startPulse();
            Vibration.vibrate([0, 500, 200, 500]);

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { setSending(false); return; }
            const { data: patient } = await supabase.from("patients").select("id").eq("profile_id", user.id).single();
            if (!patient) { Alert.alert("Error", "Patient profile not found."); setSending(false); return; }

            const { error } = await supabase.from("alerts").insert({
              patient_id: patient.id,
              type: "emergency",
              severity: "critical",
              title: "Emergency SOS",
              message: "Patient triggered emergency SOS via mobile app",
              metadata: { triggered_by: user.id, timestamp: new Date().toISOString() },
              status: "active",
            });

            setSending(false);
            if (error) { Alert.alert("Error", error.message); return; }
            setSent(true);
          },
        },
      ]
    );
  }

  function reset() {
    setSent(false);
    pulse.setValue(1);
  }

  return (
    <View style={s.container}>
      <Text style={s.title}>Emergency SOS</Text>
      <Text style={s.sub}>
        Press the button below to immediately alert all your authorised caregivers.
      </Text>

      <View style={s.center}>
        {!sent ? (
          <Animated.View style={{ transform: [{ scale: pulse }] }}>
            <TouchableOpacity
              style={[s.sosBtn, sending && s.sosBtnActive]}
              onPress={triggerSOS}
              disabled={sending}
              activeOpacity={0.85}
            >
              <Text style={s.sosIcon}>🆘</Text>
              <Text style={s.sosBtnText}>{sending ? "Sending…" : "SOS"}</Text>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <View style={s.sentCard}>
            <Text style={s.sentIcon}>✅</Text>
            <Text style={s.sentTitle}>Alert sent!</Text>
            <Text style={s.sentSub}>
              Your caregivers have been notified and will contact you shortly.
            </Text>
            <TouchableOpacity style={s.resetBtn} onPress={reset}>
              <Text style={s.resetText}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Info cards */}
      <View style={s.infoCards}>
        <InfoCard icon="📍" title="Location" desc="Your caregivers will be alerted immediately" />
        <InfoCard icon="🔔" title="Notification" desc="Push + email alerts sent to all caregivers" />
        <InfoCard icon="📋" title="Audit trail" desc="This action is logged with timestamp" />
      </View>

      <Text style={s.disclaimer}>
        Only use this button in a genuine emergency.{"\n"}
        All SOS triggers are logged and audited.
      </Text>
    </View>
  );
}

function InfoCard({ icon, title, desc }: any) {
  return (
    <View style={s.infoCard}>
      <Text style={s.infoIcon}>{icon}</Text>
      <Text style={s.infoTitle}>{title}</Text>
      <Text style={s.infoDesc}>{desc}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container:    { flex: 1, backgroundColor: "#fff5f5", padding: 24, paddingTop: 64 },
  title:        { fontSize: 26, fontWeight: "800", color: "#7f1d1d", textAlign: "center" },
  sub:          { color: "#b91c1c", fontSize: 14, textAlign: "center", marginTop: 8, marginBottom: 40, lineHeight: 20 },
  center:       { alignItems: "center", marginBottom: 40 },
  sosBtn:       { width: 180, height: 180, borderRadius: 90, backgroundColor: "#ef4444", alignItems: "center", justifyContent: "center", shadowColor: "#ef4444", shadowOpacity: 0.5, shadowRadius: 20, elevation: 12 },
  sosBtnActive: { backgroundColor: "#dc2626" },
  sosIcon:      { fontSize: 48, marginBottom: 4 },
  sosBtnText:   { color: "#fff", fontSize: 24, fontWeight: "900", letterSpacing: 2 },
  sentCard:     { alignItems: "center", backgroundColor: "#f0fdf4", borderRadius: 24, padding: 32, borderWidth: 1, borderColor: "#bbf7d0", width: "100%" },
  sentIcon:     { fontSize: 52, marginBottom: 12 },
  sentTitle:    { fontSize: 22, fontWeight: "800", color: "#166534" },
  sentSub:      { color: "#15803d", fontSize: 14, textAlign: "center", marginTop: 8, lineHeight: 20 },
  resetBtn:     { marginTop: 20, backgroundColor: "#16a34a", borderRadius: 12, paddingHorizontal: 28, paddingVertical: 12 },
  resetText:    { color: "#fff", fontWeight: "700" },
  infoCards:    { flexDirection: "row", gap: 10, marginBottom: 24 },
  infoCard:     { flex: 1, backgroundColor: "#fff", borderRadius: 14, padding: 14, borderWidth: 1, borderColor: "#fecaca", alignItems: "center" },
  infoIcon:     { fontSize: 22, marginBottom: 6 },
  infoTitle:    { fontSize: 11, fontWeight: "700", color: "#7f1d1d" },
  infoDesc:     { fontSize: 10, color: "#b91c1c", textAlign: "center", marginTop: 4, lineHeight: 14 },
  disclaimer:   { textAlign: "center", color: "#94a3b8", fontSize: 12, lineHeight: 18 },
});
