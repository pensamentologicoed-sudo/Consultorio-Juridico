
import React, { useEffect, useState } from 'react';
import { useSoftDelete } from '../hooks/useSoftDelete';
import { getRecycleBinItems, RecycleBinItem, restoreFromRecycleBin, permanentDeleteFromRecycleBin } from '../services/recycleBin';
// Added Clock to the imports from lucide-react to fix the "Cannot find name 'Clock'" error.
import { Trash2, RefreshCw, XCircle, AlertTriangle, Search, Loader2, User, Scale, ShieldAlert, FileText, CheckCircle, Clock } from 'lucide-react';

interface TrashProps {
  onRestore?: (tableName: string) => void;
}

const Trash: React.FC<TrashProps> = ({ onRestore }) => {
  const [items, setItems] = useState<RecycleBinItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'clients' | 'legal_cases' | 'counterparts' | 'documents'>('all');
  
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<RecycleBinItem | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

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

  const showNotification = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const confirmPermanentDelete = async () => {
    if (!itemToDelete) return;
    
    setProcessingId(itemToDelete.id);
    const success = await permanentDeleteFromRecycleBin(itemToDelete.original_id, itemToDelete.original_table);
    
    if (success) {
       // Remove do estado local imediatamente para garantir atualização visual
       setItems(prev => prev.filter(i => i.original_id !== itemToDelete.original_id));
       setItemToDelete(null); 
       showNotification('Registro expurgado permanentemente.');
       // Faz o fetch em background para sincronizar após delay
       setTimeout(fetchData, 800);
    } else {
      alert('Erro ao realizar exclusão permanente.');
    }
    setProcessingId(null);
  };

  const handleRestore = async (item: RecycleBinItem) => {
    setRestoringId(item.id);
    try {
        const result = await restoreFromRecycleBin(item.original_id, item.original_table, item.recycle_bin_id);
        if (result.success) {
            // Remove do estado local imediatamente (usando original_id para segurança)
            setItems(prev => prev.filter(i => i.original_id !== item.original_id));
            showNotification('Registro restaurado com sucesso.');
            if (onRestore) onRestore(item.original_table);
            // Faz o fetch em background para sincronizar após delay
            setTimeout(fetchData, 800);
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
      case 'clients': return <User className="w-3.5 h-3.5" />;
      case 'legal_cases': return <Scale className="w-3.5 h-3.5" />;
      case 'counterparts': return <ShieldAlert className="w-3.5 h-3.5" />;
      case 'documents': return <FileText className="w-3.5 h-3.5" />;
      default: return <Trash2 className="w-3.5 h-3.5" />;
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
    <div className="space-y-6 animate-in fade-in max-w-5xl mx-auto py-2">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Lixeira Digital</h1>
          <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest opacity-70">Recuperação de Ativos Removidos</p>
        </div>
        
        <div className="flex gap-2">
            {successMsg && (
              <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 border border-green-100 rounded-xl animate-in zoom-in">
                <CheckCircle className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">{successMsg}</span>
              </div>
            )}
            <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Pesquisar excluídos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-[10px] font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-brand-gold/20 w-full md:w-64 shadow-sm"
                />
            </div>
            <button 
                onClick={fetchData} 
                className="p-2.5 bg-white text-gray-400 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all shadow-sm"
            >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-red-700 flex items-center gap-3 text-xs font-bold uppercase tracking-widest">
            <AlertTriangle className="h-4 w-4" />
            {error}
        </div>
      )}

      {/* Tabs / Filters - Black Style */}
      <div className="bg-[#131313] p-1.5 rounded-2xl inline-flex flex-wrap gap-1 shadow-xl">
        {[
          { id: 'all', label: 'Todos', count: counts.all },
          { id: 'clients', label: 'Clientes', count: counts.clients },
          { id: 'legal_cases', label: 'Processos', count: counts.legal_cases },
          { id: 'counterparts', label: 'Contrapartes', count: counts.counterparts },
          { id: 'documents', label: 'Documentos', count: counts.documents },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`
               flex items-center px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all
               ${activeTab === tab.id 
                 ? 'bg-brand-gold text-[#131313] shadow-lg' 
                 : 'text-gray-500 hover:text-white/80'}
            `}
          >
            {tab.label}
            <span className={`ml-3 px-2 py-0.5 rounded-lg text-[8px] ${activeTab === tab.id ? 'bg-[#131313] text-brand-gold' : 'bg-white/5 text-gray-600'}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
        {loading && items.length === 0 ? (
           <div className="p-20 text-center flex flex-col items-center justify-center h-full">
             <Loader2 className="h-10 w-10 animate-spin mb-4 text-brand-gold" />
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sincronizando Banco de Dados...</p>
           </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50/50">
                    <tr>
                        <th className="px-8 py-5 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest">Tipo de Ativo</th>
                        <th className="px-8 py-5 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest">Identificação</th>
                        <th className="px-8 py-5 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest">Excluído em</th>
                        <th className="px-8 py-5 text-right text-[9px] font-black text-gray-400 uppercase tracking-widest">Ações de Gestão</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-50">
                    {filteredItems.length === 0 ? (
                        <tr>
                            <td colSpan={4} className="px-8 py-32 text-center">
                                <Trash2 className="h-12 w-12 text-gray-100 mx-auto mb-4" />
                                <p className="text-gray-300 font-black text-[10px] uppercase tracking-[0.3em]">
                                    Nenhum registro arquivado
                                </p>
                            </td>
                        </tr>
                    ) : (
                        filteredItems.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                            <td className="px-8 py-5 whitespace-nowrap">
                                <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest bg-gray-100 text-gray-900 border border-gray-200`}>
                                    {getItemIcon(item.original_table)}
                                    {getTypeLabel(item.original_table)}
                                </span>
                            </td>
                            <td className="px-8 py-5">
                                <div className="text-[11px] font-black text-gray-900 uppercase tracking-tight">{getItemName(item)}</div>
                                <div className="text-[8px] text-gray-400 font-black uppercase mt-1 tracking-widest flex items-center gap-2">
                                  UUID: {item.original_id.split('-')[0]} 
                                  <span className="bg-gray-50 px-1 rounded">{item.source}</span>
                                </div>
                            </td>
                            <td className="px-8 py-5 whitespace-nowrap">
                                <span className="text-[10px] font-bold text-gray-600 flex items-center gap-2">
                                    <Clock className="h-3 w-3 text-brand-gold opacity-50" />
                                    {new Date(item.deleted_at).toLocaleString('pt-BR')}
                                </span>
                            </td>
                            <td className="px-8 py-5 text-right whitespace-nowrap">
                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={() => handleRestore(item)}
                                        disabled={restoringId === item.id}
                                        className="inline-flex items-center px-4 py-2 bg-green-50 text-green-700 text-[9px] font-black uppercase tracking-widest rounded-xl border border-green-100 hover:bg-green-100 transition-all disabled:opacity-50"
                                    >
                                        <RefreshCw className={`w-3 h-3 mr-2 ${restoringId === item.id ? 'animate-spin' : ''}`} />
                                        {restoringId === item.id ? 'Recuperando...' : 'Restaurar'}
                                    </button>
                                    
                                    <button
                                        onClick={() => setItemToDelete(item)}
                                        disabled={processingId === item.id}
                                        className="inline-flex items-center px-4 py-2 bg-red-50 text-red-700 text-[9px] font-black uppercase tracking-widest rounded-xl border border-red-100 hover:bg-red-100 transition-all disabled:opacity-50"
                                    >
                                        <XCircle className="w-3 h-3 mr-2" />
                                        Expurgar
                                    </button>
                                </div>
                            </td>
                        </tr>
                        ))
                    )}
                </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL DE CONFIRMAÇÃO DE EXPURGO */}
      {itemToDelete && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={() => setItemToDelete(null)} />
          <div className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200 border border-white/20 overflow-hidden">
            <div className="bg-[#131313] p-8 border-b border-brand-gold/10">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-red-500/10 rounded-2xl flex items-center justify-center shrink-0 border border-red-500/20">
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                </div>
                <div>
                   <h3 className="text-sm font-black text-brand-gold uppercase tracking-widest">Exclusão Permanente</h3>
                   <p className="text-[9px] text-white/40 font-black uppercase tracking-[0.2em] mt-1">Ação Crítica e Irreversível</p>
                </div>
              </div>
            </div>

            <div className="p-8 space-y-4 text-center sm:text-left">
                <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">
                  Você está prestes a expurgar definitivamente este registro do banco de dados corporativo:
                </p>
                <div className="p-5 bg-gray-50 rounded-2xl border border-gray-200 font-black text-gray-900 text-xs uppercase tracking-tight">
                   {getItemName(itemToDelete)}
                </div>
                <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
                    <p className="text-[9px] text-red-700 font-black uppercase tracking-widest">
                       Atenção: A remoção física deletará todos os vínculos e documentos associados. Esta ação não pode ser desfeita.
                    </p>
                </div>
            </div>

            <div className="p-8 pt-0 flex gap-3">
                <button
                  onClick={() => setItemToDelete(null)}
                  className="flex-1 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest bg-gray-100 rounded-xl hover:bg-gray-200 transition-all"
                  disabled={processingId === itemToDelete.id}
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmPermanentDelete}
                  className="flex-1 py-4 text-[10px] font-black text-white uppercase tracking-widest bg-red-600 rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-200 flex items-center justify-center"
                  disabled={processingId === itemToDelete.id}
                >
                  {processingId === itemToDelete.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Confirmar Exclusão"
                  )}
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Trash;
