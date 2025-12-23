
import React, { useEffect, useState, useCallback } from 'react';
import { useClients } from '../hooks/useClients';
import { useCases } from '../hooks/useCases';
import { useAgenda } from '../hooks/useAgenda';
import { Users, Scale, Clock, Calendar, Bot, ChevronRight, Loader2, RefreshCw } from 'lucide-react';

interface DashboardProps {
  onNavigate: (view: string, caseId?: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { clients, fetchClients, loading: loadingClients } = useClients();
  const { cases, fetchCases, loading: loadingCases } = useCases();
  const { events, fetchEvents, loading: loadingEvents } = useAgenda();
  
  const [stats, setStats] = useState({
    totalClients: 0,
    activeCases: 0,
    pendingDeadlines: 0,
    upcomingEvents: 0
  });

  const [combinedUpcoming, setCombinedUpcoming] = useState<any[]>([]);

  const refreshAllData = useCallback(() => {
    fetchClients();
    fetchCases();
    fetchEvents();
  }, [fetchClients, fetchCases, fetchEvents]);

  useEffect(() => {
    refreshAllData();
  }, []);

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const agendaItems = (events || []).map(e => ({
      id: `evt-${e.id}`,
      title: e.title,
      date: e.date,
      time: e.time,
      type: 'agenda',
      rawDate: new Date(`${e.date}T${e.time || '00:00'}:00`)
    }));

    const caseItems = (cases || [])
      .filter(c => c.next_hearing)
      .map(c => {
          const hDate = new Date(c.next_hearing!);
          return {
            id: `case-${c.id}`,
            caseId: c.id,
            title: `Audiência: ${c.title}`,
            date: hDate.toISOString().split('T')[0],
            time: hDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            type: 'hearing',
            rawDate: hDate
          };
      });

    const allUpcoming = [...agendaItems, ...caseItems]
      .filter(item => !isNaN(item.rawDate.getTime()) && item.rawDate >= today)
      .sort((a, b) => a.rawDate.getTime() - b.rawDate.getTime());

    setCombinedUpcoming(allUpcoming.slice(0, 5));

    setStats({
      totalClients: clients.length,
      activeCases: cases.filter(c => c.status !== 'closed' && c.status !== 'archived').length,
      pendingDeadlines: cases.filter(c => c.priority === 'urgent' || c.priority === 'high').length, 
      upcomingEvents: allUpcoming.length
    });
  }, [clients, cases, events]);

  const isLoading = loadingClients || loadingCases || loadingEvents;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto py-2">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Painel de Controle</h1>
          <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest opacity-70">Escritório Digital de Performance</p>
        </div>
        <div className="flex gap-2">
            <button onClick={refreshAllData} className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-400 transition-all shadow-sm">
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={() => onNavigate('ai_assistant')} className="flex items-center px-6 py-2.5 bg-[#131313] text-brand-gold border border-brand-gold/20 rounded-xl hover:bg-black transition-all font-bold shadow-lg text-[9px] uppercase tracking-widest">
               <Bot className="w-3.5 h-3.5 mr-2" /> Assistência IA
            </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
            { name: 'Clientes', value: stats.totalClients, icon: Users, color: 'text-blue-600 bg-blue-50', link: 'clients' },
            { name: 'Processos', value: stats.activeCases, icon: Scale, color: 'text-brand-gold bg-brand-gold/5', link: 'cases' },
            { name: 'Urgências', value: stats.pendingDeadlines, icon: Clock, color: 'text-orange-600 bg-orange-50', link: 'deadlines' },
            { name: 'Agenda', value: stats.upcomingEvents, icon: Calendar, color: 'text-green-600 bg-green-50', link: 'agenda' },
        ].map((stat) => (
          <div key={stat.name} onClick={() => onNavigate(stat.link)} className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group">
            <div className="flex items-center justify-between mb-4">
               <div className={`p-2.5 rounded-2xl ${stat.color} shadow-sm border border-black/5`}><stat.icon className="h-3.5 h-3.5" /></div>
               <ChevronRight className="h-3 w-3 text-gray-300 group-hover:text-brand-gold group-hover:translate-x-1 transition-all" />
            </div>
            <div>
               <p className="text-2xl font-black text-gray-900 leading-none">{isLoading ? <Loader2 className="w-4 h-4 animate-spin text-gray-200" /> : stat.value}</p>
               <p className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em] mt-2">{stat.name}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-[#131313] p-8 rounded-[2.5rem] border border-brand-gold/10 shadow-2xl flex flex-col justify-between min-h-[300px]">
           <div className="mb-8">
             <h2 className="text-lg font-bold text-brand-gold tracking-tight">Atalhos Sênior</h2>
             <p className="text-white/30 text-[9px] font-black uppercase tracking-[0.2em] mt-1">Ações de Resposta Rápida</p>
           </div>
           <div className="space-y-3">
              <button onClick={() => onNavigate('clients')} className="w-full flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-brand-gold/10 group transition-all border border-white/5 hover:border-brand-gold/20">
                 <span className="font-black text-gray-300 text-[9px] uppercase tracking-widest">Novo Cliente</span>
                 <Users className="w-3.5 h-3.5 text-gray-600 group-hover:text-brand-gold" />
              </button>
              <button onClick={() => onNavigate('cases')} className="w-full flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-brand-gold/10 group transition-all border border-white/5 hover:border-brand-gold/20">
                 <span className="font-black text-gray-300 text-[9px] uppercase tracking-widest">Novo Processo</span>
                 <Scale className="w-3.5 h-3.5 text-gray-600 group-hover:text-brand-gold" />
              </button>
           </div>
        </div>

        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col min-h-[300px]">
           <div className="flex items-center justify-between w-full mb-6">
              <h2 className="text-lg font-bold text-gray-900 tracking-tight flex items-center">
                 <Calendar className="w-4 h-4 text-brand-gold mr-4" />
                 Próximos Compromissos
              </h2>
           </div>
           
           <div className="flex-1 space-y-3">
              {combinedUpcoming.length > 0 ? (
                combinedUpcoming.map(e => (
                  <div key={e.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-brand-gold/20 transition-all group">
                     <div className="flex items-center gap-4">
                        <div className={`w-1.5 h-1.5 rounded-full ${e.type === 'hearing' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-brand-gold shadow-[0_0_8px_rgba(197,160,89,0.5)]'}`}></div>
                        <div className="flex flex-col">
                           <span className="text-sm font-black text-gray-800 tracking-tight line-clamp-1 group-hover:text-brand-gold transition-colors">{e.title}</span>
                           <span className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">
                             {new Date(e.rawDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
                           </span>
                        </div>
                     </div>
                     <div className="text-right">
                        <span className="text-[10px] font-black text-gray-900 bg-white px-3 py-1.5 rounded-xl border border-gray-100 shadow-sm">{e.time || '--:--'}</span>
                     </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center py-12 text-gray-200">
                   <Calendar className="w-8 h-8 mb-3 opacity-20" />
                   <p className="text-[9px] font-black uppercase tracking-[0.2em]">Sem compromissos no banco</p>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
