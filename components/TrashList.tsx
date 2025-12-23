
import React, { useState, useEffect } from 'react';
import { Trash2, RotateCcw, AlertTriangle, X, RefreshCw } from 'lucide-react';
import { getRecycleBinItems, restoreFromRecycleBin, permanentDeleteFromRecycleBin, RecycleBinItem } from '../services/recycleBin';

interface TrashListProps {
  onRestore: () => void;
}

const TrashList: React.FC<TrashListProps> = ({ onRestore }) => {
  const [items, setItems] = useState<RecycleBinItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const loadItems = async () => {
    setLoading(true);
    try {
      const data = await getRecycleBinItems();
      const clientItems = data.filter(item => item.original_table === 'clients');
      setItems(clientItems);
    } catch (error) {
      console.error('Erro ao carregar lixeira:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleRestore = async (item: RecycleBinItem) => {
    setRestoringId(item.id);
    try {
      const result = await restoreFromRecycleBin(item.original_id, item.original_table, item.recycle_bin_id);
      if (result.success) {
        // Atualização Otimista: Remove o item do estado local imediatamente
        setItems(prev => prev.filter(i => i.id !== item.id));
        // Dispara o callback para atualizar a lista de ativos no componente pai
        onRestore();
        // Recarrega silenciosamente para garantir sincronia completa
        setTimeout(loadItems, 500);
      } else {
        alert(`Erro ao restaurar: ${result.error}`);
      }
    } catch (error) {
      console.error('Erro ao restaurar:', error);
    } finally {
      setRestoringId(null);
    }
  };

  const handlePermanentDelete = async (item: RecycleBinItem) => {
    setDeletingId(item.id);
    try {
      const success = await permanentDeleteFromRecycleBin(item.original_id, item.original_table);
      if (success) {
        setItems(prev => prev.filter(i => i.id !== item.id));
        setConfirmDeleteId(null);
      } else {
        alert('Erro ao excluir permanentemente.');
      }
    } catch (error) {
      console.error('Erro ao excluir:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const getItemName = (item: RecycleBinItem) => {
    try {
      return item.data.name || 'Cliente sem nome';
    } catch {
      return 'Dados indisponíveis';
    }
  };

  if (loading && items.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        Carregando lixeira de clientes...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-blue-500 bg-blue-600 flex justify-between items-center">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <Trash2 className="h-5 w-5 text-white" />
          Clientes Excluídos ({items.length})
        </h3>
        <button onClick={loadItems} className="p-2 hover:bg-blue-500 rounded-full transition-colors text-white">
            <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {items.length === 0 ? (
        <div className="p-12 text-center text-gray-500">
          <Trash2 className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <p>Lixeira de clientes vazia.</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {items.map((item) => (
            <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                   <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 text-xs rounded-full font-medium bg-blue-100 text-blue-800">
                         Cliente
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(item.deleted_at).toLocaleString('pt-BR')}
                      </span>
                   </div>
                   <h4 className="font-semibold text-gray-900">{getItemName(item)}</h4>
                   <div className="text-xs text-gray-500 mt-1">
                      {item.data.email} • {item.data.phone}
                   </div>
                </div>

                <div className="flex items-center gap-2">
                   <button
                     onClick={() => handleRestore(item)}
                     disabled={restoringId === item.id || deletingId === item.id}
                     className="inline-flex items-center px-3 py-1.5 border border-green-200 text-xs font-medium rounded-md text-green-700 bg-green-50 hover:bg-green-100 transition-colors disabled:opacity-50"
                   >
                     <RotateCcw className={`h-3 w-3 mr-1 ${restoringId === item.id ? 'animate-spin' : ''}`} />
                     {restoringId === item.id ? 'Restaurando...' : 'Restaurar'}
                   </button>

                   {confirmDeleteId === item.id ? (
                      <div className="flex items-center gap-2 animate-in fade-in">
                        <button
                          onClick={() => handlePermanentDelete(item)}
                          disabled={deletingId === item.id}
                          className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-md hover:bg-red-700 disabled:opacity-50"
                        >
                          {deletingId === item.id ? '...' : 'Confirmar'}
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="p-1.5 text-gray-500 hover:bg-gray-200 rounded-md"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                   ) : (
                      <button
                        onClick={() => setConfirmDeleteId(item.id)}
                        disabled={restoringId === item.id}
                        className="inline-flex items-center px-3 py-1.5 border border-red-200 text-xs font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50"
                      >
                         <AlertTriangle className="h-3 w-3 mr-1" />
                         Excluir
                      </button>
                   )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TrashList;
