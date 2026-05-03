// controllers/NotificationController.ts
import { supabase } from '../../lib/supabase';
import { Notification } from '../models/Notification';
import { NotificationRepository } from '../repositories/NotificationRepository';
import { ReservationRepository } from '../repositories/ReservationRepository';
import { TrajetRepository } from '../repositories/trajetRepository';

export const NotificationController = {

  async fetchNotifications(): Promise<Notification[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Non connecté');
    return NotificationRepository.fetchParDestinataire(user.id);
  },

  async accepterReservation(notif: Notification): Promise<void> {
    // 1. Statut → confirmée
    await ReservationRepository.mettreAJourStatut(
      notif.trajet_id, 'confirmée'
    );

    // 2. Notifier le passager
    await NotificationRepository.creer({
      destinataire_id: notif.reservations?.passager_id ?? '',
      titre: '✓ Réservation confirmée !',
      corps: `Votre réservation pour ${notif.trajets?.depart} → ${notif.trajets?.arrivee} est confirmée !`,
      trajet_id: notif.trajet_id,
      lu: false
    });

    // 3. Marquer notif conducteur comme lue
    await NotificationRepository.marquerLue(notif.id ?? '');
  },

  async refuserReservation(notif: Notification): Promise<void> {
    // 1. Statut → refusée
    await ReservationRepository.mettreAJourStatut(
      notif.trajet_id, 'refusée'
    );

    // 2. Restaurer les places
    const nbPlaces = notif.reservations?.nb_places ?? 0;
    if (nbPlaces > 0) {
      await TrajetRepository.restaurerPlaces(
        notif.trajet_id, nbPlaces
      );
    }

    // 3. Notifier le passager
    await NotificationRepository.creer({
      destinataire_id: notif.reservations?.passager_id ?? '',
      titre: '✗ Réservation refusée',
      corps: `Votre réservation pour ${notif.trajets?.depart} → ${notif.trajets?.arrivee} a été refusée.`,
      trajet_id: notif.trajet_id,
      lu: false
    });

    // 4. Marquer notif conducteur comme lue
    await NotificationRepository.marquerLue(notif.id ?? '');
  }
};