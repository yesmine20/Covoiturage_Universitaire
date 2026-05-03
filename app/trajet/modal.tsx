import { supabase } from "@/lib/supabase";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";

export default function AjouterTrajetModal() {
  const [form, setForm] = useState({
    depart: "",
    arrivee: "",
    date_depart: "",
    places_dispo: "",
    prix: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const handleSubmit = async () => {
    if (
      !form.depart ||
      !form.arrivee ||
      !form.date_depart ||
      !form.places_dispo ||
      !form.prix
    ) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Vous devez être connecté pour ajouter un trajet.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("trajets").insert([
      {
        user_id: user.id,
        depart: form.depart,
        arrivee: form.arrivee,
        date_depart: form.date_depart,
        places_dispo: parseInt(form.places_dispo),
        prix: parseFloat(form.prix),
        description: form.description || null,
      },
    ]);

    setLoading(false);

    if (error) {
      alert("Erreur : " + error.message);
    } else {
      alert("Trajet ajouté avec succès !");
      router.back();
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Ajouter un trajet</Text>

      <Text style={styles.label}>Ville de départ *</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: Tunis"
        value={form.depart}
        onChangeText={(val) => setForm({ ...form, depart: val })}
      />

      <Text style={styles.label}>Ville d'arrivée *</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: Sousse"
        value={form.arrivee}
        onChangeText={(val) => setForm({ ...form, arrivee: val })}
      />

      <Text style={styles.label}>Date et heure *</Text>
      {Platform.OS === "web" ? (
        <input
          type="datetime-local"
          style={{
            width: "100%",
            padding: "12px",
            fontSize: "15px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            backgroundColor: "#fafafa",
            marginBottom: "10px",
            fontFamily: "inherit",
            boxSizing: "border-box",
          }}
          onChange={(e) => setForm({ ...form, date_depart: e.target.value })}
        />
      ) : (
        <>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowPicker(true)}
          >
            <Text style={{ color: form.date_depart ? "#1a1a1a" : "#aaa" }}>
              {form.date_depart || "Choisir une date et heure"}
            </Text>
          </TouchableOpacity>
          {showPicker && (
            <DateTimePicker
              value={new Date()}
              mode="datetime"
              display="default"
              onChange={(event, selectedDate) => {
                setShowPicker(false);
                if (selectedDate) {
                  setForm({ ...form, date_depart: selectedDate.toISOString() });
                }
              }}
            />
          )}
        </>
      )}

      <Text style={styles.label}>Nombre de places *</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: 3"
        keyboardType="numeric"
        value={form.places_dispo}
        onChangeText={(val) => setForm({ ...form, places_dispo: val })}
      />

      <Text style={styles.label}>Prix (TND) *</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: 15"
        keyboardType="numeric"
        value={form.prix}
        onChangeText={(val) => setForm({ ...form, prix: val })}
      />

      <Text style={styles.label}>Description (optionnel)</Text>
      <TextInput
        style={[styles.input, styles.textarea]}
        placeholder="Ex: Climatisation disponible..."
        multiline
        numberOfLines={3}
        value={form.description}
        onChangeText={(val) => setForm({ ...form, description: val })}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Envoi en cours..." : "Ajouter le trajet"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
    color: "#1a1a1a",
  },
  label: {
    fontSize: 14,
    color: "#555",
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    backgroundColor: "#fafafa",
  },
  textarea: {
    height: 90,
    textAlignVertical: "top",
  },
  button: {
    backgroundColor: "#4f46e5",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 30,
    marginBottom: 40,
  },
  buttonDisabled: {
    backgroundColor: "#a5b4fc",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
