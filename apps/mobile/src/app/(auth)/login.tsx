import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from "react-native";
import { router } from "expo-router";
import { supabase } from "@/lib/supabase";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function signIn() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { Alert.alert("Sign in failed", error.message); return; }
    router.replace("/(tabs)/home");
  }

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={s.brand}>
        <Text style={s.logo}>🛡️ Vaulta</Text>
        <Text style={s.tagline}>Your health, securely connected.</Text>
      </View>

      <View style={s.card}>
        <Text style={s.heading}>Welcome back</Text>
        <Text style={s.sub}>Sign in to your patient account</Text>

        <TextInput
          style={s.input}
          placeholder="Email address"
          placeholderTextColor="#94a3b8"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={s.input}
          placeholder="Password"
          placeholderTextColor="#94a3b8"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={s.btn} onPress={signIn} disabled={loading} activeOpacity={0.85}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={s.btnText}>Sign in</Text>
          )}
        </TouchableOpacity>

        <Text style={s.footer}>MFA-protected · Consent-based access · Fully audited</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container:  { flex: 1, backgroundColor: "#1469f5", justifyContent: "flex-end" },
  brand:      { alignItems: "center", paddingBottom: 40 },
  logo:       { fontSize: 32, fontWeight: "800", color: "#fff" },
  tagline:    { color: "#bfdbfe", fontSize: 14, marginTop: 6 },
  card:       { backgroundColor: "#fff", borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 28, paddingBottom: 44 },
  heading:    { fontSize: 24, fontWeight: "700", color: "#0f172a" },
  sub:        { color: "#94a3b8", fontSize: 14, marginTop: 4, marginBottom: 24 },
  input:      { borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 14, padding: 14, fontSize: 15, marginBottom: 12, color: "#0f172a", backgroundColor: "#f8fafc" },
  btn:        { backgroundColor: "#1469f5", borderRadius: 14, padding: 16, alignItems: "center", marginTop: 4 },
  btnText:    { color: "#fff", fontWeight: "700", fontSize: 16 },
  footer:     { textAlign: "center", color: "#94a3b8", fontSize: 11, marginTop: 20 },
});
