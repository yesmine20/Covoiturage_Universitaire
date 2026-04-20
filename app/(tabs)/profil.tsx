import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, Alert, ScrollView
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';

export default function ProfilScreen() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUser();
  }, []);

  const getUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    setLoading(false);
  };

  const seDeconnecter = async () => {
  const confirmed = window.confirm('Voulez-vous vraiment vous déconnecter ?')
  if (confirmed) {
    await supabase.auth.signOut()
  }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>

      {/* Avatar */}
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.email?.charAt(0).toUpperCase() ?? 'U'}
          </Text>
        </View>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      {/* Infos */}
      <View style={styles.section}>
        <Text style={styles.sectionTitre}>Mes informations</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoValeur}>{user?.email}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Membre depuis</Text>
          <Text style={styles.infoValeur}>
            {new Date(user?.created_at).toLocaleDateString('fr-TN')}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Statut</Text>
          <Text style={styles.badge}>
            {user?.email_confirmed_at ? 'Vérifié' : 'Non vérifié'}
          </Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitre}>Mon activité</Text>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => router.push('/reservation')}
        >
          <Text style={styles.actionBtnText}>Mes réservations</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => router.push('/trajets')}
        >
          <Text style={styles.actionBtnText}>Mes trajets publiés</Text>
        </TouchableOpacity>
      </View>

      {/* Déconnexion */}
      <TouchableOpacity
        style={styles.btnDeconnexion}
        onPress={seDeconnecter}
      >
        <Text style={styles.btnDeconnexionText}>Se déconnecter</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarContainer: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 24,
    backgroundColor: '#4F46E5',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#4F46E5',
  },
  email: {
    color: '#E0E7FF',
    fontSize: 14,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 16,
    marginBottom: 0,
    padding: 16,
  },
  sectionTitre: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
  },
  infoLabel: {
    fontSize: 14,
    color: '#555',
  },
  infoValeur: {
    fontSize: 14,
    color: '#1e1e1e',
    fontWeight: '500',
  },
  badge: {
    backgroundColor: '#E0F2FE',
    color: '#0369A1',
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 99,
  },
  actionBtn: {
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
  },
  actionBtnText: {
    fontSize: 15,
    color: '#4F46E5',
    fontWeight: '500',
  },
  btnDeconnexion: {
    margin: 16,
    marginTop: 24,
    backgroundColor: '#FEE2E2',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 40,
  },
  btnDeconnexionText: {
    color: '#DC2626',
    fontWeight: '700',
    fontSize: 15,
  },
});