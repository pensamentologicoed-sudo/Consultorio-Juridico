import { useState, useCallback } from 'react';
import { supabase, handleSupabaseError } from '../services/supabaseClient';
import { Counterpart } from '../types';

export const useCounterparts = () => {
  const [counterparts, setCounterparts] = useState<Counterpart[]>([]);
  const [deletedCounterparts, setDeletedCounterparts] = useState<Counterpart[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Busca apenas contrapartes ativas
  const fetchCounterparts = useCallback(async (searchTerm = '') => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('counterparts')
        .select('*')
        .is('deleted_at', null) // Filtra apenas não deletados
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,cpf_cnpj.ilike.%${searchTerm}%`);
      }

      const { data, error: supabaseError } = await query;

      if (supabaseError) throw supabaseError;
      
      setCounterparts(data || []);
    } catch (err: any) {
      if (err.code !== '42P01') { 
        const errorMessage = handleSupabaseError(err);
        setError(errorMessage);
      } else {
        console.warn('Tabela counterparts ainda não existe.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Busca contrapartes na lixeira
  const fetchDeletedCounterparts = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('counterparts')
        .select('*')
        .not('deleted_at', 'is', null)
        .order('deleted_at', { ascending: false });

      if (error) throw error;
      setDeletedCounterparts(data || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createCounterpart = async (data: any) => {
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Generate UUID client-side
      const newId = crypto.randomUUID();

      const sanitizedData = {
        id: newId,
        name: data.name,
        type: data.type,
        email: data.email === '' ? null : data.email,
        phone: data.phone === '' ? null : data.phone,
        cpf_cnpj: data.cpf_cnpj === '' ? null : data.cpf_cnpj,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null
      };

      const { data: newCounterpart, error: supabaseError } = await supabase
        .from('counterparts')
        .insert([sanitizedData])
        .select()
        .single();

      if (supabaseError) throw supabaseError;

      if (newCounterpart) {
        setCounterparts(prev => [newCounterpart, ...prev]);
      }
      return { data: newCounterpart, error: null };
    } catch (err: any) {
      const errorMessage = handleSupabaseError(err);
      setError(errorMessage);
      return { data: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const updateCounterpart = async (id: string, data: any) => {
    setLoading(true);
    setError(null);

    try {
      const sanitizedData = {
        name: data.name,
        type: data.type,
        email: data.email === '' ? null : data.email,
        phone: data.phone === '' ? null : data.phone,
        cpf_cnpj: data.cpf_cnpj === '' ? null : data.cpf_cnpj,
        updated_at: new Date().toISOString(),
      };

      const { data: updated, error: supabaseError } = await supabase
        .from('counterparts')
        .update(sanitizedData)
        .eq('id', id)
        .select()
        .single();

      if (supabaseError) throw supabaseError;

      if (updated) {
        setCounterparts(prev => prev.map(c => c.id === id ? updated : c));
      }
      return { data: updated, error: null };
    } catch (err: any) {
      const errorMessage = handleSupabaseError(err);
      setError(errorMessage);
      return { data: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const deleteCounterpart = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      // Soft Delete
      const { error: supabaseError } = await supabase
        .from('counterparts')
        .update({ 
            deleted_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (supabaseError) throw supabaseError;
      
      setCounterparts(prev => prev.filter(c => c.id !== id));
      return { error: null };
    } catch (err: any) {
      let errorMessage = handleSupabaseError(err);
      setError(errorMessage);
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const restoreCounterpart = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('counterparts')
        .update({ deleted_at: null, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      await fetchDeletedCounterparts();
      await fetchCounterparts();
      return { error: null };
    } catch (err: any) {
       return { error: handleSupabaseError(err) };
    } finally {
       setLoading(false);
    }
  };

  const permanentDeleteCounterpart = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('counterparts').delete().eq('id', id);
      if (error) throw error;
      setDeletedCounterparts(prev => prev.filter(c => c.id !== id));
      return { error: null };
    } catch (err: any) {
       return { error: handleSupabaseError(err) };
    } finally {
       setLoading(false);
    }
  };

  return { 
    counterparts, 
    deletedCounterparts,
    loading, 
    error, 
    fetchCounterparts, 
    fetchDeletedCounterparts, 
    createCounterpart, 
    updateCounterpart, 
    deleteCounterpart,
    restoreCounterpart,
    permanentDeleteCounterpart
  };
};