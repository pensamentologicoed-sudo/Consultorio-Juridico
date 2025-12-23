
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
        // Ignora erros de tabela inexistente silenciosamente para não quebrar a UX de detalhes do caso
        if (sbError.code === '42P01' || sbError.code === 'PGRST205') {
            console.warn('Tabela case_history não encontrada no banco de dados.');
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
      // Fix: Casting supabase.auth to any to bypass outdated TypeScript definitions
      const { data: { user } } = await (supabase.auth as any).getUser();

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
          // Fallback para UI se tabela não existir (modo demonstração)
          if (sbError.code === '42P01' || sbError.code === 'PGRST205') {
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
               if (error.code === '42P01' || error.code === 'PGRST205') {
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
