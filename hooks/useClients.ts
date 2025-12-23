
import { useState, useCallback } from 'react';
import { supabase, handleSupabaseError } from '../services/supabaseClient';
import { Client } from '../types';
import { moveToRecycleBin, restoreFromRecycleBin, permanentDeleteFromRecycleBin } from '../services/recycleBin';

export const useClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [deletedClients, setDeletedClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = useCallback(async (searchTerm = '') => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('clients')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }

      const { data, error: supabaseError } = await query;

      if (supabaseError) throw supabaseError;
      
      setClients(data || []);
    } catch (err: any) {
      const errorMessage = handleSupabaseError(err);
      if (err.code === '42P01' || err.code === 'PGRST204') { 
         setError("tabela_missing");
      } else {
         setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDeletedClients = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .not('deleted_at', 'is', null)
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
      const { data: { user } } = await (supabase.auth as any).getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const sanitizedData = {
        id: crypto.randomUUID(),
        name: clientData.name,
        email: clientData.email || null,
        phone: clientData.phone,
        cpf_cnpj: clientData.cpf_cnpj || null,
        rg: clientData.rg || null,
        address: clientData.address || null,
        city: clientData.city || null,
        state: clientData.state || null,
        cep: clientData.cep || null,
        profession: clientData.profession || null,
        company: clientData.company || null,
        income_range: clientData.income_range || null,
        status: clientData.status || 'active',
        observations: clientData.observations || null,
        created_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
        // Documentos
        identification_doc_path: clientData.identification_doc_path || null,
        identification_doc_name: clientData.identification_doc_name || null,
        cpf_doc_path: clientData.cpf_doc_path || null,
        cpf_doc_name: clientData.cpf_doc_name || null,
        birth_marriage_doc_path: clientData.birth_marriage_doc_path || null,
        birth_marriage_doc_name: clientData.birth_marriage_doc_name || null,
        comprovant_residente_doc_path: clientData.comprovant_residente_doc_path || null,
        comprovant_residente_doc_name: clientData.comprovant_residente_doc_name || null,
        other_doc_path: clientData.other_doc_path || null,
        other_doc_name: clientData.other_doc_name || null
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
        name: clientData.name,
        email: clientData.email || null,
        phone: clientData.phone,
        cpf_cnpj: clientData.cpf_cnpj || null,
        rg: clientData.rg || null,
        address: clientData.address || null,
        city: clientData.city || null,
        state: clientData.state || null,
        cep: clientData.cep || null,
        profession: clientData.profession || null,
        company: clientData.company || null,
        income_range: clientData.income_range || null,
        status: clientData.status,
        observations: clientData.observations || null,
        updated_at: new Date().toISOString(),
        // Documentos
        identification_doc_path: clientData.identification_doc_path || null,
        identification_doc_name: clientData.identification_doc_name || null,
        cpf_doc_path: clientData.cpf_doc_path || null,
        cpf_doc_name: clientData.cpf_doc_name || null,
        birth_marriage_doc_path: clientData.birth_marriage_doc_path || null,
        birth_marriage_doc_name: clientData.birth_marriage_doc_name || null,
        comprovant_residente_doc_path: clientData.comprovant_residente_doc_path || null,
        comprovant_residente_doc_name: clientData.comprovant_residente_doc_name || null,
        other_doc_path: clientData.other_doc_path || null,
        other_doc_name: clientData.other_doc_name || null
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

  const deleteClient = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await moveToRecycleBin('clients', id);
      if (!result.success) throw new Error(result.error);
      setClients(prev => prev.filter(c => c.id !== id));
      return { error: null };
    } catch (err: any) {
      setError(handleSupabaseError(err));
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
    deleteClient
  };
};
