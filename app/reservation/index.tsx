import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert, ScrollView,
    StyleSheet,
    Text, TextInput, TouchableOpacity,
    View
} from 'react-native';
import { supabase } from '../../lib/supabase';

export default function ReservationScreen({ route, navigation }: { route: any; navigation: NativeStackNavigationProp<any> }) {
  const { trajet } = route.params;

  const [nom, setNom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [nbPlaces, setNbPlaces] = useState('1');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const validerFormulaire = () => {
    if (!nom.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer votre nom.');
      return false;
    }
    if (!telephone.trim() || telephone.length < 8) {
      Alert.alert('Erreur', 'Veuillez entrer un numéro valide.');
      return false;
    }
    const nb = parseInt(nbPlaces);
    if (isNaN(nb) || nb < 1) {
      Alert.alert('Erreur', 'Nombre de places invalide.');
      return false;
    }
    if (nb > trajet.places_dispo) {
      Alert.alert(
        'Erreur',
        `Il reste seulement ${trajet.places_dispo} place(s) disponible(s).`
      );
      return false;
    }
    return true;
  };

  const envoyerReservation = async () => {
    if (!validerFormulaire()) return;
    setLoading(true);

    try {
      // 1. Récupérer l'utilisateur connecté (passager)
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        Alert.alert('Erreur', 'Vous devez être connecté pour réserver.');
        return;
      }

      // 2. Vérifier si déjà réservé
      const { data: dejaReserve } = await supabase
        .from('reservations')
        .select('id')
        .eq('trajet_id', trajet.id)
        .eq('passager_id', user.id)
        .maybeSingle();

      if (dejaReserve) {
        Alert.alert('Déjà réservé', 'Vous avez déjà réservé ce trajet.');
        return;
      }

      // 3. Créer la réservation
      const { error: errReservation } = await supabase
        .from('reservations')
        .insert({
          trajet_id: trajet.id,
          passager_id: user.id,
          nom_passager: nom,
          telephone: telephone,
          nb_places: parseInt(nbPlaces),
          message: message,
          statut: 'en_attente'
        });

      if (errReservation) throw errReservation;

      // 4. Décrémenter les places disponibles
      const { error: errMaj } = await supabase
        .from('trajets')
        .update({ places_dispo: trajet.places_dispo - parseInt(nbPlaces) })
        .eq('id', trajet.id);

      if (errMaj) throw errMaj;

      // 5. Envoyer une notification au conducteur
      const { error: errNotif } = await supabase
        .from('notifications')
        .insert({
          destinataire_id: trajet.conducteur_id,
          titre: 'Nouvelle demande de réservation',
          corps: `${nom} veut réserver ${nbPlaces} place(s) sur votre trajet ${trajet.depart} → ${trajet.arrivee}.`,
          trajet_id: trajet.id,
          lu: false
        });

      if (errNotif) throw errNotif;

      // 6. Succès
      Alert.alert(
        'Demande envoyée !',
        'Le conducteur a été notifié. Vous recevrez une confirmation bientôt.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );

    } catch (err) {
      Alert.alert('Erreur', err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">

      {/* Résumé du trajet */}
      <View style={styles.trajetCard}>
        <Text style={styles.trajetTitre}>
          {trajet.depart} → {trajet.arrivee}
        </Text>
        <Text style={styles.trajetInfo}>Date : {trajet.date_heure}</Text>
        <Text style={styles.trajetInfo}>
          Places disponibles : {trajet.places_dispo}
        </Text>
        <Text style={styles.trajetInfo}>Prix : {trajet.prix} DT / place</Text>
      </View>

      {/* Formulaire */}
      <Text style={styles.sectionTitre}>Vos informations</Text>

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

      {/* Prix total */}
      <View style={styles.prixContainer}>
        <Text style={styles.prixLabel}>Total à payer :</Text>
        <Text style={styles.prixValeur}>
          {(parseInt(nbPlaces) || 0) * trajet.prix} DT
        </Text>
      </View>

      {/* Bouton envoyer */}
      <TouchableOpacity
        style={[styles.btn, loading && styles.btnDisabled]}
        onPress={envoyerReservation}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.btnText}>Envoyer la demande</Text>
        }
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.btnAnnuler}
        onPress={() => navigation.goBack()}
        disabled={loading}
      >
        <Text style={styles.btnAnnulerText}>Annuler</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16
  },
  trajetCard: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20
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
  btn: {
    backgroundColor: '#4F46E5',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10
  },
  btnDisabled: {
    backgroundColor: '#a5b4fc'
  },
  btnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16
  },
  btnAnnuler: {
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 0.5,
    borderColor: '#ddd',
    backgroundColor: '#fff'
  },
  btnAnnulerText: {
    color: '#666',
    fontSize: 15
  }
});