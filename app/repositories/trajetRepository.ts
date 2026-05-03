import { Trajet, CreerTrajetDTO } from '../models/Trajet';
import { supabase } from '@/lib/supabase';

export const trajetRepository = {

  async ajouterTrajet(data: CreerTrajetDTO): Promise<{ error: any }> {
    const { error } = await supabase.from('trajets').insert([data]);
    return { error };
  },

  async getTrajets(): Promise<{ data: Trajet[] | null, error: any }> {
    const { data, error } = await supabase
      .from('trajets')
      .select('*')
      .order('date_depart');
    return { data, error };
  },
};