import React, { useEffect, useState } from 'react';
import { useCases } from '../hooks/useCases';
import { useClients } from '../hooks/useClients';
import { useAgenda } from '../hooks/useAgenda'; // Importa hook da agenda
import { Clock, Calendar as CalendarIcon, Briefcase, Users, Phone, FileText } from 'lucide-react';

interface ScheduleItem {
  id: string;
  title: string;
  date: string; // ISO String
  type: 'hearing' | 'meeting' | 'deadline' | 'call' | 'conference';
  source: 'case' | 'agenda';
  subtitle: string;
  status?: string;
  priority?: string;
  time?: string;
}

const Prazos: React.FC = () => {
  const { cases, loading: casesLoading, fetchCases } = useCases();
  const { clients, fetchClients } = useClients();
  const { events, fetchEvents, loading: agendaLoading } = useAgenda(); // Usa eventos reais da agenda

  const [filter, setFilter] = useState('all');
  const [items, setItems] = useState<ScheduleItem[]>([]);

  useEffect(() => {
    fetchCases();
    fetchClients();
    fetchEvents();
  }, [fetchCases, fetchClients, fetchEvents]);

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : 'Cliente não encontrado';
  };

  // Merge Cases and Agenda Events
  useEffect(() => {
    if (cases && events) {
      // 1. Transformar Processos em Itens de Agenda
      const caseItems: ScheduleItem[] = cases
        .filter(c => c.next_hearing)
        .map(c => ({
          id: c.id,
          title: `Audiência: ${c.title}`,
          date: c.next_hearing!,
          type: 'hearing',
          source: 'case',
          subtitle: `Proc. ${c.case_number} | ${getClientName(c.client_id)}`,
          status: c.status,
          priority: c.priority,
          time: new Date(c.next_hearing!).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        }));

      // 2. Transformar Eventos da Agenda (do useAgenda) em Itens
      const agendaItems: ScheduleItem[] = events.map(e => ({
          id: String(e.id),
          title: e.title,
          date: `${e.date}T${e.time}:00`, // Constrói ISO para ordenação
          type: e.type as any,
          source: 'agenda',
          subtitle: e.client ? `Cliente: ${e.client}` : `Local: ${e.location || 'N/A'}`,
          time: e.time
      }));

      // 3. Combinar e Ordenar
      const combined = [...caseItems, ...agendaItems].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      setItems(combined);
    }
  }, [cases, clients, events]);

  const filteredItems = items.filter(item => {
      const itemDate = new Date(item.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const diffTime = itemDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

      const isSameDay = itemDate.getDate() === today.getDate() && 
                        itemDate.getMonth() === today.getMonth() && 
                        itemDate.getFullYear() === today.getFullYear();

      if (filter === 'today') return isSameDay;
      if (filter === 'week') return diffDays <= 7 && diffDays >= 0;
      if (filter === 'month') return diffDays <= 30 && diffDays >= 0;
      if (filter === 'overdue') return diffTime < 0 && !isSameDay;
      
      return true;
  });

  const getStatusBadge = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0,0,0,0); 
    
    const isPast = date.getTime() < new Date().getTime();
    const isToday = date.toDateString() === new Date().toDateString();

    if (isPast && !isToday) return { text: 'Atrasado', color: 'bg-red-100 text-red-800 border-red-200' };
    if (isToday) return { text: 'Hoje', color: 'bg-green-100 text-green-800 border-green-200' };
    
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    if (diffDays <= 3) return { text: 'Próximo', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
    
    return { text: 'Futuro', color: 'bg-blue-50 text-blue-700 border-blue-100' };
  };

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'hearing': return <Briefcase className="w-5 h-5 text-purple-600" />;
      case 'meeting': return <Users className="w-5 h-5 text-blue-600" />;
      case 'call': return <Phone className="w-5 h-5 text-green-600" />;
      case 'deadline': return <FileText className="w-5 h-5 text-orange-600" />;
      case 'conference': return <Users className="w-5 h-5 text-teal-600" />;
      default: return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch(type) {
      case 'hearing': return 'Audiência';
      case 'meeting': return 'Reunião';
      case 'call': return 'Ligação';
      case 'deadline': return 'Prazo Fatal';
      case 'conference': return 'Conferência';
      default: return 'Compromisso';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Prazos e Audiências</h1>
        <p className="mt-1 text-sm text-gray-500">Controle unificado de processos e compromissos da agenda</p>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 overflow-x-auto">
        <div className="flex space-x-2 min-w-max">
          {['all', 'today', 'week', 'month', 'overdue'].map((f) => (
             <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === f 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {f === 'all' ? 'Todos' : 
                 f === 'today' ? 'Hoje' :
                 f === 'week' ? 'Esta Semana' :
                 f === 'month' ? 'Este Mês' : 'Atrasados'}
              </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Lista de Compromissos */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-blue-500 bg-blue-600 flex justify-between items-center">
             <h2 className="font-semibold text-white flex items-center">
               <Clock className="w-5 h-5 mr-2 text-white" />
               Lista de Compromissos
             </h2>
             <span className="bg-white text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
               {filteredItems.length}
             </span>
          </div>

          {(casesLoading || agendaLoading) && items.length === 0 ? (
             <div className="p-12 text-center text-gray-400">Carregando...</div>
          ) : filteredItems.length === 0 ? (
             <div className="p-12 text-center text-gray-400 flex flex-col items-center">
               <CalendarIcon className="w-12 h-12 mb-3 text-gray-300" />
               <p>Nenhum compromisso encontrado para este filtro.</p>
             </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredItems.map((item) => {
                const status = getStatusBadge(item.date);
                
                return (
                  <div key={item.id} className="p-5 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg bg-gray-50 border border-gray-200 shrink-0`}>
                             {getTypeIcon(item.type)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-base font-semibold text-gray-900">
                                    {item.title}
                                </h3>
                                <span className={`text-[10px] uppercase font-bold px-1.5 rounded border ${
                                    item.source === 'case' ? 'text-purple-600 border-purple-200 bg-purple-50' : 'text-blue-600 border-blue-200 bg-blue-50'
                                }`}>
                                    {item.source === 'case' ? 'Processo' : 'Agenda'}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 mt-0.5">{item.subtitle}</p>
                            <span className="inline-block mt-1 text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                {getTypeLabel(item.type)}
                            </span>
                          </div>
                      </div>
                      
                      <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pl-12 sm:pl-0">
                        <div className="text-right">
                          <div className="text-sm font-bold text-gray-900">
                            {new Date(item.date).toLocaleDateString('pt-BR')}
                          </div>
                          <div className="text-xs text-gray-500">
                            {item.time || new Date(item.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                        {status && (
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full border whitespace-nowrap ${status.color}`}>
                            {status.text}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Mini Calendar Visualization */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-fit">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center">
             <CalendarIcon className="w-5 h-5 mr-2 text-gray-500" />
             Visão Mensal
          </h2>
          <div className="grid grid-cols-7 gap-2 text-sm">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
              <div key={day} className="text-center font-medium text-gray-400 py-1">
                {day.charAt(0)}
              </div>
            ))}
            {Array.from({ length: 35 }).map((_, index) => {
              const day = index + 1;
              const dateToCheck = new Date();
              dateToCheck.setDate(day);
              
              const hasItem = items.some(i => {
                const d = new Date(i.date);
                return d.getDate() === day && d.getMonth() === new Date().getMonth();
              });

              const typesOnDay = items.filter(i => {
                const d = new Date(i.date);
                return d.getDate() === day && d.getMonth() === new Date().getMonth();
              }).map(i => i.type);
              
              let dotColor = 'bg-gray-300';
              if (typesOnDay.includes('hearing')) dotColor = 'bg-purple-500';
              else if (typesOnDay.includes('deadline')) dotColor = 'bg-orange-500';
              else if (typesOnDay.includes('meeting')) dotColor = 'bg-blue-500';

              const isToday = new Date().getDate() === day;

              return (
                <div
                  key={index}
                  className={`
                    relative flex flex-col items-center justify-center py-2 rounded-lg text-xs cursor-default h-10
                    ${day > 31 ? 'invisible' : ''}
                    ${isToday ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200' : 'text-gray-700 hover:bg-gray-50'}
                  `}
                >
                  <span className="z-10">{day <= 31 ? day : ''}</span>
                  {hasItem && day <= 31 && (
                      <span className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-6 space-y-2 text-xs text-gray-500">
            <div className="flex items-center">
               <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
               <span>Audiências (Processos)</span>
            </div>
            <div className="flex items-center">
               <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
               <span>Agenda (Reuniões)</span>
            </div>
             <div className="flex items-center">
               <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
               <span>Prazos</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Prazos;