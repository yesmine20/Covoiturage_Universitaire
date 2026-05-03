import { Trajet } from './Trajet';

// models/Reservation.ts

export interface Reservation {
  id?: string;
  trajet_id: string;
  passager_id: string;
  nom_passager: string;
  telephone: string;
  nb_places: number;
  message?: string;
  statut: 'en_attente' | 'confirmée' | 'refusée';
  created_at?: string;
  trajets?: Trajet;
}

export interface CreerReservationDTO {
  trajet_id: string;
  passager_id: string;
  nom_passager: string;
  telephone: string;
  nb_places: number;
  message?: string;
}
