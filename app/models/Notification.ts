// models/Notification.ts
import { Trajet } from './Trajet';
import { Reservation } from './Resrvation';

export interface Notification {
  id?: string;
  destinataire_id: string;
  titre: string;
  corps: string;
  trajet_id: string;
  lu: boolean;
  created_at?: string;
  trajets?: Trajet;
  reservations?: Reservation;
}

export interface CreerNotificationDTO {
  destinataire_id: string;
  titre: string;
  corps: string;
  trajet_id: string;
  lu: boolean;
}
