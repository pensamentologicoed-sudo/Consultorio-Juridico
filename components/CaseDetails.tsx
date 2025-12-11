import React, { useEffect, useState } from 'react';
import { 
  ArrowLeft, Calendar, User, Scale, DollarSign, 
  FileText, Gavel, Send, Clock, Plus, Trash2, 
  MoreVertical, CheckCircle2, AlertCircle, Phone, Mail, X
} from 'lucide-react';
import { LegalCase, CaseHistoryItem, HistoryType, Client } from '../types';
import { useCaseHistory } from '../hooks/useCaseHistory';
import { supabase } from '../services/supabaseClient';

interface CaseDetailsProps {
  legalCase: LegalCase;
  onBack: () => void;
  onEdit: () => void;
}

const CaseDetails: React.FC<CaseDetailsProps> = ({ legalCase, onBack, onEdit }) => {
  const { history, fetchHistory, addHistoryItem, deleteHistoryItem, loading: historyLoading } = useCaseHistory(legalCase.id);
  const [clientDetails, setClientDetails] = useState<Client | null>(null);
  const [isAddingNote, setIsAddingNote] = useState(false);
  
  // Form State for History
  const [newItemType, setNewItemType] = useState<HistoryType>(HistoryType.NOTE);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemDate, setNewItemDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchHistory();
    fetchClientInfo();
  }, [legalCase.id]);

  const fetchClientInfo = async () => {
    if (!legalCase.client_id) return;
    const { data } = await supabase.from('clients').select('*').eq('id', legalCase.client_id).single();
    if (data) setClientDetails(data);
  };

  const handleAddHistory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemTitle) return;

    const result = await addHistoryItem({
        title: newItemTitle,
        description: newItemDesc,
        type: newItemType,
        date: newItemDate
    });

    if (result.success) {
        setIsAddingNote(false);
        setNewItemTitle('');
        setNewItemDesc('');
        setNewItemType(HistoryType.NOTE);
    } else {
        alert("Erro ao adicionar: " + result.error);
    }
  };

  const getTypeIcon = (type: HistoryType) => {
    switch (type) {
        case HistoryType.PETITION: return <FileText className="w-4 h-4 text-blue-600" />;
        case HistoryType.SENTENCE: return <Gavel className="w-4 h-4 text-red-600" />;
        case HistoryType.APPEAL: return <Scale className="w-4 h-4 text-purple-600" />;
        case HistoryType.HEARING: return <Calendar className="w-4 h-4 text-orange-600" />;
        case HistoryType.STATUS_CHANGE: return <CheckCircle2 className="w-4 h-4 text-green-600" />;
        default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTypeLabel = (type: HistoryType) => {
      switch(type) {
          case HistoryType.PETITION: return "Petição";
          case HistoryType.SENTENCE: return "Sentença";
          case HistoryType.APPEAL: return "Recurso";
          case HistoryType.HEARING: return "Audiência";
          case HistoryType.STATUS_CHANGE: return "Status";
          case HistoryType.NOTE: return "Nota";
          default: return "Evento";
      }
  };

  const getTypeColor = (type: HistoryType) => {
    switch(type) {
        case HistoryType.PETITION: return "bg-blue-100 text-blue-800";
        case HistoryType.SENTENCE: return "bg-red-100 text-red-800";
        case HistoryType.APPEAL: return "bg-purple-100 text-purple-800";
        case HistoryType.HEARING: return "bg-orange-100 text-orange-800";
        default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
      
      {/* Header & Nav */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-600">
                <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-gray-900 line-clamp-1">{legalCase.title}</h1>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium uppercase border ${
                        legalCase.status === 'open' ? 'bg-green-50 text-green-700 border-green-200' :
                        legalCase.status === 'closed' ? 'bg-gray-100 text-gray-600 border-gray-200' :
                        'bg-yellow-50 text-yellow-700 border-yellow-200'
                    }`}>
                        {legalCase.status === 'in_progress' ? 'Em Andamento' : legalCase.status === 'open' ? 'Aberto' : 'Fechado'}
                    </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">Processo nº: <span className="font-mono text-gray-700">{legalCase.case_number}</span></p>
            </div>
        </div>
        <div className="flex gap-2">
            <button onClick={onEdit} className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                Editar Dados
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Info Cards */}
        <div className="space-y-6">
            
            {/* Client Card */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4 flex items-center">
                    <User className="w-4 h-4 mr-2 text-gray-400" />
                    Cliente
                </h3>
                {clientDetails ? (
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0">
                                {clientDetails.name.charAt(0)}
                            </div>
                            <div className="overflow-hidden">
                                <p className="font-medium text-gray-900 truncate" title={clientDetails.name}>{clientDetails.name}</p>
                                <p className="text-xs text-gray-500">{clientDetails.status === 'active' ? 'Cliente Ativo' : 'Inativo'}</p>
                            </div>
                        </div>
                        <div className="pt-3 border-t border-gray-100 space-y-2 text-sm">
                            <div className="flex items-center text-gray-600">
                                <Phone className="w-3.5 h-3.5 mr-2 text-gray-400" />
                                {clientDetails.phone || 'Sem telefone'}
                            </div>
                            <div className="flex items-center text-gray-600">
                                <Mail className="w-3.5 h-3.5 mr-2 text-gray-400" />
                                <span className="truncate">{clientDetails.email || 'Sem email'}</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-sm text-gray-500 italic">Carregando dados do cliente...</div>
                )}
            </div>

            {/* Financial & Status Card */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4 flex items-center">
                    <Scale className="w-4 h-4 mr-2 text-gray-400" />
                    Dados do Caso
                </h3>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">Valor da Causa</p>
                            <p className="font-semibold text-gray-900">
                                {legalCase.value ? legalCase.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-'}
                            </p>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg">
                            <p className="text-xs text-green-600 mb-1">Honorários</p>
                            <p className="font-semibold text-green-700">
                                {legalCase.fee ? legalCase.fee.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-'}
                            </p>
                        </div>
                    </div>
                    
                    <div className="pt-2">
                         <p className="text-xs text-gray-500 mb-1">Área / Tipo</p>
                         <div className="flex gap-2">
                             <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-700 font-medium">{legalCase.case_type}</span>
                             <span className={`px-2 py-1 rounded text-xs font-medium ${
                                 legalCase.priority === 'urgent' ? 'bg-red-100 text-red-700' : 'bg-blue-50 text-blue-700'
                             }`}>
                                 Prioridade {legalCase.priority === 'urgent' ? 'Urgente' : legalCase.priority === 'high' ? 'Alta' : 'Normal'}
                             </span>
                         </div>
                    </div>

                    {legalCase.outcome && (
                        <div className={`p-3 rounded-lg border flex items-center gap-3 ${
                            legalCase.outcome === 'won' ? 'bg-green-50 border-green-200' : 
                            legalCase.outcome === 'lost' ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
                        }`}>
                             {legalCase.outcome === 'won' ? <CheckCircle2 className="text-green-600 w-5 h-5"/> : <AlertCircle className="text-red-500 w-5 h-5"/>}
                             <div>
                                 <p className="text-xs font-bold uppercase opacity-70">Resultado</p>
                                 <p className="text-sm font-semibold capitalize">
                                     {legalCase.outcome === 'won' ? 'Causa Ganha' : legalCase.outcome === 'lost' ? 'Causa Perdida' : 'Acordo'}
                                 </p>
                             </div>
                        </div>
                    )}
                </div>
            </div>

            {legalCase.description && (
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2">Descrição</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{legalCase.description}</p>
                </div>
            )}
        </div>

        {/* Right Column: Timeline */}
        <div className="lg:col-span-2 space-y-4">
             <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[500px] flex flex-col">
                 <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                     <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                         <Clock className="w-5 h-5 text-blue-600" />
                         Linha do Tempo e Andamentos
                     </h3>
                     <button 
                        onClick={() => setIsAddingNote(!isAddingNote)}
                        className={`text-sm font-medium flex items-center gap-1 transition-colors ${
                            isAddingNote ? 'text-gray-500' : 'text-blue-600 hover:text-blue-700'
                        }`}
                     >
                         {isAddingNote ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                         {isAddingNote ? 'Cancelar' : 'Adicionar Andamento'}
                     </button>
                 </div>

                 {/* Add Update Form */}
                 {isAddingNote && (
                     <div className="p-5 border-b border-gray-100 bg-blue-50/50 animate-in slide-in-from-top-2">
                         <form onSubmit={handleAddHistory} className="space-y-3">
                             <div className="flex gap-3">
                                 <select 
                                    className="block w-1/3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                                    value={newItemType}
                                    onChange={(e) => setNewItemType(e.target.value as HistoryType)}
                                 >
                                     <option value={HistoryType.NOTE}>Nota Interna</option>
                                     <option value={HistoryType.PETITION}>Petição</option>
                                     <option value={HistoryType.APPEAL}>Recurso</option>
                                     <option value={HistoryType.SENTENCE}>Sentença</option>
                                     <option value={HistoryType.HEARING}>Audiência</option>
                                 </select>
                                 <input 
                                    type="date"
                                    className="block w-1/3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                                    value={newItemDate}
                                    onChange={(e) => setNewItemDate(e.target.value)}
                                 />
                             </div>
                             <input 
                                type="text"
                                placeholder="Título do andamento (ex: Petição Inicial Protocolada)"
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2"
                                value={newItemTitle}
                                onChange={(e) => setNewItemTitle(e.target.value)}
                                autoFocus
                             />
                             <textarea 
                                placeholder="Detalhes adicionais..."
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2"
                                rows={2}
                                value={newItemDesc}
                                onChange={(e) => setNewItemDesc(e.target.value)}
                             />
                             <div className="flex justify-end pt-1">
                                 <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 shadow-sm">
                                     Salvar Registro
                                 </button>
                             </div>
                         </form>
                     </div>
                 )}

                 {/* Timeline List */}
                 <div className="p-6 flex-1 overflow-y-auto">
                     {history.length === 0 ? (
                         <div className="h-full flex flex-col items-center justify-center text-gray-400 min-h-[200px]">
                             <FileText className="w-12 h-12 mb-3 opacity-20" />
                             <p className="text-sm">Nenhum andamento registrado ainda.</p>
                         </div>
                     ) : (
                         <div className="relative border-l-2 border-gray-100 ml-3 space-y-8 pb-4">
                             {history.map((item) => (
                                 <div key={item.id} className="relative pl-8 group">
                                     {/* Dot */}
                                     <div className={`absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-white shadow-sm flex items-center justify-center ${
                                         item.type === HistoryType.SENTENCE ? 'bg-red-500' : 
                                         item.type === HistoryType.PETITION ? 'bg-blue-500' : 'bg-gray-300'
                                     }`}></div>
                                     
                                     {/* Content */}
                                     <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                                         <div>
                                             <div className="flex items-center gap-2 mb-1">
                                                 <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${getTypeColor(item.type)}`}>
                                                     {getTypeLabel(item.type)}
                                                 </span>
                                                 <span className="text-xs text-gray-400">
                                                     {new Date(item.date).toLocaleDateString('pt-BR')}
                                                 </span>
                                             </div>
                                             <h4 className="text-base font-semibold text-gray-900">{item.title}</h4>
                                             {item.description && (
                                                 <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{item.description}</p>
                                             )}
                                         </div>
                                         
                                         {/* Actions */}
                                         <button 
                                            onClick={() => deleteHistoryItem(item.id)}
                                            className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-600 rounded transition-all"
                                            title="Remover"
                                         >
                                             <Trash2 className="w-4 h-4" />
                                         </button>
                                     </div>
                                 </div>
                             ))}
                         </div>
                     )}
                 </div>
             </div>
        </div>

      </div>
    </div>
  );
};

export default CaseDetails;