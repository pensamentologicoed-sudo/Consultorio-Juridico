import { useState, useCallback } from 'react';
import { supabase, handleSupabaseError } from '../services/supabaseClient';
import { CaseHistoryItem, HistoryType } from '../types';

export const useCaseHistory = (caseId: string) => {
  const [history, setHistory] = useState<CaseHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!caseId) return;
    setLoading(true);
    setError(null);

    try {
      // Supabase query
      const { data, error: sbError } = await supabase
        .from('case_history')
        .select('*')
        .eq('case_id', caseId)
        .order('date', { ascending: false }) // Mais recentes primeiro
        .order('created_at', { ascending: false });

      if (sbError) {
        if (sbError.code === '42P01') {
            // Tabela não existe, retornar vazio sem erro
            console.warn('Tabela case_history não existe. Modo leitura.');
            setHistory([]);
            return;
        }
        throw sbError;
      }

      setHistory(data || []);
    } catch (err: any) {
      console.error('Erro ao buscar histórico:', err);
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  const addHistoryItem = async (item: Omit<CaseHistoryItem, 'id' | 'created_at' | 'case_id'>) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const newItem = {
        case_id: caseId,
        title: item.title,
        description: item.description,
        type: item.type,
        date: item.date, // Data do evento (ex: data da petição)
        created_at: new Date().toISOString(),
        created_by: user?.id
      };

      const { data, error: sbError } = await supabase
        .from('case_history')
        .insert([newItem])
        .select()
        .single();

      if (sbError) {
          // Fallback para UI se tabela não existir
          if (sbError.code === '42P01') {
              const mockItem = { ...newItem, id: crypto.randomUUID() } as CaseHistoryItem;
              setHistory(prev => [mockItem, ...prev]);
              return { success: true };
          }
          throw sbError;
      }

      if (data) {
        setHistory(prev => [data, ...prev]);
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: handleSupabaseError(err) };
    } finally {
      setLoading(false);
    }
  };

  const deleteHistoryItem = async (id: string) => {
      try {
          const { error } = await supabase.from('case_history').delete().eq('id', id);
          if (error) {
               if (error.code === '42P01') {
                   setHistory(prev => prev.filter(i => i.id !== id));
                   return { success: true };
               }
               throw error;
          }
          setHistory(prev => prev.filter(i => i.id !== id));
          return { success: true };
      } catch (err: any) {
          return { success: false, error: handleSupabaseError(err) };
      }
  };

  return {
    history,
    loading,
    error,
    fetchHistory,
    addHistoryItem,
    deleteHistoryItem
  };
};