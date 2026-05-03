// repositories/NotificationRepository.ts
import { supabase } from '@/lib/supabase';
import { Notification, CreerNotificationDTO } from '../models/Notification';

export const NotificationRepository = {

  async creer(dto: CreerNotificationDTO): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .insert(dto);
    if (error) throw error;
  },

  async fetchParDestinataire(destinataireId: string): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*, trajets(*), reservations(*)')
      .eq('destinataire_id', destinataireId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as Notification[];
  },

  async marquerLue(id: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ lu: true })
      .eq('id', id);
    if (error) throw error;
  },

  async compterNonLues(destinataireId: string): Promise<number> {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('destinataire_id', destinataireId)
      .eq('lu', false);
    if (error) throw error;
    return count ?? 0;
  }
};