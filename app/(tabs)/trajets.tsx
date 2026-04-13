import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function TrajetsScreen() {
  const [trajets, setTrajets] = useState<any[]>([]);
  const [trajetChoisi, setTrajetChoisi] = useState<any>(null);

  useEffect(() => {
    supabase.from('trajets').select('*').then(({ data }) => setTrajets(data ?? []));
  }, []);

  const allerAuFormulaire = () => {
    setTrajetChoisi(null); // fermer le modal
    router.push({
      pathname: '/reservation',
      params: { trajet: JSON.stringify(trajetChoisi) }
    });
  };

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.titre}>Trajets disponibles</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/trajet/modal')}
        >
          <Text style={styles.buttonText}>+ Ajouter</Text>
        </TouchableOpacity>
      </View>

      {/* Liste trajets */}
      <FlatList
        data={trajets}
        keyExtractor={(item) => item.id}
        style={{ marginTop: 20 }}
        renderItem={({ item }) => (
          <View style={styles.carte}>
            <Text style={styles.trajetTitre}>
              {item.depart} → {item.arrivee}
            </Text>
            <Text style={styles.trajetInfo}>{item.date_depart}</Text>
            <View style={styles.rowInfo}>
              <Text style={styles.trajetInfo}>
                {item.places_dispo} place(s) · {item.prix} TND
              </Text>
            </View>
            <TouchableOpacity
              style={styles.button}
              onPress={() => setTrajetChoisi(item)}
            >
              <Text style={styles.buttonText}>Voir détails</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Modal détail trajet */}
      <Modal visible={trajetChoisi != null} transparent animationType="slide">
        <View style={styles.fond}>
          <View style={styles.popup}>

            {/* Titre */}
            <Text style={styles.titre}>
              {trajetChoisi?.depart} → {trajetChoisi?.arrivee}
            </Text>

            {/* Infos */}
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
              📝 Description : {trajetChoisi?.description ?? 'Aucune'}
            </Text>

            {/* Bouton Réserver */}
            <TouchableOpacity
              style={[
                styles.boutonReserver,
                trajetChoisi?.places_dispo === 0 && styles.boutonReserverDisabled
              ]}
              disabled={trajetChoisi?.places_dispo === 0}
              onPress={allerAuFormulaire}
            >
              <Text style={styles.buttonText}>
                {trajetChoisi?.places_dispo === 0
                  ? 'Complet'
                  : 'Réserver une place'
                }
              </Text>
            </TouchableOpacity>

            {/* Bouton Fermer */}
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
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 60
  },
  titre: {
    fontSize: 22,
    fontWeight: '600'
  },
  button: {
    backgroundColor: '#4f46e5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center'
  },
  carte: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    gap: 5
  },
  trajetTitre: {
    fontSize: 17,
    fontWeight: 'bold'
  },
  trajetInfo: {
    fontSize: 13,
    color: '#666'
  },
  rowInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  fond: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20
  },
  popup: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    gap: 8
  },
  infoLine: {
    fontSize: 14,
    color: '#444',
    paddingVertical: 2
  },
  boutonReserver: {
    backgroundColor: '#4f46e5',
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 8
  },
  boutonReserverDisabled: {
    backgroundColor: '#d1d5db'
  },
  boutonFermer: {
    backgroundColor: '#ef4444',
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 4
  },
});