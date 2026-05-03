// app/(tabs)/notifications.tsx
import { useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert, FlatList,
  StyleSheet, Text, TouchableOpacity, View
} from 'react-native';
import { NotificationController } from '../controllers/NotificationController';
import { Notification } from '../models/Notification';

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { chargerNotifs(); }, []);

  const chargerNotifs = async () => {
    try {
      const data = await NotificationController.fetchNotifications();
      setNotifications(data);
    } catch (err) {
      Alert.alert('Erreur',
        err instanceof Error ? err.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const handleAccepter = async (notif: Notification) => {
    try {
      await NotificationController.accepterReservation(notif);
      Alert.alert('✓ Accepté', 'Le passager a été notifié.');
      chargerNotifs();
    } catch (err) {
      Alert.alert('Erreur',
        err instanceof Error ? err.message : 'Erreur');
    }
  };

  const handleRefuser = async (notif: Notification) => {
    try {
      await NotificationController.refuserReservation(notif);
      Alert.alert('Refusé', 'Le passager a été notifié.');
      chargerNotifs();
    } catch (err) {
      Alert.alert('Erreur',
        err instanceof Error ? err.message : 'Erreur');
    }
  };

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator color="#4F46E5" />
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.titre}>Notifications</Text>
      <FlatList
        data={notifications}
        keyExtractor={item => item.id ?? ''}
        renderItem={({ item }) => (
          <View style={[styles.card, !item.lu && styles.cardNonLu]}>
            <Text style={styles.notifTitre}>{item.titre}</Text>
            <Text style={styles.notifCorps}>{item.corps}</Text>

            {/* Boutons si demande en attente */}
            {!item.lu && item.titre.includes('demande') && (
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.btnAccepter}
                  onPress={() => handleAccepter(item)}>
                  <Text style={styles.btnText}>✓ Accepter</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.btnRefuser}
                  onPress={() => handleRefuser(item)}>
                  <Text style={styles.btnText}>✗ Refuser</Text>
                </TouchableOpacity>
              </View>
            )}

            <Text style={styles.date}>
              {new Date(item.created_at ?? '')
                .toLocaleDateString('fr-TN')}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.vide}>Aucune notification</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  titre: {
    fontSize: 22, fontWeight: '700',
    marginTop: 60, marginBottom: 16
  },
  card: {
    backgroundColor: '#fff', borderRadius: 12,
    padding: 14, marginBottom: 10,
    borderWidth: 0.5, borderColor: '#e5e7eb'
  },
  cardNonLu: { borderLeftWidth: 4, borderLeftColor: '#4F46E5' },
  notifTitre: {
    fontSize: 14, fontWeight: '600',
    color: '#1e1e1e', marginBottom: 4
  },
  notifCorps: { fontSize: 13, color: '#555', marginBottom: 8 },
  actions: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  btnAccepter: {
    flex: 1, backgroundColor: '#1D9E75',
    padding: 10, borderRadius: 8, alignItems: 'center'
  },
  btnRefuser: {
    flex: 1, backgroundColor: '#EF4444',
    padding: 10, borderRadius: 8, alignItems: 'center'
  },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  date: { fontSize: 11, color: '#aaa', textAlign: 'right' },
  vide: { textAlign: 'center', color: '#aaa', marginTop: 40 }
});
