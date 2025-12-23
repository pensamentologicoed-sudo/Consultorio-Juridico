import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ruecuoqnbmdwjsuohbpn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1ZWN1b3FuYm1kd2pzdW9oYnBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2ODg4NDEsImV4cCI6MjA4MDI2NDg0MX0.Iz2Lmt0F-2rODfdyyIesWcZE-pVUpwoFLlU69zOpqmE';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function for error handling
export const handleSupabaseError = (error: any) => {
  // Log detalhado para debug (converte objeto para string legível)
  console.error('🔴 Supabase Error Detalhado:', JSON.stringify(error, null, 2));
  
  if (typeof error === 'string') return error;

  if (error?.code) {
    switch (error.code) {
      case '23505':
        return 'Registro duplicado. Já existe um item com este Email, CPF ou identificador.';
      case '23503':
        return 'Erro de integridade. Referência inválida a outro registro (ex: Usuário ou Cliente não encontrado).';
      case '23514':
        return 'Erro de validação. Um valor inserido não é permitido pelas regras do banco.';
      case '42501':
        return 'Permissão negada (RLS). A política de segurança do banco impediu esta ação. Verifique se você tem permissão para alterar este registro.';
      case '42P01':
        return 'Tabela não encontrada no banco de dados. Contate o suporte.';
      case '23502':
         return 'Erro de dados: Um campo obrigatório (como ID) estava vazio.';
      default:
        return error.message || 'Erro desconhecido no banco de dados.';
    }
  }
  
  return error?.message || (error && typeof error === 'object' ? 'Ocorreu um erro ao processar. Verifique o console.' : 'Erro desconhecido ao conectar com o servidor.');
};