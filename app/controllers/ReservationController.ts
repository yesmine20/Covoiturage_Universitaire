// controllers/ReservationController.ts
import { supabase } from '../../lib/supabase';
import { Reservation } from '../models/Resrvation';
import { Trajet } from '../models/Trajet';
import { ReservationRepository } from '../repositories/ReservationRepository';
import { NotificationRepository } from '../repositories/NotificationRepository';
import { TrajetRepository } from '../repositories/trajetRepository';

// ─── Validation numéro tunisien ──────────────────────────────
type TunisianOperator = 'ooredoo' | 'orange' | 'tunisieTelecom';

const OPERATOR_PREFIXES: Record<TunisianOperator, string[]> = {
  ooredoo: ['20','21','22','23','24','25','26','27','28','29','46'],
  orange: ['50','51','52','53','54','55','56','57','58','59'],
  tunisieTelecom: ['40','41','42','44','70','71','72','73','74','75','76','77','78','79','90','91','92','93','94','95','96','97','98','99'],
};

function validateTunisianPhone(phone: string): { valid: boolean; operator?: TunisianOperator; error?: string } {
  if (!phone.trim()) {
    return { valid: false, error: 'Veuillez entrer un numéro de téléphone.' };
  }

  // Nettoyage : espaces, tirets, +216, 216
  let cleaned = phone.replace(/[\s\-]/g, '');
  cleaned = cleaned.replace(/^(\+?216)/, '');

  if (!/^\d+$/.test(cleaned)) {
    return { valid: false, error: 'Le numéro ne doit contenir que des chiffres.' };
  }

  if (cleaned.length !== 8) {
    return { valid: false, error: 'Le numéro doit contenir exactement 8 chiffres.' };
  }

  const prefix = cleaned.substring(0, 2);

  for (const [operator, prefixes] of Object.entries(OPERATOR_PREFIXES)) {
    if (prefixes.includes(prefix)) {
      return { valid: true, operator: operator as TunisianOperator };
    }
  }

  return {
    valid: false,
    error: 'Le numéro doit commencer par un préfixe Orange, Ooredoo ou Tunisie Telecom.',
  };
}
// ──────────────────────────────────────────────────────────────

export interface EnvoyerReservationResultat {
  notificationEnvoyee: boolean;
}

export interface AnnulerReservationResultat {
  notificationEnvoyee: boolean;
}

export const ReservationController = {

  validerFormulaire(
    nom: string,
    telephone: string,
    nbPlaces: string,
    placesDispo: number
  ): string | null {
    if (!nom.trim())
      return 'Veuillez entrer votre nom.';

    // Validation stricte du numéro tunisien
    const phoneValidation = validateTunisianPhone(telephone);
    if (!phoneValidation.valid) {
      return phoneValidation.error ?? 'Numéro de téléphone invalide.';
    }

    const nb = parseInt(nbPlaces);
    if (isNaN(nb) || nb < 1)
      return 'Nombre de places invalide.';
    if (nb > placesDispo)
      return `Il reste seulement ${placesDispo} place(s) disponible(s).`;
    return null;
  },

  async envoyerReservation(
    trajet: Trajet,
    nom: string,
    telephone: string,
    nbPlaces: string,
    message: string
  ): Promise<EnvoyerReservationResultat> {
    // 1. Récupérer l'utilisateur connecté
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Vous devez être connecté.');

    // 2. Vérifier doublon
    const dejaReserve = await ReservationRepository.existeDeja(
      trajet.id, user.id
    );
    if (dejaReserve) throw new Error('Vous avez déjà réservé ce trajet.');

    // 3. Créer la réservation
    await ReservationRepository.creer({
      trajet_id: trajet.id,
      passager_id: user.id,
      nom_passager: nom,
      telephone,
      nb_places: parseInt(nbPlaces),
      message
    });

    // 4. Décrémenter les places
    await TrajetRepository.decrementerPlaces(
      trajet.id, parseInt(nbPlaces)
    );

    // 5. Notifier le conducteur
    try {
      await NotificationRepository.creer({
        destinataire_id: trajet.user_id,
        titre: 'Nouvelle demande de réservation',
        corps: `${nom} veut réserver ${nbPlaces} place(s) sur votre trajet ${trajet.depart} → ${trajet.arrivee}.`,
        trajet_id: trajet.id,
        lu: false
      });

      return { notificationEnvoyee: true };
    } catch (error) {
      console.error('Erreur notification reservation:', error);
      return { notificationEnvoyee: false };
    }
  },

  async fetchMesReservations(): Promise<Reservation[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Vous devez être connecté.');

    return ReservationRepository.fetchParPassager(user.id);
  },

  async annulerReservation(
    reservation: Reservation
  ): Promise<AnnulerReservationResultat> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Vous devez être connecté.');
    if (!reservation.id) throw new Error('Réservation introuvable.');
    if (reservation.passager_id !== user.id) {
      throw new Error('Vous ne pouvez annuler que vos propres réservations.');
    }
    if (reservation.statut === 'refusée') {
      throw new Error('Cette réservation est déjà refusée.');
    }

    const trajet = reservation.trajets
      ?? await TrajetRepository.fetchParId(reservation.trajet_id);

    if (!trajet) throw new Error('Trajet introuvable.');

    await ReservationRepository.supprimer(reservation.id, user.id);
    await TrajetRepository.restaurerPlaces(
      reservation.trajet_id,
      reservation.nb_places
    );

    try {
      await NotificationRepository.creer({
        destinataire_id: trajet.user_id,
        titre: 'Annulation de réservation',
        corps: `${reservation.nom_passager} a annulé sa réservation de ${reservation.nb_places} place(s) sur votre trajet ${trajet.depart} → ${trajet.arrivee}.`,
        trajet_id: reservation.trajet_id,
        lu: false
      });

      return { notificationEnvoyee: true };
    } catch (error) {
      console.error('Erreur notification annulation:', error);
      return { notificationEnvoyee: false };
    }
  }
};