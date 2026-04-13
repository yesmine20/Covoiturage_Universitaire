import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { router } from 'expo-router';

// Données de test — à remplacer par Supabase plus tard
const TRAJETS_TEST = [
  {
    id: '1',
    depart: 'Sfax',
    arrivee: 'Tunis',
    date_depart: '2026-04-15 08:00',
    places_dispo: 3,
    prix: 15,
    description: 'Trajet direct, climatisé',
  },
  {
    id: '2',
    depart: 'Sousse',
    arrivee: 'Sfax',
    date_depart: '2026-04-15 09:30',
    places_dispo: 0,
    prix: 10,
    description: 'Départ devant la fac',
  },
];

export default function TrajetsScreen() {
  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.titre}>Trajets disponibles</Text>
        <TouchableOpacity
          style={styles.btnAjouter}
          onPress={() => router.push('/trajet/modal')}
        >
          <Text style={styles.btnAjouterText}>+ Ajouter</Text>
        </TouchableOpacity>
      </View>

      {/* Liste des trajets */}
      <FlatList
        data={TRAJETS_TEST}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 30 }}
        renderItem={({ item }) => (
          <View style={styles.card}>

            {/* Infos trajet */}
            <Text style={styles.trajetTitre}>
              {item.depart} → {item.arrivee}
            </Text>
            <Text style={styles.trajetInfo}>
              Date : {item.date_depart}
            </Text>
            <Text style={styles.trajetInfo}>
              Places disponibles : {item.places_dispo}
            </Text>
            <Text style={styles.trajetInfo}>
              Prix : {item.prix} DT / place
            </Text>
            {item.description ? (
              <Text style={styles.trajetDesc}>
                {item.description}
              </Text>
            ) : null}

            {/* Bouton Réserver */}
            <TouchableOpacity
              style={[
                styles.btnReserver,
                item.places_dispo === 0 && styles.btnReserverDisabled
              ]}
              disabled={item.places_dispo === 0}
              onPress={() => router.push({
                pathname: '/reservation',
                params: { trajet: JSON.stringify(item) }
              })}
            >
              <Text style={styles.btnReserverText}>
                {item.places_dispo === 0
                  ? 'Complet'
                  : 'Réserver une place'
                }
              </Text>
            </TouchableOpacity>

          </View>
        )}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 16,
  },
  titre: {
    fontSize: 22,
    fontWeight: '600',
  },
  btnAjouter: {
    backgroundColor: '#4f46e5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  btnAjouterText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 0.5,
    borderColor: '#e5e7eb',
  },
  trajetTitre: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1e1e1e',
    marginBottom: 8,
  },
  trajetInfo: {
    fontSize: 13,
    color: '#555',
    marginBottom: 4,
  },
  trajetDesc: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
    marginTop: 4,
    marginBottom: 4,
  },
  btnReserver: {
    backgroundColor: '#4f46e5',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  btnReserverDisabled: {
    backgroundColor: '#d1d5db',
  },
  btnReserverText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});