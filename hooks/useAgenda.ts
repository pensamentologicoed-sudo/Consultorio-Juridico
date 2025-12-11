import { useState, useCallback } from 'react';
import { supabase, handleSupabaseError } from '../services/supabaseClient';

export interface AgendaEvent {
  id: string | number;
  title: string;
  time: string;
  date: string; // YYYY-MM-DD
  client: string;
  type: 'hearing' | 'meeting' | 'deadline' | 'conference' | 'call';
  location: string;
  created_at?: string;
}

export const useAgenda = () => {
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Busca eventos
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      // Tenta buscar do Supabase
      const { data, error: sbError } = await supabase
        .from('agenda_events')
        .select('*')
        .order('date', { ascending: true })
        .order('time', { ascending: true });

      if (sbError) {
         // Se a tabela não existir (código 42P01), ignoramos o erro e retornamos lista vazia
         // para não quebrar a aplicação enquanto a migração não é rodada.
         if (sbError.code === '42P01' || sbError.message.includes('relation "agenda_events" does not exist')) {
             console.warn('Tabela de agenda não encontrada. O sistema funcionará sem persistência de agenda por enquanto.');
             return;
         }
         throw sbError;
      }

      setEvents(data || []);
    } catch (err: any) {
      // Ignora erro de cache de schema se for relacionado à tabela inexistente
      if (err.message && (err.message.includes('schema cache') || err.message.includes('agenda_events'))) {
         return;
      }
      console.error('Erro ao buscar agenda:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const addEvent = async (event: Omit<AgendaEvent, 'id'>) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const newEventPayload = {
        ...event,
        user_id: user?.id,
        created_at: new Date().toISOString()
      };

      const { data, error: sbError } = await supabase
        .from('agenda_events')
        .insert([newEventPayload])
        .select()
        .single();

      if (sbError) {
        // Fallback local se a tabela não existir
        if (sbError.code === '42P01' || sbError.message.includes('agenda_events')) {
            const localEvent = { ...event, id: Date.now() };
            setEvents(prev => [...prev, localEvent]);
            return { success: true, data: localEvent };
        }
        throw sbError;
      }

      if (data) {
        setEvents(prev => [...prev, data]);
      }
      return { success: true, data };
    } catch (err: any) {
      // Fallback local em caso de erro de schema
      if (err.message && (err.message.includes('schema cache') || err.message.includes('agenda_events'))) {
          const localEvent = { ...event, id: Date.now() };
          setEvents(prev => [...prev, localEvent]);
          return { success: true, data: localEvent };
      }
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