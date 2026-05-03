// app/reservation/index.tsx
import { ReservationController } from '../controllers/ReservationController';
import { Reservation } from '../models/Resrvation';
import { Trajet } from '../models/Trajet';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

type Feedback = {
  type: 'error' | 'success';
  message: string;
};

function parseTrajetParam(
  trajetParam: string | string[] | undefined
): Trajet | null {
  if (typeof trajetParam !== 'string') return null;

  try {
    return JSON.parse(trajetParam) as Trajet;
  } catch {
    return null;
  }
}

function formatStatut(statut: Reservation['statut']): string {
  switch (statut) {
    case 'confirmée':
      return 'Confirmée';
    case 'refusée':
      return 'Refusée';
    default:
      return 'En attente';
  }
}

function FeedbackBanner({ feedback }: { feedback: Feedback }) {
  return (
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
  );
}

export default function ReservationScreen() {
  const { trajet: trajetParam } = useLocalSearchParams();
  const hasTrajetParam = typeof trajetParam === 'string';
  const trajet = parseTrajetParam(trajetParam);

  const [nom, setNom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [nbPlaces, setNbPlaces] = useState('1');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loadingReservations, setLoadingReservations] = useState(false);
  const [reservationActionId, setReservationActionId] = useState<
    string | null
  >(null);

  const afficherFeedback = (
    type: Feedback['type'],
    messageTexte: string
  ) => {
    setFeedback({ type, message: messageTexte });

    if (Platform.OS !== 'web') {
      const titre = type === 'error' ? 'Erreur' : 'Succès';
      Alert.alert(titre, messageTexte);
    }
  };

  const chargerReservations = async () => {
    setLoadingReservations(true);

    try {
      const data = await ReservationController.fetchMesReservations();
      setReservations(data);
    } catch (err) {
      afficherFeedback(
        'error',
        err instanceof Error ? err.message : 'Erreur inattendue'
      );
    } finally {
      setLoadingReservations(false);
    }
  };

  useEffect(() => {
    if (!hasTrajetParam) {
      void chargerReservations();
    }
  }, [hasTrajetParam]);

  const handleEnvoyer = async () => {
    if (!trajet) return;

    setFeedback(null);

    const erreur = ReservationController.validerFormulaire(
      nom, telephone, nbPlaces, trajet.places_dispo
    );
    if (erreur) {
      afficherFeedback('error', erreur);
      return;
    }

    setLoading(true);
    try {
      const resultat = await ReservationController.envoyerReservation(
        trajet, nom, telephone, nbPlaces, message
      );

      const messageSucces = resultat.notificationEnvoyee
        ? 'Demande envoyée avec succès !'
        : 'Réservation envoyée, mais la notification du conducteur a échoué.';

      afficherFeedback('success', messageSucces);

      router.replace({
        pathname: '/trajets',
        params: { toast: messageSucces }
      });
    } catch (err) {
      console.error('Erreur envoi reservation:', err);
      afficherFeedback(
        'error',
        err instanceof Error ? err.message : 'Erreur inattendue'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAnnulerReservation = async (reservation: Reservation) => {
    if (!reservation.id) {
      afficherFeedback('error', 'Réservation introuvable.');
      return;
    }

    setFeedback(null);
    setReservationActionId(reservation.id);

    try {
      const resultat = await ReservationController.annulerReservation(
        reservation
      );

      setReservations((current) =>
        current.filter((item) => item.id !== reservation.id)
      );

      const messageSucces = resultat.notificationEnvoyee
        ? 'Réservation annulée avec succès.'
        : 'Réservation annulée, mais la notification du conducteur a échoué.';

      afficherFeedback('success', messageSucces);
    } catch (err) {
      console.error('Erreur annulation reservation:', err);
      afficherFeedback(
        'error',
        err instanceof Error ? err.message : 'Erreur inattendue'
      );
    } finally {
      setReservationActionId(null);
    }
  };

  if (hasTrajetParam && !trajet) {
    return (
      <View style={styles.emptyContainer}>
        <Stack.Screen options={{ title: 'Réserver une place' }} />
        <Text style={styles.emptyTitle}>Trajet introuvable</Text>
        <Text style={styles.emptyText}>
          Ouvrez cette page depuis un trajet disponible pour envoyer
          une réservation.
        </Text>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.replace('/trajets')}>
          <Text style={styles.primaryButtonText}>Voir les trajets</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!hasTrajetParam) {
    return (
      <View style={styles.listScreen}>
        <Stack.Screen options={{ title: 'Mes réservations' }} />

        {feedback && <FeedbackBanner feedback={feedback} />}

        {loadingReservations ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#4F46E5" />
          </View>
        ) : (
          <FlatList
            data={reservations}
            keyExtractor={(item) =>
              item.id ?? `${item.trajet_id}-${item.created_at ?? ''}`
            }
            contentContainerStyle={[
              styles.listContent,
              reservations.length === 0 && styles.listContentEmpty
            ]}
            renderItem={({ item }) => {
              const annulationEnCours = reservationActionId === item.id;
              const peutAnnuler = item.statut !== 'refusée';

              return (
                <View style={styles.reservationCard}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.reservationTitle}>
                      {item.trajets
                        ? `${item.trajets.depart} → ${item.trajets.arrivee}`
                        : 'Trajet indisponible'}
                    </Text>
                    <View style={[
                      styles.statusBadge,
                      item.statut === 'confirmée'
                        ? styles.statusConfirmed
                        : item.statut === 'refusée'
                          ? styles.statusRefused
                          : styles.statusPending
                    ]}>
                      <Text style={[
                        styles.statusText,
                        item.statut === 'confirmée'
                          ? styles.statusConfirmedText
                          : item.statut === 'refusée'
                            ? styles.statusRefusedText
                            : styles.statusPendingText
                      ]}>
                        {formatStatut(item.statut)}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.reservationInfo}>
                    Date : {item.trajets?.date_depart ?? 'Non disponible'}
                  </Text>
                  <Text style={styles.reservationInfo}>
                    Places réservées : {item.nb_places}
                  </Text>
                  <Text style={styles.reservationInfo}>
                    Prix total : {(item.trajets?.prix ?? 0) * item.nb_places} DT
                  </Text>

                  {item.message ? (
                    <Text style={styles.reservationMessage}>
                      Message : {item.message}
                    </Text>
                  ) : null}

                  {peutAnnuler ? (
                    <TouchableOpacity
                      style={[
                        styles.cancelButton,
                        annulationEnCours && styles.cancelButtonDisabled
                      ]}
                      disabled={annulationEnCours}
                      onPress={() => handleAnnulerReservation(item)}>
                      {annulationEnCours ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text style={styles.cancelButtonText}>
                          Annuler la réservation
                        </Text>
                      )}
                    </TouchableOpacity>
                  ) : (
                    <Text style={styles.infoHint}>
                      Cette réservation ne peut plus être annulée.
                    </Text>
                  )}
                </View>
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>Aucune réservation</Text>
                <Text style={styles.emptyText}>
                  Vos réservations apparaîtront ici.
                </Text>

                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={() => router.push('/trajets')}>
                  <Text style={styles.primaryButtonText}>
                    Voir les trajets
                  </Text>
                </TouchableOpacity>
              </View>
            }
          />
        )}
      </View>
    );
  }

  if (!trajet) return null;

  return (
    <ScrollView style={styles.formContainer}
      keyboardShouldPersistTaps="handled">
      <Stack.Screen options={{ title: 'Réserver une place' }} />

      <View style={styles.trajetCard}>
        <Text style={styles.trajetTitre}>
          {trajet.depart} → {trajet.arrivee}
        </Text>
        <Text style={styles.trajetInfo}>
          Date : {trajet.date_depart}
        </Text>
        <Text style={styles.trajetInfo}>
          Places disponibles : {trajet.places_dispo}
        </Text>
        <Text style={styles.trajetInfo}>
          Prix : {trajet.prix} DT / place
        </Text>
      </View>

      <Text style={styles.sectionTitre}>Vos informations</Text>

      {feedback && <FeedbackBanner feedback={feedback} />}

      <Text style={styles.label}>Nom complet *</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex : Ahmed Ben Ali"
        value={nom}
        onChangeText={setNom}
      />

      <Text style={styles.label}>Numéro de téléphone *</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex : 55 123 456"
        value={telephone}
        onChangeText={setTelephone}
        keyboardType="phone-pad"
        maxLength={12}
      />

      <Text style={styles.label}>Nombre de places *</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex : 1"
        value={nbPlaces}
        onChangeText={setNbPlaces}
        keyboardType="numeric"
        maxLength={1}
      />

      <Text style={styles.label}>Message au conducteur (optionnel)</Text>
      <TextInput
        style={[styles.input, styles.inputMultiline]}
        placeholder="Ex : Je serai devant la bibliothèque..."
        value={message}
        onChangeText={setMessage}
        multiline
        numberOfLines={3}
      />

      <View style={styles.prixContainer}>
        <Text style={styles.prixLabel}>Total à payer :</Text>
        <Text style={styles.prixValeur}>
          {(parseInt(nbPlaces) || 0) * trajet.prix} DT
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
        onPress={handleEnvoyer}
        disabled={loading}>
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.primaryButtonText}>Envoyer la demande</Text>}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => router.back()}
        disabled={loading}>
        <Text style={styles.secondaryButtonText}>Annuler</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16
  },
  listScreen: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16
  },
  listContent: {
    paddingBottom: 24,
    gap: 12
  },
  listContentEmpty: {
    flexGrow: 1
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e1e1e',
    marginBottom: 10,
    textAlign: 'center'
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20
  },
  feedbackBox: {
    borderRadius: 10,
    padding: 12,
    marginBottom: 14
  },
  feedbackError: {
    backgroundColor: '#FEE2E2',
    borderWidth: 0.5,
    borderColor: '#FCA5A5'
  },
  feedbackSuccess: {
    backgroundColor: '#DCFCE7',
    borderWidth: 0.5,
    borderColor: '#86EFAC'
  },
  feedbackText: {
    fontSize: 14,
    fontWeight: '500'
  },
  feedbackErrorText: {
    color: '#B91C1C'
  },
  feedbackSuccessText: {
    color: '#166534'
  },
  trajetCard: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    marginTop: 20
  },
  trajetTitre: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8
  },
  trajetInfo: {
    color: '#E0E7FF',
    fontSize: 13,
    marginBottom: 4
  },
  sectionTitre: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e1e1e',
    marginBottom: 12
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: '#444',
    marginBottom: 4
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: '#ddd',
    padding: 12,
    fontSize: 14,
    marginBottom: 14,
    color: '#1e1e1e'
  },
  inputMultiline: {
    height: 80,
    textAlignVertical: 'top'
  },
  prixContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    borderRadius: 10,
    padding: 14,
    marginBottom: 20
  },
  prixLabel: {
    fontSize: 15,
    color: '#4F46E5',
    fontWeight: '500'
  },
  prixValeur: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4F46E5'
  },
  primaryButton: {
    backgroundColor: '#4F46E5',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10
  },
  primaryButtonDisabled: {
    backgroundColor: '#a5b4fc'
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16
  },
  secondaryButton: {
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 0.5,
    borderColor: '#ddd',
    backgroundColor: '#fff'
  },
  secondaryButtonText: {
    color: '#666',
    fontSize: 15
  },
  reservationCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 0.5,
    borderColor: '#e5e7eb'
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 10
  },
  reservationTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: '#1e1e1e'
  },
  reservationInfo: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 6
  },
  reservationMessage: {
    fontSize: 14,
    color: '#374151',
    marginTop: 4,
    marginBottom: 12
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999
  },
  statusPending: {
    backgroundColor: '#FEF3C7'
  },
  statusConfirmed: {
    backgroundColor: '#DCFCE7'
  },
  statusRefused: {
    backgroundColor: '#FEE2E2'
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700'
  },
  statusPendingText: {
    color: '#92400E'
  },
  statusConfirmedText: {
    color: '#166534'
  },
  statusRefusedText: {
    color: '#B91C1C'
  },
  cancelButton: {
    backgroundColor: '#DC2626',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8
  },
  cancelButtonDisabled: {
    backgroundColor: '#fca5a5'
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700'
  },
  infoHint: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 10
  }
});
