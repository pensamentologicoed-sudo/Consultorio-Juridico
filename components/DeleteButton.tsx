import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { moveToRecycleBin, MoveToRecycleBinResponse } from '../services/recycleBin';
import { handleSupabaseError } from '../services/supabaseClient';

interface DeleteButtonProps {
  tableName: 'clients' | 'counterparts' | 'legal_cases' | 'documents';
  recordId: string;
  recordName: string;
  onDelete: (success: boolean) => void;
  variant?: 'destructive' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showIcon?: boolean;
  showLabel?: boolean;
}

const DeleteButton: React.FC<DeleteButtonProps> = ({
  tableName,
  recordId,
  recordName,
  onDelete,
  variant = 'destructive',
  size = 'default',
  className = '',
  showIcon = true,
  showLabel = true,
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');

  const handleDelete = async () => {
    if (!recordId || !tableName) return;

    setLoading(true);
    try {
      const result: MoveToRecycleBinResponse = await moveToRecycleBin(
        tableName,
        recordId,
        deleteReason || null
      );

      if (result.success) {
        onDelete(true);
        setOpen(false);
        setDeleteReason('');
      } else {
        alert(`Erro ao excluir: ${result.error}`);
        onDelete(false);
      }
    } catch (error) {
      alert(`Erro ao excluir: ${handleSupabaseError(error)}`);
      onDelete(false);
    } finally {
      setLoading(false);
    }
  };

  const getTableNamePt = () => {
    switch (tableName) {
      case 'clients': return 'cliente';
      case 'counterparts': return 'contraparte';
      case 'legal_cases': return 'processo';
      case 'documents': return 'documento';
      default: return 'item';
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        className={className || `inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:pointer-events-none ring-offset-background
          ${variant === 'ghost' ? 'hover:bg-accent hover:text-accent-foreground' : 
            variant === 'outline' ? 'border border-input hover:bg-accent hover:text-accent-foreground' : 
            'bg-red-100 text-red-900 hover:bg-red-200'}
          ${size === 'sm' ? 'h-8 px-3 text-xs' : 'h-10 py-2 px-4'}
        `}
        disabled={loading}
      >
        {showIcon && <Trash2 className={`h-4 w-4 ${showLabel ? 'mr-2' : ''}`} />}
        {showLabel && (loading ? 'Excluindo...' : 'Excluir')}
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-red-600">
                <Trash2 className="h-5 w-5" />
                Excluir {getTableNamePt()}
              </h3>
              
              <div className="text-sm text-gray-600">
                <p>Tem certeza que deseja excluir <strong>{recordName}</strong>?</p>
                <p className="mt-1">O item será movido para a lixeira.</p>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">
                  Motivo (opcional):
                </label>
                <textarea
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  placeholder="Ex: Duplicado, Inativo..."
                  className="w-full p-2 text-sm border rounded-md resize-none h-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 flex items-center"
                >
                  {loading ? 'Excluindo...' : 'Confirmar Exclusão'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DeleteButton;