import { supabase } from "@/lib/supabase";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function TrajetsScreen() {
  const [trajets, setTrajets] = useState<any[]>([]);
  const [trajetsFiltres, setTrajetsFiltres] = useState<any[]>([]);
  const [trajetChoisi, setTrajetChoisi] = useState<any>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [filterVisible, setFilterVisible] = useState(false);
  const toastAnim = useRef(new Animated.Value(0)).current;

  const [filterDepart, setFilterDepart] = useState("");
  const [filterArrivee, setFilterArrivee] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterPrixMax, setFilterPrixMax] = useState("");
  const [filterPlaces, setFilterPlaces] = useState("");

  const { toast } = useLocalSearchParams();

  useEffect(() => {
    supabase
      .from("trajets")
      .select("*")
      .then(({ data }) => {
        setTrajets(data ?? []);
        setTrajetsFiltres(data ?? []);
      });
  }, []);

  useEffect(() => {
    if (toast) {
      setToastMessage(toast as string);
      setToastVisible(true);
      Animated.sequence([
        Animated.timing(toastAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(2500),
        Animated.timing(toastAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => setToastVisible(false));
    }
  }, [toast]);

  const appliquerFiltres = () => {
    let result = [...trajets];
    if (filterDepart.trim())
      result = result.filter((t) =>
        t.depart.toLowerCase().includes(filterDepart.toLowerCase()),
      );
    if (filterArrivee.trim())
      result = result.filter((t) =>
        t.arrivee.toLowerCase().includes(filterArrivee.toLowerCase()),
      );
    if (filterDate.trim())
      result = result.filter((t) => t.date_depart.startsWith(filterDate));
    if (filterPrixMax.trim())
      result = result.filter((t) => t.prix <= parseFloat(filterPrixMax));
    if (filterPlaces.trim())
      result = result.filter((t) => t.places_dispo >= parseInt(filterPlaces));
    setTrajetsFiltres(result);
    setFilterVisible(false);
  };

  const reinitialiserFiltres = () => {
    setFilterDepart("");
    setFilterArrivee("");
    setFilterDate("");
    setFilterPrixMax("");
    setFilterPlaces("");
    setTrajetsFiltres(trajets);
    setFilterVisible(false);
  };

  const allerAuFormulaire = () => {
    router.push({
      pathname: "/reservation",
      params: { trajet: JSON.stringify(trajetChoisi) },
    });
  };

  const filtresActifs =
    filterDepart ||
    filterArrivee ||
    filterDate ||
    filterPrixMax ||
    filterPlaces;

  return (
    <View style={styles.container}>
      {toastVisible && (
        <Animated.View
          style={[
            styles.toast,
            {
              opacity: toastAnim,
              transform: [
                {
                  translateY: toastAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.toastText}>✓ {toastMessage}</Text>
        </Animated.View>
      )}

      <View style={styles.header}>
        <Text style={styles.titre}>Trajets disponibles</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/trajet/modal")}
        >
          <Text style={styles.buttonText}>+ Ajouter</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[
          styles.filterBtn,
          filtresActifs ? styles.filterBtnActive : null,
        ]}
        onPress={() => setFilterVisible(true)}
      >
        <Text
          style={[
            styles.filterBtnText,
            filtresActifs ? styles.filterBtnTextActive : null,
          ]}
        >
          {filtresActifs ? "🔍 Filtres actifs" : "🔍 Filtrer"}
        </Text>
      </TouchableOpacity>

      <Text style={styles.count}>
        {trajetsFiltres.length} trajet(s) trouvé(s)
      </Text>

      <FlatList
        data={trajetsFiltres}
        keyExtractor={(item) => item.id}
        style={{ marginTop: 10 }}
        ListEmptyComponent={
          <Text style={styles.empty}>
            Aucun trajet ne correspond aux filtres.
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.carte}>
            <Text style={styles.trajetTitre}>
              {item.depart} → {item.arrivee}
            </Text>
            <Text style={styles.trajetInfo}>{item.date_depart}</Text>
            <Text style={styles.trajetInfo}>
              {item.places_dispo} place(s) · {item.prix} TND
            </Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => setTrajetChoisi(item)}
            >
              <Text style={styles.buttonText}>Voir détails</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Filter Modal */}
      <Modal visible={filterVisible} transparent animationType="slide">
        <View style={styles.fond}>
          <ScrollView>
            <View style={styles.popup}>
              <Text style={styles.titre}>Filtrer les trajets</Text>

              <Text style={styles.label}>Ville de départ</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Tunis"
                value={filterDepart}
                onChangeText={setFilterDepart}
              />

              <Text style={styles.label}>Ville d'arrivée</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Sousse"
                value={filterArrivee}
                onChangeText={setFilterArrivee}
              />

              <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: 2026-05-10"
                value={filterDate}
                onChangeText={setFilterDate}
              />

              <Text style={styles.label}>Prix maximum (TND)</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: 20"
                keyboardType="numeric"
                value={filterPrixMax}
                onChangeText={setFilterPrixMax}
              />

              <Text style={styles.label}>Places minimum</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: 2"
                keyboardType="numeric"
                value={filterPlaces}
                onChangeText={setFilterPlaces}
              />

              <TouchableOpacity
                style={styles.button}
                onPress={appliquerFiltres}
              >
                <Text style={styles.buttonText}>Appliquer</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.boutonFermer}
                onPress={reinitialiserFiltres}
              >
                <Text style={styles.buttonText}>Réinitialiser</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.boutonAnnuler}
                onPress={() => setFilterVisible(false)}
              >
                <Text style={styles.boutonAnnulerText}>Annuler</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Detail Modal */}
      <Modal visible={trajetChoisi != null} transparent animationType="slide">
        <View style={styles.fond}>
          <View style={styles.popup}>
            <Text style={styles.titre}>
              {trajetChoisi?.depart} → {trajetChoisi?.arrivee}
            </Text>
            <Text style={styles.infoLine}>
              📅 Date : {trajetChoisi?.date_depart}
            </Text>
            <Text style={styles.infoLine}>
              💰 Prix : {trajetChoisi?.prix} TND / place
            </Text>
            <Text style={styles.infoLine}>
              💺 Places disponibles : {trajetChoisi?.places_dispo}
            </Text>
            <Text style={styles.infoLine}>
              📝 Description : {trajetChoisi?.description ?? "Aucune"}
            </Text>

            <TouchableOpacity
              style={[
                styles.boutonReserver,
                trajetChoisi?.places_dispo === 0 &&
                  styles.boutonReserverDisabled,
              ]}
              disabled={trajetChoisi?.places_dispo === 0}
              onPress={allerAuFormulaire}
            >
              <Text style={styles.buttonText}>
                {trajetChoisi?.places_dispo === 0
                  ? "Complet"
                  : "Réserver une place"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.boutonFermer}
              onPress={() => setTrajetChoisi(null)}
            >
              <Text style={styles.buttonText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f5f5f5" },
  toast: {
    position: "absolute",
    top: 55,
    left: 16,
    right: 16,
    backgroundColor: "#1D9E75",
    padding: 14,
    borderRadius: 12,
    zIndex: 999,
  },
  toastText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
    textAlign: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 60,
  },
  titre: { fontSize: 22, fontWeight: "600" },
  filterBtn: {
    marginTop: 16,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#4f46e5",
    alignItems: "center",
  },
  filterBtnActive: { backgroundColor: "#4f46e5" },
  filterBtnText: { color: "#4f46e5", fontWeight: "600" },
  filterBtnTextActive: { color: "#fff" },
  count: { marginTop: 8, color: "#888", fontSize: 13 },
  empty: { textAlign: "center", marginTop: 40, color: "#888", fontSize: 15 },
  button: {
    backgroundColor: "#4f46e5",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },
  carte: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    gap: 5,
  },
  trajetTitre: { fontSize: 17, fontWeight: "bold" },
  trajetInfo: { fontSize: 13, color: "#666" },
  rowInfo: { flexDirection: "row", justifyContent: "space-between" },
  fond: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  popup: { backgroundColor: "#fff", borderRadius: 12, padding: 20, gap: 8 },
  infoLine: { fontSize: 14, color: "#444", paddingVertical: 2 },
  label: { fontSize: 13, color: "#555", marginTop: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    backgroundColor: "#fafafa",
  },
  boutonReserver: {
    backgroundColor: "#4f46e5",
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 8,
    alignItems: "center",
  },
  boutonReserverDisabled: { backgroundColor: "#d1d5db" },
  boutonFermer: {
    backgroundColor: "#ef4444",
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 4,
    alignItems: "center",
  },
  boutonAnnuler: {
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 4,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  boutonAnnulerText: { color: "#666", fontSize: 15 },
});
