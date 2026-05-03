// models/Trajet.ts

export interface Trajet {
  id: string;
  user_id: string;
  depart: string;
  arrivee: string;
  date_depart: string;
  places_dispo: number;
  prix: number;
  description?: string;
  created_at: string;
}

export interface CreerTrajetDTO {
  user_id: string;
  depart: string;
  arrivee: string;
  date_depart: string;
  places_dispo: number;
  prix: number;
  description?: string;
}

export interface ModifierTrajetDTO {
  depart?: string;
  arrivee?: string;
  date_depart?: string;
  places_dispo?: number;
  prix?: number;
  description?: string;
}