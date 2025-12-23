
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ruecuoqnbmdwjsuohbpn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1ZWN1b3FuYm1kd2pzdW9oYnBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2ODg4NDEsImV4cCI6MjA4MDI2NDg0MX0.Iz2Lmt0F-2rODfdyyIesWcZE-pVUpwoFLlU69zOpqmE';

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Utilitário para tratar erros do Supabase de forma robusta.
 * Evita o log de '[object Object]' garantindo que o objeto seja inspecionável.
 */
export const handleSupabaseError = (error: any): string => {
  if (!error) return 'Ocorreu um erro desconhecido.';
  
  // Log detalhado para o console do desenvolvedor - passa o objeto real para inspeção direta
  console.group('🔴 Supabase Error Detalhado');
  console.error('Objeto de Erro:', error);
  if (typeof error === 'object' && error !== null) {
    try {
      console.debug('Inspeção Serializada:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    } catch (e) {}
  }
  console.groupEnd();

  if (typeof error === 'string') return error;

  // Extração inteligente de mensagens baseada nos campos comuns do Supabase
  const code = error.code || error.status || (error.error && error.error.code);
  const message = error.message || error.error_description || (error.error && error.error.message) || error.statusText;

  if (code) {
    switch (String(code)) {
      case 'PGRST204':
        return 'Erro de Esquema: Uma coluna não foi encontrada no banco. Verifique o script SQL.';
      case '42P01':
        return 'Tabela não encontrada. Configure o banco de dados via SQL Editor.';
      case '23505':
        return 'Registro duplicado. Este documento ou registro já existe.';
      case '42501':
        return 'Permissão negada (RLS). Verifique as políticas de acesso no Supabase.';
      case '403':
        return 'Acesso negado ao Storage. Verifique se o bucket "documents" é público.';
      default:
        return message ? `${message} (Código: ${code})` : `Erro técnico: ${code}`;
    }
  }
  
  return message || 'Erro ao processar a requisição de dados.';
};
