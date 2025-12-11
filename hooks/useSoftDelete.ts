import { useState } from 'react';
import { moveToRecycleBin, restoreFromRecycleBin, permanentDeleteFromRecycleBin } from '../services/recycleBin';
import { handleSupabaseError } from '../services/supabaseClient';

export const useSoftDelete = () => {
  const [isDeleting, setIsDeleting] = useState(false);

  // Soft Delete
  const softDelete = async (tableName: 'clients' | 'legal_cases' | 'counterparts', recordId: string, reason: string | null = null) => {
    setIsDeleting(true);
    try {
      const result = await moveToRecycleBin(tableName, recordId, reason || undefined);
      return { 
          success: result.success, 
          error: result.error || null 
      };
    } catch (error: any) {
      console.error('Erro no soft delete:', error);
      return {
        success: false,
        error: handleSupabaseError(error)
      };
    } finally {
      setIsDeleting(false);
    }
  };

  // Restaurar
  const restoreItem = async (recordId: string, tableName: string) => {
    setIsDeleting(true);
    try {
      const result = await restoreFromRecycleBin(recordId, tableName);
      return { 
          success: result.success, 
          error: result.error || null 
      };
    } catch (error: any) {
      console.error('Erro ao restaurar:', error);
      return {
        success: false,
        error: handleSupabaseError(error)
      };
    } finally {
      setIsDeleting(false);
    }
  };

  // Exclusão Permanente
  const permanentDelete = async (recordId: string, tableName: string) => {
    setIsDeleting(true);
    try {
      const success = await permanentDeleteFromRecycleBin(recordId, tableName);
      
      if (!success) throw new Error('Falha ao excluir permanentemente');

      return { success: true, error: null };
    } catch (error: any) {
      console.error('Erro ao excluir permanentemente:', error);
      return {
        success: false,
        error: handleSupabaseError(error)
      };
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    softDelete,
    restoreItem,
    permanentDelete,
    isDeleting
  };
};