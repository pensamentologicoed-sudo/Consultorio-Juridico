import { useState, useCallback } from 'react';
import { supabase, handleSupabaseError } from '../services/supabaseClient';
import { LegalCase, CaseStatus, CasePriority } from '../types';

const META_MARKER = '\n\n__META_DATA__';

export const useCases = () => {
  const [cases, setCases] = useState<LegalCase[]>([]);
  const [deletedCases, setDeletedCases] = useState<LegalCase[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper to extract metadata from description
  const parseCaseData = (data: any): LegalCase => {
    let { description, ...rest } = data;
    let value = null;
    let fee = null;
    let outcome = null;

    if (description && description.includes(META_MARKER)) {
      const parts = description.split(META_MARKER);
      description = parts[0]; // The real description
      try {
        const meta = JSON.parse(parts[1]);
        value = meta.value;
        fee = meta.fee;
        outcome = meta.outcome;
      } catch (e) {
        console.warn('Failed to parse case metadata', e);
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

  // Helper to inject metadata into description
  const prepareCaseData = (data: any) => {
    const meta = {
      value: data.value,
      fee: data.fee,
      outcome: data.outcome
    };
    
    // Only append if there is actual metadata
    const hasMeta = meta.value || meta.fee || meta.outcome;
    const description = data.description || '';
    
    const fullDescription = hasMeta 
      ? `${description}${META_MARKER}${JSON.stringify(meta)}`
      : description;

    return {
      title: data.title,
      case_number: data.case_number,
      client_id: data.client_id,
      case_type: data.case_type,
      status: data.status,
      priority: data.priority,
      next_hearing: data.next_hearing || null,
      description: fullDescription,
      // We do NOT send value, fee, outcome as columns
    };
  };

  const fetchCases = useCallback(async (searchTerm = '') => {
    setLoading(true);
    setError(null);

    try {
      // Removed 'value, fee, outcome' from select list to avoid 42703 error
      let query = supabase
        .from('legal_cases')
        .select(`
          id,
          created_at,
          updated_at,
          title,
          description,
          status,
          priority,
          case_type,
          case_number,
          client_id,
          next_hearing,
          assigned_to,
          deleted_at,
          clients (name)
        `)
        .is('deleted_at', null) // Apenas ativos
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
        const errorMessage = handleSupabaseError(err);
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDeletedCases = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('legal_cases')
        .select(`
          *,
          clients (name)
        `)
        .not('deleted_at', 'is', null)
        .order('deleted_at', { ascending: false });

      if (error) throw error;
      const mapped = (data || []).map((c: any) => parseCaseData(c));
      setDeletedCases(mapped);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createCase = async (caseData: any) => {
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Generate UUID client-side
      const newId = crypto.randomUUID();
      const preparedData = prepareCaseData(caseData);

      const sanitizedData = {
        id: newId,
        ...preparedData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null
      };

      const { data, error: supabaseError } = await supabase
        .from('legal_cases')
        .insert([sanitizedData])
        .select()
        .single();

      if (supabaseError) throw supabaseError;

      if (data) {
        // Refetch to get client name join
        await fetchCases();
      }
      return { data, error: null };
    } catch (err: any) {
      const errorMessage = handleSupabaseError(err);
      setError(errorMessage);
      return { data: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const updateCase = async (id: string, caseData: any) => {
    setLoading(true);
    setError(null);

    try {
      const preparedData = prepareCaseData(caseData);
      
      const sanitizedData = {
        ...preparedData,
        updated_at: new Date().toISOString(),
      };

      const { data, error: supabaseError } = await supabase
        .from('legal_cases')
        .update(sanitizedData)
        .eq('id', id)
        .select()
        .single();

      if (supabaseError) throw supabaseError;

      if (data) {
         await fetchCases();
      }
      return { data: parseCaseData(data), error: null };
    } catch (err: any) {
      const errorMessage = handleSupabaseError(err);
      setError(errorMessage);
      return { data: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const deleteCase = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      // Soft Delete
      const { error: supabaseError } = await supabase
        .from('legal_cases')
        .update({ 
            deleted_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (supabaseError) throw supabaseError;
      setCases(prev => prev.filter(c => c.id !== id));
      return { error: null };
    } catch (err: any) {
      let errorMessage = handleSupabaseError(err);
      setError(errorMessage);
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const restoreCase = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('legal_cases')
        .update({ deleted_at: null, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      await fetchDeletedCases();
      await fetchCases();
      return { error: null };
    } catch (err: any) {
       return { error: handleSupabaseError(err) };
    } finally {
       setLoading(false);
    }
  };

  const permanentDeleteCase = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('legal_cases').delete().eq('id', id);
      if (error) throw error;
      setDeletedCases(prev => prev.filter(c => c.id !== id));
      return { error: null };
    } catch (err: any) {
       return { error: handleSupabaseError(err) };
    } finally {
       setLoading(false);
    }
  };

  return {
    cases,
    deletedCases,
    loading,
    error,
    fetchCases,
    fetchDeletedCases,
    createCase,
    updateCase,
    deleteCase,
    restoreCase,
    permanentDeleteCase
  };
};