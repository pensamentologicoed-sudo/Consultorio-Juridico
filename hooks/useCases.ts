
import { useState, useCallback } from 'react';
import { supabase, handleSupabaseError } from '../services/supabaseClient';
import { LegalCase, CaseStatus, CasePriority } from '../types';

const META_MARKER = '\n\n__META_DATA__';

export const useCases = () => {
  const [cases, setCases] = useState<LegalCase[]>([]);
  const [deletedCases, setDeletedCases] = useState<LegalCase[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseCaseData = (data: any): LegalCase => {
    let { description, ...rest } = data;
    let value = null;
    let fee = null;
    let outcome = null;

    if (description && description.includes(META_MARKER)) {
      const parts = description.split(META_MARKER);
      description = parts[0]; 
      try {
        const meta = JSON.parse(parts[1]);
        value = meta.value;
        fee = meta.fee;
        outcome = meta.outcome;
      } catch (e) {
        console.warn('Falha ao parsear metadados do caso');
      }
    }

    return {
      ...rest,
      description,
      value,
      fee,
      outcome
    };
  };

  const prepareCaseData = (data: any) => {
    const meta = { value: data.value, fee: data.fee, outcome: data.outcome };
    const description = data.description || '';
    const hasMeta = meta.value || meta.fee || meta.outcome;
    
    return {
      title: data.title,
      case_number: data.case_number,
      client_id: data.client_id,
      case_type: data.case_type,
      status: data.status,
      priority: data.priority,
      next_hearing: data.next_hearing || null,
      description: hasMeta ? `${description}${META_MARKER}${JSON.stringify(meta)}` : description,
    };
  };

  const fetchCases = useCallback(async (searchTerm = '') => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('legal_cases')
        .select(`
          *,
          clients (name)
        `)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`case_number.ilike.%${searchTerm}%,title.ilike.%${searchTerm}%`);
      }

      const { data, error: supabaseError } = await query;
      if (supabaseError) throw supabaseError;
      
      const mappedCases = (data || []).map((c: any) => parseCaseData(c));
      setCases(mappedCases);
    } catch (err: any) {
      if (err.code !== '42P01') {
        setError(handleSupabaseError(err));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Fix: Return data after insert and standardize success/error object shape
  const createCase = async (caseData: any) => {
    setLoading(true);
    try {
      const { data: { user } } = await (supabase.auth as any).getUser();
      const preparedData = prepareCaseData(caseData);

      const { data, error: sbError } = await supabase
        .from('legal_cases')
        .insert([{
          ...preparedData,
          created_by: user?.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (sbError) throw sbError;
      await fetchCases();
      return { success: true, data: parseCaseData(data) };
    } catch (err: any) {
      return { success: false, error: handleSupabaseError(err) };
    } finally {
      setLoading(false);
    }
  };

  // Fix: Return data after update and standardize success/error object shape
  const updateCase = async (id: string, caseData: any) => {
    setLoading(true);
    try {
      const preparedData = prepareCaseData(caseData);
      const { data, error: sbError } = await supabase
        .from('legal_cases')
        .update({ ...preparedData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (sbError) throw sbError;
      await fetchCases();
      return { success: true, data: parseCaseData(data) };
    } catch (err: any) {
      return { success: false, error: handleSupabaseError(err) };
    } finally {
      setLoading(false);
    }
  };

  const deleteCase = async (id: string) => {
    try {
      await supabase.from('legal_cases').update({ deleted_at: new Date().toISOString() }).eq('id', id);
      setCases(prev => prev.filter(c => c.id !== id));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: handleSupabaseError(err) };
    }
  };

  return {
    cases,
    loading,
    error,
    fetchCases,
    createCase,
    updateCase,
    deleteCase
  };
};
