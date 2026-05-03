// repositories/ReservationRepository.ts
import { supabase } from '@/lib/supabase';
import { Reservation, CreerReservationDTO } from '../models/Resrvation';

export const ReservationRepository = {

  async existeDeja(trajetId: string, passagerId: string): Promise<boolean> {
    const { data } = await supabase
      .from('reservations')
      .select('id')
      .eq('trajet_id', trajetId)
      .eq('passager_id', passagerId)
      .maybeSingle();
    return !!data;
  },

  async creer(dto: CreerReservationDTO): Promise<void> {
    const { error } = await supabase
      .from('reservations')
      .insert({ ...dto, statut: 'en_attente' });
    if (error) throw error;
  },

  async supprimer(id: string, passagerId: string): Promise<void> {
    const { data, error } = await supabase
      .from('reservations')
      .delete()
      .eq('id', id)
      .eq('passager_id', passagerId)
      .select('id')
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Réservation introuvable ou déjà annulée.');
  },

  async mettreAJourStatut(
    trajetId: string,
    statut: 'confirmée' | 'refusée'
  ): Promise<void> {
    const { error } = await supabase
      .from('reservations')
      .update({ statut })
      .eq('trajet_id', trajetId)
      .eq('statut', 'en_attente');
    if (error) throw error;
  },

  async fetchParPassager(passagerId: string): Promise<Reservation[]> {
    const { data, error } = await supabase
      .from('reservations')
      .select('*, trajets(*)')
      .eq('passager_id', passagerId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as Reservation[];
  }
};
