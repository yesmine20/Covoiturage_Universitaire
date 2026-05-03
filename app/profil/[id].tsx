import { supabase } from "@/lib/supabase";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function PublicProfilScreen() {
  const { id } = useLocalSearchParams();
  const [profil, setProfil] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfil = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (!error) setProfil(data);
      setLoading(false);
    };

    fetchProfil();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  if (!profil) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Profil introuvable.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {profil.prenom?.charAt(0).toUpperCase() ?? "?"}
          </Text>
        </View>
        <Text style={styles.nom}>
          {profil.prenom} {profil.nom}
        </Text>
        <Text style={styles.membre}>
          Membre depuis{" "}
          {new Date(profil.created_at).toLocaleDateString("fr-TN")}
        </Text>
      </View>

      {/* Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitre}>Informations</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Prénom</Text>
          <Text style={styles.infoValeur}>{profil.prenom ?? "—"}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Nom</Text>
          <Text style={styles.infoValeur}>{profil.nom ?? "—"}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Membre depuis</Text>
          <Text style={styles.infoValeur}>
            {new Date(profil.created_at).toLocaleDateString("fr-TN")}
          </Text>
        </View>
      </View>

      {/* Back button */}
      <TouchableOpacity style={styles.btnRetour} onPress={() => router.back()}>
        <Text style={styles.btnRetourText}>← Retour</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { fontSize: 16, color: "#888" },
  avatarContainer: {
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 24,
    backgroundColor: "#4F46E5",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarText: { fontSize: 32, fontWeight: "700", color: "#4F46E5" },
  nom: { color: "#fff", fontSize: 20, fontWeight: "700" },
  membre: { color: "#E0E7FF", fontSize: 13, marginTop: 4 },
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    margin: 16,
    padding: 16,
  },
  sectionTitre: {
    fontSize: 13,
    fontWeight: "600",
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "#eee",
  },
  infoLabel: { fontSize: 14, color: "#555" },
  infoValeur: { fontSize: 14, color: "#1e1e1e", fontWeight: "500" },
  btnRetour: {
    margin: 16,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 0.5,
    borderColor: "#ddd",
    marginBottom: 40,
  },
  btnRetourText: { color: "#4F46E5", fontWeight: "600", fontSize: 15 },
});
