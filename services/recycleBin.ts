
import { supabase, handleSupabaseError } from './supabaseClient';

export interface RecycleBinItem {
  id: string; 
  recycle_bin_id?: string;
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

/**
 * Move um registro para a lixeira.
 */
export const moveToRecycleBin = async (
  tableName: 'clients' | 'counterparts' | 'legal_cases' | 'documents',
  recordId: string,
  reason?: string | null
): Promise<MoveToRecycleBinResponse> => {
  try {
    const { data, error: rpcError } = await supabase.rpc('move_to_recycle_bin', {
      p_table_name: tableName,
      p_record_id: recordId,
      p_reason: reason || null
    });

    if (!rpcError) {
      return { success: true, message: 'Item arquivado com sucesso' };
    }

    console.warn('Fallback: Usando Soft Delete direto.');
    const { error: updateError } = await supabase
      .from(tableName)
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', recordId);

    if (updateError) throw updateError;
    return { success: true, message: 'Item movido para a lixeira' };

  } catch (error: any) {
    return {
      success: false,
      message: 'Erro ao excluir item',
      error: handleSupabaseError(error)
    };
  }
};

/**
 * Restaura um item da lixeira.
 * Ação tripla para garantir que o item suma da lixeira.
 */
export const restoreFromRecycleBin = async (
  recordId: string,
  tableName?: string,
  recycleBinId?: string 
): Promise<MoveToRecycleBinResponse> => {
  try {
    // 1. Tenta restaurar via RPC (que deveria fazer tudo em uma transação)
    if (recycleBinId) {
        const { error: rpcError } = await supabase.rpc('restore_from_recycle_bin', {
            p_recycle_bin_id: recycleBinId
        });
        if (!rpcError) return { success: true, message: 'Item restaurado com sucesso' };
    }

    // 2. Fallback Manual Robusto
    if (!tableName) return { success: false, message: 'Identificação da tabela necessária para restauração manual.' };

    // A. Reativa o registro original
    await supabase.from(tableName).update({ deleted_at: null }).eq('id', recordId);

    // B. Deleta da tabela de auditoria (por ID da lixeira se tiver)
    if (recycleBinId) {
        await supabase.from('recycle_bin').delete().eq('id', recycleBinId);
    }

    // C. Deleta da tabela de auditoria (por ID original para garantir)
    await supabase.from('recycle_bin').delete().eq('original_id', recordId).eq('original_table', tableName);

    return { success: true, message: 'Item restaurado com sucesso' };
  } catch (error: any) {
    return {
      success: false,
      message: 'Erro ao restaurar',
      error: handleSupabaseError(error)
    };
  }
};

/**
 * Lista itens da lixeira com verificação de integridade.
 */
export const getRecycleBinItems = async (): Promise<RecycleBinItem[]> => {
  const itemsMap = new Map<string, RecycleBinItem>();
  
  try {
    // 1. Busca na tabela centralizada de auditoria
    const { data: binData } = await supabase.from('recycle_bin').select('*');
    
    // 2. Scan de Fallback em todas as tabelas
    const tables = ['clients', 'legal_cases', 'counterparts', 'documents'];
    const results = await Promise.all(
        tables.map(t => supabase.from(t).select('*').not('deleted_at', 'is', null))
    );
    
    // Adiciona itens do Scan primeiro (são os mais crus)
    results.forEach((res, index) => {
        if (res.data) {
            res.data.forEach((item: any) => {
                itemsMap.set(item.id, {
                    id: item.id,
                    original_table: tables[index] as any,
                    original_id: item.id,
                    data: item,
                    deleted_at: item.deleted_at,
                    source: 'soft_delete'
                });
            });
        }
    });

    // Sobrescreve/Complementa com dados da tabela de auditoria (mais ricos)
    if (binData) {
      binData.forEach((row: any) => {
        // VERIFICAÇÃO DE INTEGRIDADE: 
        // Se o item está na recycle_bin mas o original_id NÃO está na lista de itens com deleted_at,
        // significa que ele foi restaurado mas a linha na recycle_bin "sobrou".
        // Só mostramos se ele ainda estiver marcado como deletado nas tabelas originais.
        if (itemsMap.has(row.original_id)) {
            itemsMap.set(row.original_id, {
                id: row.id,
                recycle_bin_id: row.id,
                original_table: row.original_table,
                original_id: row.original_id,
                data: row.data || { name: row.item_name || 'Sem nome' },
                deleted_at: row.deleted_at,
                source: 'rpc'
            });
        }
      });
    }

    return Array.from(itemsMap.values())
        // Filtro final: só mostra o que tem data de deleção (evita itens restaurados)
        .filter(item => item.deleted_at !== null)
        .sort((a, b) => new Date(b.deleted_at).getTime() - new Date(a.deleted_at).getTime());
        
  } catch (err) {
    console.error('Erro ao listar lixeira:', err);
    return [];
  }
};

/**
 * Deleta permanentemente um registro.
 */
export const permanentDeleteFromRecycleBin = async (
  recordId: string,
  tableName: string
): Promise<boolean> => {
  try {
    await supabase.from(tableName).delete().eq('id', recordId);
    await supabase.from('recycle_bin').delete().eq('original_id', recordId).eq('original_table', tableName);
    return true;
  } catch (error) {
    console.error('Erro na exclusão permanente:', error);
    return false;
  }
};
