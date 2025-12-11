import React, { useState } from 'react';
import { RotateCcw, Loader2 } from 'lucide-react';
import { restoreFromRecycleBin } from '../services/recycleBin';
import { handleSupabaseError } from '../services/supabaseClient';

interface RestoreButtonProps {
  id: string; // ID do registro
  name: string; // Nome para exibição
  tableName: string; // Tabela Original
  onRestore: () => void; // Callback após sucesso
  
  // Props legado para compatibilidade (ignorados na nova versão se tableName for passado)
  itemId?: string;
  itemName?: string;
}

const RestoreButton: React.FC<RestoreButtonProps> = (props) => {
  const id = props.id || props.itemId || '';
  const name = props.name || props.itemName || 'Item';
  const tableName = props.tableName;
  const onRestore = props.onRestore || (() => {});
  
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRestore = async () => {
    if (!tableName) {
        alert("Erro interno: Tabela não especificada para restauração.");
        return;
    }

    setLoading(true);
    try {
      const result = await restoreFromRecycleBin(id, tableName);
      if (!result.success) throw new Error(result.error);
      
      onRestore();
      setOpen(false);
    } catch (error: any) {
      console.error('Erro detalhado ao restaurar:', error);
      alert(`Erro ao restaurar: ${handleSupabaseError(error)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        className="inline-flex items-center px-3 py-1.5 border border-green-200 text-xs font-medium rounded-md text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors shadow-sm"
        title={`Restaurar ${name}`}
      >
        <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
        Restaurar
      </button>

      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95">
             <div className="flex items-center mb-4">
                <div className="bg-green-100 p-2 rounded-full mr-3">
                    <RotateCcw className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Restaurar Item</h3>
             </div>
             
             <p className="text-gray-600 mb-2">
               Tem certeza que deseja restaurar <strong>{name}</strong>?
             </p>
             <p className="text-sm text-gray-500 mb-6">
               Este item voltará para a lista de ativos.
             </p>

             <div className="flex justify-end gap-3">
               <button 
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none"
                  disabled={loading}
               >
                 Cancelar
               </button>
               <button 
                  onClick={handleRestore}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none flex items-center shadow-sm"
                  disabled={loading}
               >
                 {loading ? (
                    <>
                       <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                       Restaurando...
                    </>
                 ) : (
                    <>
                       Confirmar
                    </>
                 )}
               </button>
             </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RestoreButton;