import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import { supabase } from '@/lib/supabase';

type UserProfile = {
  nom?: string | null;
  prenom?: string | null;
  avatar_url?: string | null;
};

type Feedback =
  | {
      type: 'error' | 'success';
      message: string;
    }
  | null;

function getAvatarStorageKey(userId: string) {
  return `profile_avatar_${userId}`;
}

export default function ProfilScreen() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<'avatar' | 'logout' | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);

  useEffect(() => {
    void chargerProfil();
  }, []);

  const afficherFeedback = (
    type: 'error' | 'success',
    message: string
  ) => {
    setFeedback({ type, message });
  };

  const chargerProfil = async () => {
    setLoading(true);

    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();

      if (!currentUser) {
        router.replace('/(auth)/login');
        return;
      }

      setUser(currentUser);

      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle();

      if (error) {
        console.error('Erreur chargement profil:', error);
      }

      const typedProfile = (profileData as UserProfile | null) ?? null;
      setProfile(typedProfile);

      const avatarFromStorage =
        Platform.OS === 'web' && typeof window !== 'undefined'
          ? window.localStorage.getItem(getAvatarStorageKey(currentUser.id))
          : null;

      setAvatarUri(
        avatarFromStorage
          ?? typedProfile?.avatar_url
          ?? currentUser.user_metadata?.avatar_url
          ?? null
      );
    } finally {
      setLoading(false);
    }
  };

  const choisirPhoto = async () => {
    if (!user) return;

    if (Platform.OS !== 'web' || typeof document === 'undefined') {
      afficherFeedback(
        'error',
        'Ajout de photo disponible sur web pour le moment.'
      );
      return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.onchange = () => {
      const file = input.files?.[0];

      if (!file) return;
      if (file.size > 2_000_000) {
        afficherFeedback('error', 'Choisissez une image inférieure à 2 Mo.');
        return;
      }

      setActionLoading('avatar');

      const reader = new FileReader();

      reader.onload = () => {
        const result = reader.result;

        if (typeof result !== 'string') {
          setActionLoading(null);
          afficherFeedback('error', 'Impossible de lire cette image.');
          return;
        }

        window.localStorage.setItem(getAvatarStorageKey(user.id), result);
        setAvatarUri(result);
        setActionLoading(null);
        afficherFeedback('success', 'Photo de profil mise à jour.');
      };

      reader.onerror = () => {
        setActionLoading(null);
        afficherFeedback('error', 'Échec de chargement de l’image.');
      };

      reader.readAsDataURL(file);
    };

    input.click();
  };

  const retirerPhoto = () => {
    if (!user) return;

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.localStorage.removeItem(getAvatarStorageKey(user.id));
    }

    setAvatarUri(null);
    afficherFeedback('success', 'Photo de profil supprimée.');
  };

  const executerDeconnexion = async () => {
    setActionLoading('logout');

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.replace('/acceuil');
    } catch (err) {
      afficherFeedback(
        'error',
        err instanceof Error ? err.message : 'Erreur pendant la déconnexion.'
      );
    } finally {
      setActionLoading(null);
    }
  };

  const seDeconnecter = async () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const confirme = window.confirm(
        'Voulez-vous vraiment vous déconnecter ?'
      );

      if (confirme) {
        await executerDeconnexion();
      }
      return;
    }

    Alert.alert(
      'Déconnexion',
      'Voulez-vous vraiment vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnecter',
          style: 'destructive',
          onPress: () => {
            void executerDeconnexion();
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loaderScreen}>
        <ActivityIndicator size="large" color="#2f80ff" />
      </View>
    );
  }

  const fullName = [profile?.prenom, profile?.nom]
    .filter(Boolean)
    .join(' ')
    || user?.email?.split('@')[0]
    || 'Utilisateur';

  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part: string) => part.charAt(0).toUpperCase())
    .join('');

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <View style={styles.heroGlow} />
        <Text style={styles.heroEyebrow}>Mon profil</Text>
        <Text style={styles.heroTitle}>{fullName}</Text>
        <Text style={styles.heroSubtitle}>{user?.email}</Text>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatarRow}>
          <View style={styles.avatarShell}>
            {avatarUri ? (
              <Image
                source={{ uri: avatarUri }}
                style={styles.avatarImage}
                contentFit="cover"
              />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarFallbackText}>{initials || 'U'}</Text>
              </View>
            )}
          </View>

          <View style={styles.avatarInfo}>
            <Text style={styles.profileName}>{fullName}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
            <Text style={styles.profileHint}>
              Personnalisez votre compte avec une photo de profil.
            </Text>
          </View>
        </View>

        {feedback && (
          <View style={[
            styles.feedbackBox,
            feedback.type === 'error'
              ? styles.feedbackError
              : styles.feedbackSuccess
          ]}>
            <Text style={[
              styles.feedbackText,
              feedback.type === 'error'
                ? styles.feedbackErrorText
                : styles.feedbackSuccessText
            ]}>
              {feedback.message}
            </Text>
          </View>
        )}

        <View style={styles.avatarActionRow}>
          <TouchableOpacity
            style={styles.primaryButton}
            disabled={actionLoading === 'avatar'}
            onPress={() => void choisirPhoto()}>
            <Text style={styles.primaryButtonText}>
              {actionLoading === 'avatar'
                ? 'Chargement...'
                : 'Ajouter une photo'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            disabled={!avatarUri}
            onPress={retirerPhoto}>
            <Text style={[
              styles.secondaryButtonText,
              !avatarUri && styles.secondaryButtonTextDisabled
            ]}>
              Retirer
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.quickStatsRow}>
        <View style={styles.quickStatCard}>
          <Text style={styles.quickStatLabel}>Statut</Text>
          <Text style={styles.quickStatValue}>
            {user?.email_confirmed_at ? 'Vérifié' : 'Non vérifié'}
          </Text>
        </View>

        <View style={styles.quickStatCard}>
          <Text style={styles.quickStatLabel}>Membre depuis</Text>
          <Text style={styles.quickStatValue}>
            {new Date(user?.created_at).toLocaleDateString('fr-TN')}
          </Text>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Informations</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Nom</Text>
          <Text style={styles.infoValue}>{profile?.nom ?? 'Non renseigné'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Prénom</Text>
          <Text style={styles.infoValue}>{profile?.prenom ?? 'Non renseigné'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoValue}>{user?.email}</Text>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Mon activité</Text>

        <TouchableOpacity
          style={styles.activityCard}
          onPress={() => router.push('/reservation')}>
          <Text style={styles.activityTitle}>Mes réservations</Text>
          <Text style={styles.activityText}>
            Consultez et gérez vos réservations en cours.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.activityCard}
          onPress={() => router.push('/trajets')}>
          <Text style={styles.activityTitle}>Mes trajets</Text>
          <Text style={styles.activityText}>
            Parcourez les trajets disponibles et vos publications.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.activityCard}
          onPress={() => router.push('/notifications')}>
          <Text style={styles.activityTitle}>Notifications</Text>
          <Text style={styles.activityText}>
            Suivez vos réponses, demandes et mises à jour.
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        disabled={actionLoading === 'logout'}
        onPress={() => void seDeconnecter()}>
        <Text style={styles.logoutButtonText}>
          {actionLoading === 'logout'
            ? 'Déconnexion...'
            : 'Se déconnecter'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f3f6fb'
  },
  content: {
    padding: 18,
    paddingBottom: 120
  },
  loaderScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f6fb'
  },
  heroCard: {
    backgroundColor: '#195f68',
    borderRadius: 28,
    padding: 24,
    overflow: 'hidden',
    marginBottom: 18
  },
  heroGlow: {
    position: 'absolute',
    top: -36,
    right: -20,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.12)'
  },
  heroEyebrow: {
    color: '#d9efef',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.9,
    textTransform: 'uppercase',
    marginBottom: 10
  },
  heroTitle: {
    color: '#ffffff',
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
    marginBottom: 8
  },
  heroSubtitle: {
    color: '#d7e7e8',
    fontSize: 15
  },
  profileCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#e6edf5',
    shadowColor: '#203454',
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 18
  },
  avatarShell: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: '#eaf1ff',
    padding: 4
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 48
  },
  avatarFallback: {
    flex: 1,
    borderRadius: 48,
    backgroundColor: '#2f80ff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarFallbackText: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '800'
  },
  avatarInfo: {
    flex: 1
  },
  profileName: {
    color: '#1f2430',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4
  },
  profileEmail: {
    color: '#5e6b7f',
    fontSize: 14,
    marginBottom: 8
  },
  profileHint: {
    color: '#748296',
    fontSize: 13,
    lineHeight: 20
  },
  feedbackBox: {
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16
  },
  feedbackError: {
    backgroundColor: '#fff0ec',
    borderWidth: 1,
    borderColor: '#f6c9bc'
  },
  feedbackSuccess: {
    backgroundColor: '#ebfaf2',
    borderWidth: 1,
    borderColor: '#b5e7ca'
  },
  feedbackText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600'
  },
  feedbackErrorText: {
    color: '#b2452a'
  },
  feedbackSuccessText: {
    color: '#1f7c4f'
  },
  avatarActionRow: {
    flexDirection: 'row',
    gap: 12
  },
  primaryButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: '#2f80ff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800'
  },
  secondaryButton: {
    minWidth: 110,
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: '#edf4ff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16
  },
  secondaryButtonText: {
    color: '#2f80ff',
    fontSize: 14,
    fontWeight: '800'
  },
  secondaryButtonTextDisabled: {
    color: '#9bb3de'
  },
  quickStatsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18
  },
  quickStatCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e6edf5'
  },
  quickStatLabel: {
    color: '#728197',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: 8
  },
  quickStatValue: {
    color: '#1f2430',
    fontSize: 16,
    fontWeight: '800'
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#e6edf5'
  },
  sectionTitle: {
    color: '#1f2430',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 14
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#eef2f7'
  },
  infoLabel: {
    color: '#69778d',
    fontSize: 14
  },
  infoValue: {
    color: '#1f2430',
    fontSize: 14,
    fontWeight: '700'
  },
  activityCard: {
    borderRadius: 18,
    padding: 16,
    backgroundColor: '#f8fbff',
    borderWidth: 1,
    borderColor: '#e4edf7',
    marginBottom: 12
  },
  activityTitle: {
    color: '#1f2430',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6
  },
  activityText: {
    color: '#6f7e95',
    fontSize: 14,
    lineHeight: 22
  },
  logoutButton: {
    minHeight: 54,
    borderRadius: 16,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10
  },
  logoutButtonText: {
    color: '#dc2626',
    fontSize: 15,
    fontWeight: '800'
  }
});
