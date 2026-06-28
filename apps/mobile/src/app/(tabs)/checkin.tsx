import { useState } from "react";
import {
  View, Text, ScrollView, StyleSheet, TextInput,
  TouchableOpacity, Alert, ActivityIndicator,
} from "react-native";
import { supabase } from "@/lib/supabase";

const SYMPTOMS = ["Headache","Nausea","Dizziness","Chest pain","Shortness of breath","Fatigue","Pain","Swelling","Fever","Cough"];
const MOODS = ["😢","😟","😐","🙂","😊"] as const;

export default function CheckInScreen() {
  const [heartRate, setHeartRate]   = useState("");
  const [bpSys, setBpSys]           = useState("");
  const [bpDia, setBpDia]           = useState("");
  const [oxygen, setOxygen]         = useState("");
  const [temp, setTemp]             = useState("");
  const [glucose, setGlucose]       = useState("");
  const [weight, setWeight]         = useState("");
  const [painLevel, setPainLevel]   = useState<number | null>(null);
  const [mood, setMood]             = useState<number | null>(null);
  const [symptoms, setSymptoms]     = useState<string[]>([]);
  const [notes, setNotes]           = useState("");
  const [saving, setSaving]         = useState(false);

  function toggleSymptom(s: string) {
    setSymptoms((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  }

  async function submit() {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }
    const { data: patient } = await supabase.from("patients").select("id").eq("profile_id", user.id).single();
    if (!patient) { Alert.alert("Error", "No patient profile found."); setSaving(false); return; }

    const { error } = await supabase.from("health_records").insert({
      patient_id:                patient.id,
      symptoms,
      pain_level:                painLevel,
      heart_rate:                heartRate ? parseInt(heartRate) : null,
      blood_pressure_systolic:   bpSys ? parseInt(bpSys) : null,
      blood_pressure_diastolic:  bpDia ? parseInt(bpDia) : null,
      oxygen_saturation:         oxygen ? parseInt(oxygen) : null,
      temperature:               temp ? parseFloat(temp) : null,
      glucose_mmol:              glucose ? parseFloat(glucose) : null,
      weight_kg:                 weight ? parseFloat(weight) : null,
      mood:                      mood ? String(mood) as any : null,
      notes: notes || null,
    });

    setSaving(false);
    if (error) { Alert.alert("Error", error.message); return; }
    Alert.alert("✅ Check-in saved", "Your caregiver has been notified.", [
      { text: "OK", onPress: () => { /* reset form */ } },
    ]);
  }

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
      <Text style={s.title}>Daily Check-in</Text>
      <Text style={s.sub}>{new Date().toLocaleDateString("en-ZA", { weekday: "long", day: "numeric", month: "long" })}</Text>

      {/* Vitals */}
      <Section title="Vitals">
        <Row>
          <Field label="Heart rate (bpm)" value={heartRate} onChangeText={setHeartRate} placeholder="72" keyboardType="numeric" />
          <Field label="SpO₂ (%)" value={oxygen} onChangeText={setOxygen} placeholder="97" keyboardType="numeric" />
        </Row>
        <Row>
          <Field label="BP systolic" value={bpSys} onChangeText={setBpSys} placeholder="120" keyboardType="numeric" />
          <Field label="BP diastolic" value={bpDia} onChangeText={setBpDia} placeholder="80" keyboardType="numeric" />
        </Row>
        <Row>
          <Field label="Temperature (°C)" value={temp} onChangeText={setTemp} placeholder="36.5" keyboardType="decimal-pad" />
          <Field label="Glucose (mmol/L)" value={glucose} onChangeText={setGlucose} placeholder="5.5" keyboardType="decimal-pad" />
        </Row>
        <Field label="Weight (kg)" value={weight} onChangeText={setWeight} placeholder="70" keyboardType="decimal-pad" full />
      </Section>

      {/* Mood */}
      <Section title="How are you feeling?">
        <View style={s.moodRow}>
          {MOODS.map((emoji, i) => (
            <TouchableOpacity
              key={i}
              style={[s.moodBtn, mood === i + 1 && s.moodSelected]}
              onPress={() => setMood(i + 1)}
            >
              <Text style={s.moodEmoji}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Section>

      {/* Pain */}
      <Section title="Pain level (1–10)">
        <View style={s.painRow}>
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <TouchableOpacity
              key={n}
              style={[s.painBtn, painLevel === n && s.painSelected, n >= 7 && { backgroundColor: "#fee2e2" }]}
              onPress={() => setPainLevel(n)}
            >
              <Text style={[s.painNum, painLevel === n && { color: "#fff" }]}>{n}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Section>

      {/* Symptoms */}
      <Section title="Symptoms (select all that apply)">
        <View style={s.chips}>
          {SYMPTOMS.map((sym) => (
            <TouchableOpacity
              key={sym}
              style={[s.chip, symptoms.includes(sym) && s.chipSelected]}
              onPress={() => toggleSymptom(sym)}
            >
              <Text style={[s.chipText, symptoms.includes(sym) && s.chipTextSelected]}>{sym}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Section>

      {/* Notes */}
      <Section title="Additional notes">
        <TextInput
          style={[s.input, s.textarea]}
          placeholder="Anything else to note…"
          placeholderTextColor="#94a3b8"
          multiline
          numberOfLines={4}
          value={notes}
          onChangeText={setNotes}
        />
      </Section>

      <TouchableOpacity style={s.submitBtn} onPress={submit} disabled={saving} activeOpacity={0.85}>
        {saving ? <ActivityIndicator color="#fff" /> : <Text style={s.submitText}>Submit check-in</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <View style={s.row}>{children}</View>;
}

function Field({ label, value, onChangeText, placeholder, keyboardType, full }: any) {
  return (
    <View style={[s.fieldWrap, full && { flex: 1 }]}>
      <Text style={s.label}>{label}</Text>
      <TextInput
        style={s.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        keyboardType={keyboardType ?? "default"}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container:       { flex: 1, backgroundColor: "#f8fafc" },
  content:         { padding: 20, paddingTop: 60, paddingBottom: 40 },
  title:           { fontSize: 26, fontWeight: "800", color: "#0f172a" },
  sub:             { color: "#94a3b8", fontSize: 14, marginTop: 4, marginBottom: 24 },
  section:         { marginBottom: 24 },
  sectionTitle:    { fontSize: 15, fontWeight: "700", color: "#334155", marginBottom: 12 },
  row:             { flexDirection: "row", gap: 12 },
  fieldWrap:       { flex: 1 },
  label:           { fontSize: 12, fontWeight: "600", color: "#64748b", marginBottom: 6 },
  input:           { backgroundColor: "#fff", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 12, padding: 13, fontSize: 15, color: "#0f172a" },
  textarea:        { height: 100, textAlignVertical: "top" },
  moodRow:         { flexDirection: "row", justifyContent: "space-between" },
  moodBtn:         { width: 52, height: 52, borderRadius: 26, backgroundColor: "#fff", borderWidth: 1, borderColor: "#e2e8f0", alignItems: "center", justifyContent: "center" },
  moodSelected:    { borderColor: "#1469f5", borderWidth: 2, backgroundColor: "#eff6ff" },
  moodEmoji:       { fontSize: 26 },
  painRow:         { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  painBtn:         { width: 40, height: 40, borderRadius: 10, backgroundColor: "#fff", borderWidth: 1, borderColor: "#e2e8f0", alignItems: "center", justifyContent: "center" },
  painSelected:    { backgroundColor: "#1469f5", borderColor: "#1469f5" },
  painNum:         { fontWeight: "700", color: "#334155" },
  chips:           { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip:            { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: "#fff", borderWidth: 1, borderColor: "#e2e8f0" },
  chipSelected:    { backgroundColor: "#1469f5", borderColor: "#1469f5" },
  chipText:        { fontSize: 13, color: "#475569", fontWeight: "500" },
  chipTextSelected:{ color: "#fff" },
  submitBtn:       { backgroundColor: "#1469f5", borderRadius: 16, padding: 18, alignItems: "center", marginTop: 8 },
  submitText:      { color: "#fff", fontWeight: "800", fontSize: 16 },
});
