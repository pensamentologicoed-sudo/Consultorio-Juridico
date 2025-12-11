import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../services/supabaseClient';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função para sincronizar o usuário do Auth com a tabela 'profiles'
  // Usa UPSERT para garantir que o registro exista e esteja atualizado
  const syncProfile = async (currentUser: User, additionalData?: any) => {
    try {
      const metadata = currentUser.user_metadata || {};
      
      const role = metadata.role || additionalData?.role || 'LAWYER';

      // Prepara os dados iniciais
      const profileData = {
        id: currentUser.id,
        email: currentUser.email,
        full_name: metadata.full_name || metadata.name || additionalData?.name || currentUser.email?.split('@')[0] || 'Usuário',
        role: role,
        avatar_url: metadata.avatarUrl || additionalData?.avatarUrl,
        updated_at: new Date().toISOString(),
      };

      // Tentativa 1: Envia dados como estão
      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'id' });

      if (upsertError) {
        // Tratamento para Erro 23514: Check Constraint Violation (provavelmente Role inválida)
        if (upsertError.code === '23514') {
             console.warn('⚠️ Violação de constraint de Role (23514). Tentando ajustar formato do role...');
             
             // Tentativa 2: Tenta enviar role em minúsculo (ex: 'LAWYER' -> 'lawyer')
             // Muitos bancos configuram constraints com valores minúsculos
             const retryData = { ...profileData, role: String(role).toLowerCase() };
             const { error: retryError } = await supabase.from('profiles').upsert(retryData, { onConflict: 'id' });
             
             if (retryError) {
                console.error('❌ Falha também na tentativa com role minúsculo:', retryError.message);
             }

        } else if (upsertError.code === 'PGRST204') {
             console.warn('⚠️ Aviso: Algumas colunas não existem na tabela profiles. Sincronização parcial realizada.');
        } else if (upsertError.code === '42501') {
             // Ignora erro RLS
        } else {
             console.error('❌ Erro ao sincronizar perfil:', JSON.stringify(upsertError, null, 2));
        }
      }
    } catch (err: any) {
      console.error('❌ Erro inesperado na sincronização:', err.message);
    }
  };

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await syncProfile(session.user);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') && session?.user) {
          await syncProfile(session.user);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setSession(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.name,
            name: userData.name,
            role: userData.role,
            cpf: userData.cpf,
            oab: userData.oab,
            phone: userData.phone,
            avatarUrl: userData.avatarUrl
          },
        },
      });

      if (error) throw error;
      
      if (data.user) {
        await syncProfile(data.user, userData);
      }
      
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      if (data.user) {
        await syncProfile(data.user);
      }
      
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  return {
    user,
    session,
    loading,
    error,
    signUp,
    signIn,
    signOut,
  };
};