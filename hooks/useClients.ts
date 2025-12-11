import { useState, useCallback } from 'react';
import { supabase, handleSupabaseError } from '../services/supabaseClient';
import { Client } from '../types';
import { moveToRecycleBin, restoreFromRecycleBin, permanentDeleteFromRecycleBin } from '../services/recycleBin';

export const useClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [deletedClients, setDeletedClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Busca apenas clientes ativos (não excluídos)
  const fetchClients = useCallback(async (searchTerm = '') => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('clients')
        .select('*')
        .is('deleted_at', null) // Filtra apenas não deletados
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }

      const { data, error: supabaseError } = await query;

      if (supabaseError) throw supabaseError;
      
      setClients(data || []);
    } catch (err: any) {
      if (err.code !== '42P01') { 
        const errorMessage = handleSupabaseError(err);
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Busca clientes na lixeira
  const fetchDeletedClients = useCallback(async () => {
    // Note: This relies on simple soft-delete. If using RPC view, this might return empty if table logic changed.
    // However, keeping it as fallback.
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .not('deleted_at', 'is', null) // Filtra apenas deletados
        .order('deleted_at', { ascending: false });

      if (error) throw error;
      setDeletedClients(data || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createClient = async (clientData: any) => {
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const newId = crypto.randomUUID();

      const sanitizedData = {
        id: newId,
        ...clientData,
        email: clientData.email === '' ? null : clientData.email,
        phone: clientData.phone === '' ? null : clientData.phone,
        cpf_cnpj: clientData.cpf_cnpj === '' ? null : clientData.cpf_cnpj,
        address: clientData.address === '' ? null : clientData.address,
        created_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null
      };

      const { data, error: supabaseError } = await supabase
        .from('clients')
        .insert([sanitizedData])
        .select()
        .single();

      if (supabaseError) throw supabaseError;

      if (data) {
        setClients(prev => [data, ...prev]);
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

  const updateClient = async (id: string, clientData: any) => {
    setLoading(true);
    setError(null);

    try {
      const sanitizedData = {
        ...clientData,
        email: clientData.email === '' ? null : clientData.email,
        phone: clientData.phone === '' ? null : clientData.phone,
        cpf_cnpj: clientData.cpf_cnpj === '' ? null : clientData.cpf_cnpj,
        address: clientData.address === '' ? null : clientData.address,
        updated_at: new Date().toISOString(),
      };

      const { data, error: supabaseError } = await supabase
        .from('clients')
        .update(sanitizedData)
        .eq('id', id)
        .select()
        .single();

      if (supabaseError) throw supabaseError;

      if (data) {
        setClients(prev => prev.map(c => c.id === id ? data : c));
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

  // Replaced custom implementation with Centralized Service
  const deleteClient = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await moveToRecycleBin('clients', id);
      
      if (!result.success) throw new Error(result.error);

      // Remove from local list immediately for UI responsiveness
      setClients(prev => prev.filter(c => c.id !== id));
      
      return { error: null };
    } catch (err: any) {
      let errorMessage = handleSupabaseError(err);
      setError(errorMessage);
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const restoreClient = async (id: string) => {
    setLoading(true);
    try {
      // Try generic restore
      const result = await restoreFromRecycleBin(id, 'clients');
      if (!result.success) throw new Error(result.error);

      await fetchDeletedClients(); 
      await fetchClients(); 
      return { error: null };
    } catch (err: any) {
      return { error: handleSupabaseError(err) };
    } finally {
      setLoading(false);
    }
  };

  const permanentDeleteClient = async (id: string) => {
     setLoading(true);
     try {
       const success = await permanentDeleteFromRecycleBin(id, 'clients');
       if(!success) throw new Error("Erro ao excluir permanentemente");

       setDeletedClients(prev => prev.filter(c => c.id !== id));
       return { error: null };
     } catch (err: any) {
        return { error: handleSupabaseError(err) };
     } finally {
        setLoading(false);
     }
  };

  return { 
    clients, 
    deletedClients,
    loading, 
    error, 
    fetchClients, 
    fetchDeletedClients,
    createClient, 
    updateClient, 
    deleteClient,
    restoreClient,
    permanentDeleteClient
  };
};