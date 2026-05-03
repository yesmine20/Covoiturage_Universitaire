import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { supabase } from "../../lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWide = width >= 900;

  async function signIn() {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      window.alert(error.message);
      setLoading(false);
      return;
    }
    if (!data.user.email_confirmed_at) {
      await supabase.auth.signOut();
      window.alert("Veuillez vérifier votre email avant de vous connecter.");
      setLoading(false);
      return;
    }
    setLoading(false);
    router.replace("/acceuil");
  }

  async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: "http://localhost:8081/acceuil" },
    });
    if (error) window.alert(error.message);
  }

  async function motDePasseOublie() {
    if (!email) {
      window.alert("Veuillez entrer votre email d'abord");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "http://localhost:8081/(auth)/reset-password",
    });
    if (error) window.alert(error.message);
    else
      window.alert(
        "Vérifiez votre boîte mail pour réinitialiser votre mot de passe.",
      );
  }

  const MapCard = () => (
    <View style={styles.mapShell}>
      <View style={styles.mapCard}>
        <View style={styles.mapRoadH1} />
        <View style={styles.mapRoadH2} />
        <View style={styles.mapRoadV1} />
        <View style={styles.mapRoadV2} />
        <View style={styles.mapRoadT1} />
        <View style={styles.mapRoadT2} />
        <View style={[styles.route, styles.route1]} />
        <View style={[styles.route, styles.route2]} />
        <View style={[styles.route, styles.route3]} />
        <View style={[styles.route, styles.route4]} />
        <View style={[styles.route, styles.route5]} />
        <View style={[styles.pin, styles.pinStart]}>
          <Text style={styles.pinGlyph}>📍</Text>
        </View>
        <View style={[styles.pin, styles.pinEnd]}>
          <Text style={styles.pinGlyph}>📍</Text>
        </View>
        <View style={styles.mapBubble}>
          <Text style={styles.mapBubblePrice}>2,000 TND</Text>
          <Text style={styles.mapBubbleMeta}>2 places disponibles</Text>
        </View>
      </View>

      {/* Brand overlay */}
      <View style={styles.brandOverlay}>
        <View style={styles.brandBadge}>
          <Text style={styles.brandBadgeText}>CU</Text>
        </View>
        <View>
          <Text style={styles.brandTitle}>Covoiturage Universitaire</Text>
          <Text style={styles.brandSubtitle}>
            Simple, fiable, pensé pour le campus
          </Text>
        </View>
      </View>
    </View>
  );

  const FormCard = () => (
    <View style={styles.formCard}>
      <Text style={styles.title}>Connexion</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity onPress={motDePasseOublie}>
        <Text style={styles.forgotLink}>Mot de passe oublié ?</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={signIn}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Connexion..." : "Se connecter"}
        </Text>
      </TouchableOpacity>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>ou</Text>
        <View style={styles.dividerLine} />
      </View>

      <TouchableOpacity style={styles.googleButton} onPress={signInWithGoogle}>
        <View style={styles.googleButtonInner}>
          <Text style={styles.googleIcon}>G</Text>
          <Text style={styles.googleButtonText}>Se connecter avec Google</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
        <Text style={styles.link}>Pas de compte ? S'inscrire</Text>
      </TouchableOpacity>
    </View>
  );

  if (isWide) {
    return (
      <View style={styles.wideContainer}>
        <View style={styles.leftPanel}>
          <MapCard />
        </View>
        <View style={styles.rightPanel}>
          <FormCard />
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scrollContainer}
      contentContainerStyle={styles.scrollContent}
    >
      <MapCard />
      <FormCard />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // Layout
  wideContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#f6f9ff",
  },
  leftPanel: {
    flex: 1,
    padding: 40,
    justifyContent: "center",
    backgroundColor: "#f6f9ff",
  },
  rightPanel: {
    width: 440,
    justifyContent: "center",
    padding: 40,
    backgroundColor: "#fff",
    shadowColor: "#233a5f",
    shadowOpacity: 0.08,
    shadowRadius: 28,
    shadowOffset: { width: -8, height: 0 },
    elevation: 10,
  },
  scrollContainer: { flex: 1, backgroundColor: "#f6f9ff" },
  scrollContent: { flexGrow: 1 },

  // Map card
  mapShell: {
    flex: 1,
    maxHeight: 500,
    backgroundColor: "#ffffff",
    borderRadius: 30,
    padding: 18,
    borderWidth: 1,
    borderColor: "#edf1f7",
    shadowColor: "#29507c",
    shadowOpacity: 0.08,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 14 },
    elevation: 5,
    position: "relative",
  },
  mapCard: {
    flex: 1,
    borderRadius: 26,
    backgroundColor: "#f1f4f9",
    overflow: "hidden",
    position: "relative",
  },
  mapRoadH1: {
    position: "absolute",
    top: 54,
    left: -10,
    width: 520,
    height: 9,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.95)",
    transform: [{ rotate: "15deg" }],
  },
  mapRoadH2: {
    position: "absolute",
    top: 210,
    left: -40,
    width: 520,
    height: 9,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.95)",
    transform: [{ rotate: "-14deg" }],
  },
  mapRoadV1: {
    position: "absolute",
    top: -20,
    left: 130,
    width: 10,
    height: 700,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.95)",
    transform: [{ rotate: "12deg" }],
  },
  mapRoadV2: {
    position: "absolute",
    top: -40,
    right: 96,
    width: 10,
    height: 740,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.95)",
    transform: [{ rotate: "-8deg" }],
  },
  mapRoadT1: {
    position: "absolute",
    top: 90,
    right: 4,
    width: 290,
    height: 9,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.95)",
    transform: [{ rotate: "58deg" }],
  },
  mapRoadT2: {
    position: "absolute",
    bottom: 96,
    left: 28,
    width: 240,
    height: 9,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.95)",
    transform: [{ rotate: "-48deg" }],
  },
  route: {
    position: "absolute",
    height: 8,
    borderRadius: 8,
    backgroundColor: "#2f80ff",
  },
  route1: { top: 92, left: 68, width: 118, transform: [{ rotate: "42deg" }] },
  route2: { top: 170, left: 156, width: 90, transform: [{ rotate: "18deg" }] },
  route3: { top: 238, left: 214, width: 110, transform: [{ rotate: "78deg" }] },
  route4: {
    top: 336,
    left: 292,
    width: 106,
    transform: [{ rotate: "-12deg" }],
  },
  route5: { top: 432, left: 384, width: 102, transform: [{ rotate: "56deg" }] },
  pin: {
    position: "absolute",
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#5c95ff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2f80ff",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  pinGlyph: { fontSize: 20 },
  pinStart: { top: 24, left: 34 },
  pinEnd: { right: 38, bottom: 34 },
  mapBubble: {
    position: "absolute",
    top: 118,
    right: 28,
    minWidth: 150,
    backgroundColor: "#ffffff",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: "#18355d",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  mapBubblePrice: {
    color: "#1f2430",
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 6,
  },
  mapBubbleMeta: { color: "#66758a", fontSize: 12, fontWeight: "600" },

  // Brand overlay
  brandOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  brandBadge: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: "#2f80ff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2f80ff",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  brandBadgeText: { color: "#fff", fontSize: 30, fontWeight: "800" },
  brandTitle: { color: "#1f2430", fontSize: 26, fontWeight: "800" },
  brandSubtitle: { color: "#6f7e95", fontSize: 16, marginTop: 4 },

  // Form
  formCard: { padding: 8 },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 28,
    textAlign: "center",
    color: "#1f2430",
  },
  input: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    fontSize: 15,
    backgroundColor: "#f8fafc",
    color: "#1f2430",
  },
  forgotLink: {
    textAlign: "right",
    color: "#2f80ff",
    fontSize: 13,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#2f80ff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#2f80ff",
    shadowOpacity: 0.24,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 10,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#e2e8f0" },
  dividerText: { color: "#94a3b8", fontSize: 13 },
  googleButton: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  googleButtonInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  googleIcon: { fontSize: 18, fontWeight: "700", color: "#4285F4" },
  googleButtonText: { color: "#444", fontSize: 16, fontWeight: "600" },
  link: { textAlign: "center", color: "#2f80ff", fontSize: 14 },
});
