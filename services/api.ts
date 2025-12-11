import { supabase, handleSupabaseError } from './supabaseClient';
import { Client, LegalCase, Counterpart } from '../types';

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

// --- CLIENTS ---

export const getClients = async (searchTerm = ''): Promise<Client[]> => {
  let query = supabase
    .from('clients')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (searchTerm) {
    query = query.or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};

export const saveClient = async (client: Partial<Client>) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (client.id) {
    const { data, error } = await supabase
      .from('clients')
      .update({ 
        ...client, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', client.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  } else {
    // Generate a UUID client-side to ensure ID exists, fixing the 23502 error
    // if the database table lacks a default gen_random_uuid() constraint.
    const newId = crypto.randomUUID();
    
    // Remove any potential undefined 'id' from the incoming object before spreading
    const { id, ...rest } = client;

    const { data, error } = await supabase
      .from('clients')
      .insert([{
        id: newId,
        ...rest,
        created_by: user?.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};

// --- GENERIC RESTORE ---
export const restoreItem = async (id: string, tableName: string) => {
  const { error } = await supabase
    .from(tableName)
    .update({ deleted_at: null })
    .eq('id', id);
    
  if (error) throw error;
  return { success: true };
};

export { type Client };