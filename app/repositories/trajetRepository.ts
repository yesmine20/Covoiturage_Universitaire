// repositories/TrajetRepository.ts
import { supabase } from '@/lib/supabase';
import { Trajet } from '../models/Trajet';

export const TrajetRepository = {

  async fetchTous(): Promise<Trajet[]> {
    const { data, error } = await supabase
      .from('trajets')
      .select('*')
      .order('date_depart', { ascending: true });
    if (error) throw error;
    return data ?? [];
  },

  async fetchParId(id: string): Promise<Trajet | null> {
    const { data, error } = await supabase
      .from('trajets')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async decrementerPlaces(
    trajetId: string,
    nbPlaces: number
  ): Promise<void> {
    const trajet = await TrajetRepository.fetchParId(trajetId);
    if (!trajet) throw new Error('Trajet introuvable');
    const { error } = await supabase
      .from('trajets')
      .update({ places_dispo: trajet.places_dispo - nbPlaces })
      .eq('id', trajetId);
    if (error) throw error;
  },

  async restaurerPlaces(
    trajetId: string,
    nbPlaces: number
  ): Promise<void> {
    const trajet = await TrajetRepository.fetchParId(trajetId);
    if (!trajet) throw new Error('Trajet introuvable');
    const { error } = await supabase
      .from('trajets')
      .update({ places_dispo: trajet.places_dispo + nbPlaces })
      .eq('id', trajetId);
    if (error) throw error;
  }
};