import { supabase, handleSupabaseError } from './supabaseClient';

export interface RecycleBinItem {
  id: string; // ID for list key (could be record_id or recycle_bin_id)
  recycle_bin_id?: string; // Specific ID from the recycle bin table (if using RPC)
  original_table: 'clients' | 'legal_cases' | 'counterparts' | 'documents';
  original_id: string;
  data: any;
  deleted_by?: string;
  deleted_at: string;
  source: 'rpc' | 'soft_delete';
}

export interface MoveToRecycleBinResponse {
  success: boolean;
  message: string;
  error?: string;
}

// Mover para lixeira (Tenta RPC primeiro, fallback para Update)
export const moveToRecycleBin = async (
  tableName: 'clients' | 'counterparts' | 'legal_cases' | 'documents',
  recordId: string,
  reason?: string
): Promise<MoveToRecycleBinResponse> => {
  try {
    // 1. Tentar via RPC (Bypasses RLS if configured correctly)
    const { error: rpcError } = await supabase.rpc('move_to_recycle_bin', {
      p_table_name: tableName,
      p_record_id: recordId,
      p_reason: reason || null
    });

    if (!rpcError) {
      return { success: true, message: 'Item movido para a lixeira (RPC)' };
    }

    // Se o erro for 42P01 (função não existe) ou erro de permissão que o RPC não resolveu, tentamos fallback manual
    // Mas se o RPC existe e deu erro de negócio, talvez devêssemos parar.
    // Vamos assumir que se deu erro, tentamos o método manual simplificado.
    console.warn('RPC move_to_recycle_bin falhou, tentando soft delete manual:', rpcError.message);

    // 2. Fallback: Soft Delete Manual (Update deleted_at)
    // Nota: NÃO atualizamos updated_at para evitar trigger de RLS que bloqueia edições
    const timestamp = new Date().toISOString();
    
    // ATUALIZAÇÃO: Documentos agora suportam soft delete se a coluna existir.
    
    const { error: updateError } = await supabase
      .from(tableName)
      .update({ deleted_at: timestamp })
      .eq('id', recordId);

    if (updateError) throw updateError;

    // Cascata manual para Clientes -> Processos
    if (tableName === 'clients') {
        await supabase
            .from('legal_cases')
            .update({ deleted_at: timestamp })
            .eq('client_id', recordId);
    }

    return { success: true, message: 'Item movido para a lixeira (Soft Delete)' };

  } catch (error: any) {
    console.error(`Erro fatal ao mover para lixeira (${tableName}):`, error);
    return {
      success: false,
      message: 'Erro ao excluir item',
      error: handleSupabaseError(error)
    };
  }
};

// Restaurar (Tenta RPC primeiro, fallback para Update)
export const restoreFromRecycleBin = async (
  recordId: string,
  tableName?: string,
  recycleBinId?: string // Opcional, usado se veio do view
): Promise<MoveToRecycleBinResponse> => {
  try {
    // 1. Tentar via RPC se tivermos o ID da lixeira
    if (recycleBinId) {
        const { error: rpcError } = await supabase.rpc('restore_from_recycle_bin', {
            p_recycle_bin_id: recycleBinId
        });
        if (!rpcError) return { success: true, message: 'Item restaurado (RPC)' };
        console.warn('RPC restore falhou, tentando manual:', rpcError.message);
    }

    if (!tableName) return { success: false, message: 'Tabela não informada para restauração manual.' };

    // 2. Fallback: Update manual
    const { error } = await supabase
      .from(tableName)
      .update({ deleted_at: null })
      .eq('id', recordId);

    if (error) throw error;

    return { success: true, message: 'Item restaurado com sucesso' };
  } catch (error: any) {
    return {
      success: false,
      message: 'Erro ao restaurar item',
      error: handleSupabaseError(error)
    };
  }
};

// Buscar itens (Merge de View RPC + Soft Deleted Tables)
export const getRecycleBinItems = async (): Promise<RecycleBinItem[]> => {
  const items: RecycleBinItem[] = [];
  const seenIds = new Set<string>();

  try {
    // 1. Tentar buscar da VIEW (RPC Backend)
    const { data: viewData, error: viewError } = await supabase
      .from('recycle_bin_view') 
      .select('*')
      .order('deleted_at', { ascending: false });

    if (!viewError && viewData) {
      viewData.forEach((row: any) => {
        const originalId = row.record_id || row.record?.id;
        if (originalId) {
            seenIds.add(originalId);
            items.push({
                id: row.id || originalId, 
                recycle_bin_id: row.id,
                original_table: row.table_name || row.original_table,
                original_id: originalId,
                data: row.record || row.data || {},
                deleted_at: row.deleted_at,
                source: 'rpc'
            });
        }
      });
    }
  } catch (err) {
    console.warn('Recycle Bin View não acessível, pulando...');
  }

  // 2. Buscar itens Soft Deleted das tabelas (Fallback / Legado)
  try {
    const promises = [
      supabase.from('clients').select('*').not('deleted_at', 'is', null),
      supabase.from('legal_cases').select('*').not('deleted_at', 'is', null),
      supabase.from('counterparts').select('*').not('deleted_at', 'is', null),
      supabase.from('documents').select('*').not('deleted_at', 'is', null), // Add documents scan
    ];

    const [clientsRes, casesRes, counterpartsRes, documentsRes] = await Promise.all(promises);

    const processManualItem = (res: any, table: any) => {
        if (res.data) {
            res.data.forEach((item: any) => {
                if (!seenIds.has(item.id)) {
                    items.push({
                        id: item.id,
                        original_table: table,
                        original_id: item.id,
                        data: item,
                        deleted_at: item.deleted_at,
                        source: 'soft_delete'
                    });
                }
            });
        }
    };

    processManualItem(clientsRes, 'clients');
    processManualItem(casesRes, 'legal_cases');
    processManualItem(counterpartsRes, 'counterparts');
    processManualItem(documentsRes, 'documents');

  } catch (err) {
    console.error('Erro ao buscar itens manuais:', err);
  }

  return items.sort((a, b) => new Date(b.deleted_at).getTime() - new Date(a.deleted_at).getTime());
};

export const permanentDeleteFromRecycleBin = async (
  recordId: string,
  tableName?: string
): Promise<boolean> => {
  try {
    if (!tableName) throw new Error("Tabela necessária");

    // Lógica específica para deletar ARQUIVOS do Storage se for um documento
    if (tableName === 'documents') {
        try {
            // 1. Busca o caminho do arquivo antes de deletar o registro
            const { data, error: fetchError } = await supabase
                .from('documents')
                .select('file_path')
                .eq('id', recordId)
                .single();
            
            if (!fetchError && data?.file_path) {
                // 2. Remove do Storage
                const { error: storageError } = await supabase.storage
                    .from('documents')
                    .remove([data.file_path]);
                
                if (storageError) {
                    console.warn('Aviso: Erro ao deletar arquivo físico do Storage:', storageError.message);
                } else {
                    console.log('Arquivo físico deletado com sucesso.');
                }
            }
        } catch (storageErr) {
            console.warn('Erro ao processar exclusão de arquivo:', storageErr);
            // Não impede a exclusão do registro do banco se o arquivo já não existir
        }
    }

    if (tableName === 'clients') {
        await supabase.from('legal_cases').delete().eq('client_id', recordId);
    }
    
    // Deletar o registro do banco de dados
    const { error } = await supabase.from(tableName).delete().eq('id', recordId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Erro delete permanente:', error);
    return false;
  }
};