
import React, { useEffect, useState, useMemo } from 'react';
import { 
  ArrowLeft, Calendar, User, Scale, DollarSign, 
  FileText, Gavel, Send, Clock, Plus, Trash2, 
  CheckCircle2, AlertCircle, Phone, Mail, X,
  Archive, Award, UserPlus, FileSignature, Loader2,
  Box, CheckSquare, History
} from 'lucide-react';
import { LegalCase, CaseHistoryItem, HistoryType, Client, CaseStatus, CaseOutcome } from '../types';
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
  
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemDate, setNewItemDate] = useState(new Date().toISOString().split('T')[0]);
  const [newItemType, setNewItemType] = useState<HistoryType>(HistoryType.NOTE);

  useEffect(() => {
    fetchHistory();
    fetchClientInfo();
  }, [legalCase.id]);

  const fetchClientInfo = async () => {
    if (!legalCase.client_id) return;
    const { data } = await supabase.from('clients').select('*').eq('id', legalCase.client_id).single();
    if (data) setClientDetails(data);
  };

  const getOutcomeLabel = (outcome: CaseOutcome | null | undefined) => {
    switch (outcome) {
      case CaseOutcome.WON: return 'Procedente (Ganho)';
      case CaseOutcome.LOST: return 'Improcedente (Perdido)';
      case CaseOutcome.SETTLED: return 'Acordo Consensual';
      default: return 'Em Andamento';
    }
  };

  const unifiedTimeline = useMemo(() => {
    const events: CaseHistoryItem[] = [...history];

    if (clientDetails?.created_at) {
        events.push({
            id: 'auto-client-creation',
            case_id: legalCase.id,
            title: 'Início do Relacionamento',
            description: `Cadastro inicial do cliente ${clientDetails.name}.`,
            type: HistoryType.SYSTEM,
            date: clientDetails.created_at,
            created_at: clientDetails.created_at,
            is_system_event: true
        });
    }

    events.push({
        id: 'auto-case-creation',
        case_id: legalCase.id,
        title: 'Distribuição / Abertura',
        description: `Processo registrado no sistema.`,
        type: HistoryType.PETITION,
        date: legalCase.created_at,
        created_at: legalCase.created_at,
        is_system_event: true
    });

    if (legalCase.next_hearing) {
        events.push({
            id: 'auto-hearing-scheduled',
            case_id: legalCase.id,
            title: 'Audiência / Reunião',
            description: `Agendada para ${new Date(legalCase.next_hearing).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}.`,
            type: HistoryType.HEARING,
            date: legalCase.next_hearing,
            created_at: legalCase.next_hearing,
            is_system_event: true
        });
    }

    if (legalCase.outcome) {
        const isSettled = legalCase.outcome === CaseOutcome.SETTLED;
        events.push({
            id: 'auto-case-outcome',
            case_id: legalCase.id,
            title: isSettled ? 'Acordo Formalizado' : 'Sentença Proferida',
            description: `Desfecho: ${getOutcomeLabel(legalCase.outcome)}.`,
            type: isSettled ? HistoryType.SETTLEMENT : HistoryType.SENTENCE,
            date: legalCase.updated_at,
            created_at: legalCase.updated_at,
            is_system_event: true
        });
    }

    return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [history, legalCase, clientDetails]);

  const handleAddHistory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemTitle) return;
    const result = await addHistoryItem({ title: newItemTitle, description: newItemDesc, type: newItemType, date: newItemDate });
    if (result.success) {
        setIsAddingNote(false);
        setNewItemTitle('');
        setNewItemDesc('');
        setNewItemType(HistoryType.NOTE);
    }
  };

  const getTypeIcon = (type: HistoryType) => {
    switch (type) {
        case HistoryType.PETITION: return <FileText className="w-3.5 h-3.5" />;
        case HistoryType.SENTENCE: return <Gavel className="w-3.5 h-3.5" />;
        case HistoryType.HEARING: return <Calendar className="w-3.5 h-3.5" />;
        case HistoryType.SETTLEMENT: return <Award className="w-3.5 h-3.5" />;
        case HistoryType.ARCHIVE: return <Box className="w-3.5 h-3.5" />;
        default: return <Clock className="w-3.5 h-3.5" />;
    }
  };

  const getTypeColor = (type: HistoryType) => {
    switch(type) {
        case HistoryType.SENTENCE: return "text-yellow-600 bg-yellow-50";
        case HistoryType.HEARING: return "text-orange-600 bg-orange-50";
        case HistoryType.SETTLEMENT: return "text-emerald-600 bg-emerald-50";
        case HistoryType.PETITION: return "text-blue-600 bg-blue-50";
        default: return "text-gray-500 bg-gray-50";
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-3 bg-white hover:bg-gray-100 rounded-2xl shadow-sm border border-gray-100 transition-all text-gray-500">
                <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
                <h1 className="text-xl font-black text-gray-900 tracking-tight leading-none uppercase">{legalCase.title}</h1>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">PROCESSO: {legalCase.case_number}</p>
            </div>
        </div>
        <button onClick={onEdit} className="px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-brand-gold bg-[#131313] rounded-xl border border-brand-gold/20 shadow-xl">
            Ajustar Dados
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
            <div className="bg-white p-6 rounded-[2rem] shadow-xl border border-gray-100">
                <h3 className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Cliente</h3>
                {clientDetails && (
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-[#131313] flex items-center justify-center text-brand-gold font-black text-lg border border-brand-gold/30 shadow-lg">
                            {clientDetails.name.charAt(0)}
                        </div>
                        <div className="overflow-hidden">
                            <p className="font-black text-gray-900 truncate text-sm tracking-tight">{clientDetails.name}</p>
                            <p className="text-[9px] text-brand-gold font-bold uppercase tracking-widest">{clientDetails.phone}</p>
                        </div>
                    </div>
                )}
            </div>
            <div className="bg-[#131313] p-6 rounded-[2rem] shadow-2xl border border-brand-gold/10">
                <h3 className="text-[9px] font-black text-brand-gold/50 uppercase tracking-[0.2em] mb-4">Financeiro</h3>
                <div className="space-y-4">
                    <div>
                        <p className="text-[8px] text-white/40 font-black uppercase tracking-widest">Valor Causa</p>
                        <p className="text-md font-black text-white">{legalCase.value?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || 'R$ 0,00'}</p>
                    </div>
                    <div>
                        <p className="text-[8px] text-brand-gold/40 font-black uppercase tracking-widest">Honorários</p>
                        <p className="text-md font-black text-brand-gold">{legalCase.fee?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || 'R$ 0,00'}</p>
                    </div>
                    <div>
                        <p className="text-[8px] text-white/40 font-black uppercase tracking-widest">Resultado</p>
                        <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${legalCase.outcome === CaseOutcome.WON ? 'text-green-400' : legalCase.outcome === CaseOutcome.LOST ? 'text-red-400' : 'text-brand-gold'}`}>
                            {getOutcomeLabel(legalCase.outcome)}
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <div className="lg:col-span-3">
             <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[650px]">
                 <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/20">
                     <h3 className="font-black text-gray-900 text-sm flex items-center uppercase tracking-[0.2em]">
                        <History className="w-4 h-4 text-brand-gold mr-3" />
                        Cronologia Processual
                     </h3>
                     <button 
                        onClick={() => setIsAddingNote(!isAddingNote)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                            isAddingNote ? 'bg-gray-100 text-gray-500' : 'bg-[#131313] text-brand-gold'
                        }`}
                     >
                         {isAddingNote ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                         {isAddingNote ? 'Cancelar' : 'Novo Registro'}
                     </button>
                 </div>

                 {isAddingNote && (
                     <div className="p-8 border-b border-gray-100 bg-brand-gold/5 animate-in slide-in-from-top-4">
                         <form onSubmit={handleAddHistory} className="space-y-4">
                             <div className="grid grid-cols-3 gap-4">
                                 {/* Fix: use setNewItemTitle instead of calling newItemTitle directly */}
                                 <input type="text" placeholder="Título do Registro..." className="col-span-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold" value={newItemTitle} onChange={(e) => setNewItemTitle(e.target.value)}/>
                                 {/* Fix: use setNewItemDate instead of calling newItemDate directly */}
                                 <input type="date" className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs" value={newItemDate} onChange={(e) => setNewItemDate(e.target.value)}/>
                             </div>
                             <div className="flex gap-4 items-center">
                                 <select className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-[10px] font-black uppercase" value={newItemType} onChange={(e) => setNewItemType(e.target.value as HistoryType)}>
                                     <option value={HistoryType.NOTE}>Nota Interna</option>
                                     <option value={HistoryType.DISPATCH}>Despacho</option>
                                     <option value={HistoryType.SENTENCE}>Sentença</option>
                                     <option value={HistoryType.HEARING}>Audiência</option>
                                 </select>
                                 <button type="submit" className="px-8 py-2.5 bg-[#131313] text-brand-gold font-black uppercase text-[10px] tracking-widest rounded-xl">Registrar</button>
                             </div>
                         </form>
                     </div>
                 )}

                 <div className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-gray-50/20">
                     <div className="space-y-2">
                         {unifiedTimeline.map((item) => (
                             <div key={item.id} className="flex gap-8 group">
                                 <div className="w-20 shrink-0 text-right pt-2">
                                     <p className="text-[12px] font-black text-gray-900 leading-none">{new Date(item.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</p>
                                     <p className="text-[9px] font-black text-gray-300 uppercase mt-1 tracking-widest">{new Date(item.date).getFullYear()}</p>
                                 </div>
                                 <div className="relative flex flex-col items-center">
                                     <div className={`w-3.5 h-3.5 rounded-full mt-2.5 z-10 border-2 border-white shadow-md bg-brand-gold`}></div>
                                     <div className="w-0.5 h-full bg-gray-200 absolute top-2.5"></div>
                                 </div>
                                 <div className="flex-1 pb-10 pt-1">
                                     <div className="flex items-center justify-between">
                                         <div className="flex items-center gap-3">
                                             <div className={`p-1.5 rounded-lg ${getTypeColor(item.type)}`}>{getTypeIcon(item.type)}</div>
                                             <h4 className="text-sm font-black text-gray-800 uppercase tracking-tight">
                                                 {item.title}
                                                 {item.is_system_event && <span className="ml-3 text-[8px] text-brand-gold/60 font-black uppercase tracking-[0.2em]">[Auto]</span>}
                                             </h4>
                                         </div>
                                         {!item.is_system_event && (
                                             <button onClick={() => deleteHistoryItem(item.id)} className="opacity-0 group-hover:opacity-100 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                                         )}
                                     </div>
                                     {item.description && (
                                         <p className="text-[12px] text-gray-500 font-medium mt-3 pl-8 border-l-2 border-brand-gold/10 ml-3.5 leading-relaxed italic">{item.description}</p>
                                     )}
                                 </div>
                             </div>
                         ))}
                     </div>
                 </div>
             </div>
        </div>
      </div>
    </div>
  );
};

export default CaseDetails;
