
import { useState, useCallback } from 'react';
import { supabase, handleSupabaseError } from '../services/supabaseClient';

export interface AgendaEvent {
  id: string | number;
  title: string;
  time: string;
  date: string; // YYYY-MM-DD para a interface
  client: string;
  type: 'hearing' | 'meeting' | 'deadline' | 'conference' | 'call';
  location: string;
  created_at?: string;
  user_id?: string;
}

export const useAgenda = () => {
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: sbError } = await supabase
        .from('agenda_events')
        .select('*');

      if (sbError) {
         if (sbError.code === '42P01') {
             setError('tabela_missing');
             return;
         }
         throw sbError;
      }

      // MAPEAMENTO: Traduz campos do Banco (event_date) para a Interface (date)
      const mappedData = (data || []).map(item => {
          const rawDate = item.event_date || item.date;
          const dateObj = rawDate ? new Date(rawDate) : new Date();
          
          return {
              id: item.id,
              title: item.title,
              // Formata para YYYY-MM-DD para o calendário
              date: dateObj.toISOString().split('T')[0],
              // Extrai o tempo HH:MM
              time: item.time || dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
              client: item.client || 'N/A',
              type: item.event_type || item.type || 'meeting',
              location: item.location || '',
              created_at: item.created_at
          };
      });

      const sortedData = mappedData.sort((a, b) => a.date.localeCompare(b.date));
      setEvents(sortedData);
    } catch (err: any) {
      console.error('Erro ao buscar agenda:', err);
      setError(handleSupabaseError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const addEvent = async (event: Omit<AgendaEvent, 'id'>) => {
    setLoading(true);
    try {
      const { data: { user } } = await (supabase.auth as any).getUser();
      
      // Salva usando os nomes de coluna do banco (event_date, event_type)
      const newEventPayload = {
        title: event.title,
        event_date: `${event.date}T${event.time || '00:00'}:00Z`,
        event_type: event.type,
        location: event.location,
        client_id: null, // Pode ser expandido futuramente
        created_by: user?.id,
        created_at: new Date().toISOString()
      };

      const { error: sbError } = await supabase
        .from('agenda_events')
        .insert([newEventPayload]);

      if (sbError) throw sbError;

      await fetchEvents();
      return { success: true };
    } catch (err: any) {
      console.error('Erro ao salvar evento:', err);
      return { success: false, error: handleSupabaseError(err) };
    } finally {
      setLoading(false);
    }
  };

  return {
    events,
    loading,
    error,
    fetchEvents,
    addEvent,
    setEvents
  };
};
