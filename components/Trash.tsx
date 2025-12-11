import React, { useEffect, useState } from 'react';
import { useSoftDelete } from '../hooks/useSoftDelete';
import { getRecycleBinItems, RecycleBinItem, restoreFromRecycleBin } from '../services/recycleBin';
import { Trash2, RefreshCw, XCircle, AlertTriangle, Search, Loader2, User, Scale, ShieldAlert, FileText } from 'lucide-react';
import RestoreButton from './RestoreButton';

interface TrashProps {
  onRestore?: (tableName: string) => void;
}

const Trash: React.FC<TrashProps> = ({ onRestore }) => {
  const [items, setItems] = useState<RecycleBinItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'clients' | 'legal_cases' | 'counterparts' | 'documents'>('all');
  
  // Permanent Delete Modal State
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<RecycleBinItem | null>(null);
  
  const { permanentDelete, isDeleting } = useSoftDelete();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getRecycleBinItems();
      setItems(data);
    } catch (err: any) {
      console.error('Error loading trash:', err);
      setError('Erro ao carregar itens da lixeira.');
    } finally {
      setLoading(false);
    }
  };

  const confirmPermanentDelete = async () => {
    if (!itemToDelete) return;
    
    setProcessingId(itemToDelete.id);
    const result = await permanentDelete(itemToDelete.original_id, itemToDelete.original_table);
    
    if (result.success) {
       await fetchData();
       setItemToDelete(null); // Fecha o modal
    } else {
      alert('Erro ao excluir: ' + result.error);
    }
    setProcessingId(null);
  };

  const handleRestore = async (item: RecycleBinItem) => {
    setRestoringId(item.id);
    try {
        const result = await restoreFromRecycleBin(item.original_id, item.original_table, item.recycle_bin_id);
        if (result.success) {
            await fetchData();
            if (onRestore) onRestore(item.original_table);
        } else {
            alert('Erro ao restaurar: ' + result.error);
        }
    } catch(err) {
        console.error(err);
    } finally {
        setRestoringId(null);
    }
  };

  const getItemIcon = (table: string) => {
    switch (table) {
      case 'clients': return <User className="w-4 h-4" />;
      case 'legal_cases': return <Scale className="w-4 h-4" />;
      case 'counterparts': return <ShieldAlert className="w-4 h-4" />;
      case 'documents': return <FileText className="w-4 h-4" />;
      default: return <Trash2 className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (table: string) => {
    switch (table) {
        case 'clients': return 'Cliente';
        case 'legal_cases': return 'Processo';
        case 'counterparts': return 'Contraparte';
        case 'documents': return 'Documento';
        default: return 'Item';
    }
  };

  const getTypeColor = (table: string) => {
    switch (table) {
      case 'clients': return 'bg-blue-100 text-blue-800';
      case 'legal_cases': return 'bg-green-100 text-green-800';
      case 'counterparts': return 'bg-yellow-100 text-yellow-800';
      case 'documents': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getItemName = (item: RecycleBinItem) => {
      if (!item.data) return 'Item sem nome';
      if (item.original_table === 'legal_cases') {
          return `${item.data.case_number || ''} - ${item.data.title || 'Processo sem título'}`;
      }
      if (item.original_table === 'documents') {
          return item.data.title || item.data.file_name || item.data.name || 'Documento sem nome';
      }
      return item.data.name || 'Item sem nome';
  };

  const filteredItems = items.filter(item => {
    const itemName = getItemName(item);
    const matchesSearch = itemName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'all' || item.original_table === activeTab;
    return matchesSearch && matchesTab;
  });

  const counts = {
    all: items.length,
    clients: items.filter(i => i.original_table === 'clients').length,
    legal_cases: items.filter(i => i.original_table === 'legal_cases').length,
    counterparts: items.filter(i => i.original_table === 'counterparts').length,
    documents: items.filter(i => i.original_table === 'documents').length,
  };

  return (
    <div className="space-y-6 animate-in fade-in relative">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Trash2 className="w-8 h-8 mr-3 text-red-500" />
            Lixeira
          </h1>
          <p className="mt-1 text-sm text-gray-500">Itens excluídos serão mantidos aqui até a exclusão permanente.</p>
        </div>
        
        <div className="flex gap-2">
            <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
            />
            </div>
            <button 
                onClick={fetchData} 
                className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                title="Atualizar Lista"
            >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            {error}
        </div>
      )}

      {/* Tabs / Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2">
         <div className="flex space-x-1 overflow-x-auto">
            {[
              { id: 'all', label: 'Todos', count: counts.all, icon: Trash2 },
              { id: 'clients', label: 'Clientes', count: counts.clients, icon: User },
              { id: 'legal_cases', label: 'Processos', count: counts.legal_cases, icon: Scale },
              { id: 'counterparts', label: 'Contrapartes', count: counts.counterparts, icon: ShieldAlert },
              { id: 'documents', label: 'Documentos', count: counts.documents, icon: FileText },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                   flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap
                   ${activeTab === tab.id 
                     ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-200' 
                     : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                `}
              >
                <tab.icon className={`w-4 h-4 mr-2 ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-400'}`} />
                {tab.label}
                <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${activeTab === tab.id ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}>
                  {tab.count}
                </span>
              </button>
            ))}
         </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading && items.length === 0 ? (
           <div className="p-12 text-center text-gray-400 flex flex-col items-center">
             <Loader2 className="h-8 w-8 animate-spin mb-2 text-blue-500" />
             Carregando itens...
           </div>
        ) : (
          <>
            {filteredItems.length === 0 ? (
                <div className="p-12 text-center text-gray-400">
                  {items.length === 0 ? "A lixeira está vazia." : "Nenhum item encontrado com este filtro."}
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data Exclusão</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredItems.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full inline-flex items-center gap-1 font-medium ${getTypeColor(item.original_table)}`}>
                                {getItemIcon(item.original_table)}
                                {getTypeLabel(item.original_table)}
                            </span>
                            </td>
                            <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{getItemName(item)}</div>
                            <div className="text-xs text-gray-400 mt-1">{item.source === 'rpc' ? 'Via RPC' : 'Manual'}</div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                            {new Date(item.deleted_at).toLocaleString('pt-BR')}
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                            <div className="flex justify-end gap-3">
                                {item.source === 'rpc' && item.recycle_bin_id ? (
                                    <button
                                     onClick={() => handleRestore(item)}
                                     disabled={restoringId === item.id}
                                     className="inline-flex items-center px-3 py-1.5 border border-green-200 text-xs font-medium rounded-md text-green-700 bg-green-50 hover:bg-green-100 transition-colors disabled:opacity-50"
                                   >
                                     <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${restoringId === item.id ? 'animate-spin' : ''}`} />
                                     Restaurar
                                   </button>
                                ) : (
                                    <RestoreButton 
                                    id={item.original_id} 
                                    name={getItemName(item)}
                                    tableName={item.original_table}
                                    onRestore={() => {
                                        fetchData();
                                        if (onRestore) onRestore(item.original_table);
                                    }}
                                    />
                                )}
                                
                                <button
                                onClick={() => setItemToDelete(item)}
                                disabled={isDeleting || processingId === item.id}
                                className="inline-flex items-center px-3 py-1.5 border border-red-200 text-xs font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors disabled:opacity-50"
                                title="Excluir Permanentemente"
                                >
                                    <XCircle className="w-3.5 h-3.5 mr-1.5" />
                                    Excluir
                                </button>
                            </div>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
            )}
          </>
        )}
      </div>

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO PERMANENTE */}
      {itemToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 transition-opacity backdrop-blur-sm" onClick={() => setItemToDelete(null)} />
          <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200 border-2 border-red-100">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                   <h3 className="text-lg font-bold text-gray-900">Exclusão Definitiva</h3>
                   <p className="text-xs text-red-600 font-semibold uppercase tracking-wide">Ação Irreversível</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <p className="text-sm text-gray-600">
                  Você está prestes a excluir permanentemente o item:
                </p>
                <div className="p-3 bg-gray-50 rounded-md border border-gray-200 font-medium text-gray-800 text-sm">
                   {getItemName(itemToDelete)}
                </div>
                <p className="text-sm text-gray-600">
                  {itemToDelete.original_table === 'documents' 
                     ? 'Esta ação removerá o registro do banco de dados e o arquivo físico armazenado. ' 
                     : 'Esta ação removerá todos os dados associados a este registro. '}
                  <span className="font-bold text-red-600">Não será possível recuperar estes dados.</span>
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setItemToDelete(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none"
                  disabled={processingId === itemToDelete.id}
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmPermanentDelete}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none flex items-center shadow-sm shadow-red-200"
                  disabled={processingId === itemToDelete.id}
                >
                  {processingId === itemToDelete.id ? (
                    <>
                       <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                       Excluindo...
                    </>
                  ) : (
                    <>Excluir Definitivamente</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Trash;