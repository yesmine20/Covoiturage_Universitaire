// import { View, Text, StyleSheet } from 'react-native';

// export default function TrajetsScreen() {
//   return (
//     <View style={styles.container}>
//       <Text style={styles.titre}>Trajets disponibles</Text>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 16,
//     backgroundColor: '#f5f5f5',
//   },
//   titre: {
//     fontSize: 22,
//     fontWeight: '600',
//     marginTop: 60,
//   },
// });

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

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <Text style={styles.titre}>Trajets disponibles</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.push('/trajet/modal')}>
          <Text style={styles.buttonText}>+ Ajouter</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={trajets}
        keyExtractor={(item) => item.id}
        style={{ marginTop: 20 }}
        renderItem={({ item }) => (
          <View style={styles.carte}>
            <Text style={styles.trajetTitre}>{item.depart} → {item.arrivee}</Text>
            <Text>{item.date_depart}</Text>
            <TouchableOpacity style={styles.button} onPress={() => setTrajetChoisi(item)}>
              <Text style={styles.buttonText}>Voir détails</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <Modal visible={trajetChoisi != null} transparent animationType="slide">
        <View style={styles.fond}>
          <View style={styles.popup}>
            <Text style={styles.titre}>{trajetChoisi?.depart} → {trajetChoisi?.arrivee}</Text>
            <Text>Date : {trajetChoisi?.date_depart}</Text>
            <Text>Prix : {trajetChoisi?.prix} TND</Text>
            <Text>Places : {trajetChoisi?.places_dispo}</Text>
            <Text>Description : {trajetChoisi?.description}</Text>
            <Text>Publié par : {trajetChoisi?.user_id}</Text>
            <TouchableOpacity style={styles.boutonFermer} onPress={() => setTrajetChoisi(null)}>
              <Text style={styles.buttonText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 60 },
  titre: { fontSize: 22, fontWeight: '600' },
  button: { backgroundColor: '#4f46e5', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: '600', textAlign: 'center' },
  carte: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10, gap: 5 },
  trajetTitre: { fontSize: 17, fontWeight: 'bold' },
  fond: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  popup: { backgroundColor: '#fff', borderRadius: 12, padding: 20, gap: 8 },
  boutonFermer: { backgroundColor: 'red', paddingVertical: 10, borderRadius: 8, marginTop: 10 },
});