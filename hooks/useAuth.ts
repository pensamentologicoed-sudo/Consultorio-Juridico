
import { useState, useEffect } from 'react';
// Usando any para User e Session para compatibilidade
type User = any;
type Session = any;
import { supabase } from '../services/supabaseClient';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const syncProfile = async (currentUser: User, additionalData?: any) => {
    try {
      const metadata = currentUser.user_metadata || {};
      const role = metadata.role || additionalData?.role || 'LAWYER';
      const avatarUrl = metadata.avatarUrl || additionalData?.avatarUrl;
      const logoUrl = metadata.logoUrl || additionalData?.logoUrl;

      const profileData = {
        id: currentUser.id,
        email: currentUser.email,
        full_name: metadata.full_name || metadata.name || additionalData?.name || currentUser.email?.split('@')[0] || 'Usuário',
        role: role,
        avatar_url: avatarUrl,
        logo_url: logoUrl,
        updated_at: new Date().toISOString(),
      };

      // Tenta persistir na tabela de profiles
      // Se a tabela ou colunas não existirem, pegamos o erro mas não bloqueamos o app
      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'id' });

      if (upsertError) {
        // Log amigável apenas para desenvolvedor, sem poluir se for erro de coluna faltante
        if (!upsertError.message.includes('column')) {
          console.warn('Nota: Sincronização de profile limitada. Verifique as tabelas do banco.');
        }
      }
    } catch (err: any) {
      // Falha silenciosa para não quebrar a UX
    }
  };

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session }, error } = await (supabase.auth as any).getSession();
        if (error) throw error;
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) await syncProfile(session.user);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    const { data: { subscription } } = (supabase.auth as any).onAuthStateChange(
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

  const updateProfile = async (data: any) => {
    try {
      const { data: updated, error } = await (supabase.auth as any).updateUser({
        data: data
      });
      if (error) throw error;
      if (updated.user) {
        setUser(updated.user);
        await syncProfile(updated.user);
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      const { data, error } = await (supabase.auth as any).signUp({
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
            avatarUrl: userData.avatarUrl,
            logoUrl: userData.logoUrl
          },
        },
      });
      if (error) throw error;
      if (data.user) await syncProfile(data.user, userData);
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await (supabase.auth as any).signInWithPassword({ email, password });
      if (error) throw error;
      if (data.user) await syncProfile(data.user);
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await (supabase.auth as any).resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });
      if (error) throw error;
      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await (supabase.auth as any).signOut();
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
    resetPassword,
    updateProfile
  };
};
