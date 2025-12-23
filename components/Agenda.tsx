
import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, MapPin, X, Save, PlusCircle, Loader2, Clock, User, Info, RefreshCw } from 'lucide-react';
import { useAgenda } from '../hooks/useAgenda';
import { useCases } from '../hooks/useCases';
import { SystemSetup } from './SystemSetup';

interface AgendaProps {
  onNavigate: (view: string, caseId?: string) => void;
}

const Agenda: React.FC<AgendaProps> = ({ onNavigate }) => {
  const { events, fetchEvents, addEvent, loading: agendaLoading, error: agendaError } = useAgenda();
  const { cases, fetchCases } = useCases();
  
  const [currentViewDate, setCurrentViewDate] = useState(new Date());
  const [unifiedEvents, setUnifiedEvents] = useState<any[]>([]);
  
  // Função para garantir formato YYYY-MM-DD sem shift de timezone
  const getLocalISO = (dateInput: any) => {
    if (!dateInput) return '';
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '';
    
    // Se for string do Supabase tipo "2023-10-25" (sem T), retorna direto
    if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
        return dateInput;
    }

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [selectedDate, setSelectedDate] = useState(getLocalISO(new Date()));

  const refreshData = () => {
    fetchEvents();
    fetchCases();
  };

  useEffect(() => {
    refreshData();
  }, []);

  useEffect(() => {
    const manualEvents = (events || []).map(e => ({
      ...e,
      source: 'manual',
      displayType: e.type,
      normalizedDate: getLocalISO(e.date)
    }));

    const caseEvents = (cases || [])
      .filter(c => c.next_hearing)
      .map(c => {
        const hearingDate = new Date(c.next_hearing!);
        return {
          id: `case-${c.id}`,
          caseId: c.id,
          title: `Audiência: ${c.title}`,
          client: c.clients?.name || 'Cliente Vinculado',
          type: 'hearing',
          source: 'processo',
          displayType: 'hearing',
          date: getLocalISO(hearingDate),
          normalizedDate: getLocalISO(hearingDate),
          time: hearingDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          location: c.court || 'Tribunal / Online'
        };
      });

    const all = [...manualEvents, ...caseEvents].filter(e => e.normalizedDate !== '');
    setUnifiedEvents(all);
  }, [events, cases]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    client: '',
    type: 'meeting',
    date: selectedDate,
    time: '',
    location: ''
  });

  useEffect(() => {
    setNewEvent(prev => ({ ...prev, date: selectedDate }));
  }, [selectedDate]);

  const nextMonth = () => setCurrentViewDate(prev => { const n = new Date(prev); n.setMonth(n.getMonth() + 1); return n; });
  const prevMonth = () => setCurrentViewDate(prev => { const n = new Date(prev); n.setMonth(n.getMonth() - 1); return n; });

  const year = currentViewDate.getFullYear();
  const month = currentViewDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

  const getEventColor = (type: string) => {
    switch (type) {
      case 'hearing': return 'bg-red-50 text-red-700 border-l-4 border-red-500';
      case 'meeting': return 'bg-blue-50 text-blue-700 border-l-4 border-blue-500';
      case 'deadline': return 'bg-yellow-50 text-yellow-700 border-l-4 border-yellow-500';
      default: return 'bg-gray-50 text-gray-700 border-l-4 border-gray-500';
    }
  };

  const filteredEvents = unifiedEvents
    .filter(e => e.normalizedDate === selectedDate)
    .sort((a, b) => (a.time || '').localeCompare(b.time || ''));

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.date) return;
    setIsSaving(true);
    const result = await addEvent(newEvent as any);
    setIsSaving(false);
    if (result.success) {
        setIsModalOpen(false);
        setNewEvent({ title: '', client: '', type: 'meeting', date: selectedDate, time: '', location: '' });
        refreshData();
    } else {
      alert("Erro ao salvar: " + result.error);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in max-w-6xl mx-auto">
      {agendaError === 'tabela_missing' && <SystemSetup />}
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Agenda Unificada</h1>
          <p className="mt-1 text-[10px] text-gray-500 font-black uppercase tracking-widest opacity-60">Gestão de prazos e audiências</p>
        </div>
        <div className="flex gap-3">
          <button onClick={refreshData} className="p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-400 transition-all shadow-sm">
             <RefreshCw className={`w-4 h-4 ${agendaLoading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={() => setIsModalOpen(true)} className="px-6 py-3 bg-[#131313] text-brand-gold border border-brand-gold/20 rounded-xl shadow-xl hover:bg-black text-[10px] font-black uppercase tracking-widest transition-all">
            <PlusCircle className="w-4 h-4 mr-2" /> Novo Agendamento
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8">
           <div className="flex justify-between items-center mb-8">
             <div className="flex items-center gap-4">
                <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><ChevronLeft className="w-5 h-5"/></button>
                <span className="font-black text-gray-900 uppercase tracking-[0.2em] text-xs">{currentViewDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</span>
                <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><ChevronRight className="w-5 h-5"/></button>
             </div>
             <div className="text-[10px] font-black text-brand-gold bg-brand-gold/10 px-4 py-1.5 rounded-full uppercase tracking-widest">
                {unifiedEvents.length} Eventos Sincronizados
             </div>
           </div>

           <div className="grid grid-cols-7 gap-2">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => <div key={d} className="text-center text-[9px] font-black text-gray-300 uppercase tracking-widest mb-4">{d}</div>)}
              {calendarDays.map((day, i) => {
                 if (day === null) return <div key={i} className="h-20 bg-gray-50/30 rounded-2xl" />;
                 const cellDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                 const isSelected = cellDate === selectedDate;
                 const daysEvents = unifiedEvents.filter(e => e.normalizedDate === cellDate);
                 const isToday = cellDate === getLocalISO(new Date());

                 return (
                 <div key={i} onClick={() => setSelectedDate(cellDate)} className={`h-20 border-2 rounded-2xl p-3 relative cursor-pointer transition-all ${isSelected ? 'border-brand-gold bg-brand-gold/5 shadow-inner' : 'border-gray-50 bg-white hover:border-gray-200'}`}>
                    <span className={`block w-6 h-6 text-center leading-6 rounded-lg font-black text-[10px] ${isToday ? 'bg-brand-gold text-[#131313]' : 'text-gray-800'}`}>{day}</span>
                    <div className="flex flex-wrap gap-1 mt-2">
                       {daysEvents.slice(0, 3).map(evt => <div key={evt.id} className={`h-1 w-1 rounded-full ${evt.displayType === 'hearing' ? 'bg-red-500' : 'bg-brand-gold'}`} title={evt.title} />)}
                    </div>
                 </div>
              )})}
           </div>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden flex flex-col h-[600px]">
          <div className="p-8 border-b border-brand-gold/10 bg-[#131313]">
             <h3 className="font-black text-brand-gold text-sm uppercase tracking-widest">Compromissos do Dia</h3>
             <p className="text-[9px] text-white/40 font-black uppercase tracking-[0.2em] mt-2">
                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
             </p>
          </div>
          <div className="p-6 space-y-4 overflow-y-auto flex-1 custom-scrollbar bg-gray-50/20">
             {agendaLoading ? <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-gold w-6 h-6"/></div> : 
             filteredEvents.length === 0 ? <div className="text-center py-20 text-gray-300 font-black text-[9px] uppercase tracking-widest px-10">Nenhum compromisso para este dia no banco de dados</div> :
             filteredEvents.map(event => (
                <div key={event.id} onClick={() => event.caseId ? onNavigate('cases', event.caseId) : null} className={`p-5 rounded-2xl border bg-white shadow-sm transition-all hover:-translate-y-1 group ${event.caseId ? 'cursor-pointer' : ''} ${getEventColor(event.displayType)}`}>
                    <div className="flex justify-between items-start mb-3">
                        <span className="font-black text-[10px] text-gray-900">{event.time || 'Dia todo'}</span>
                        <span className={`text-[8px] uppercase font-black tracking-widest border border-current px-2 py-0.5 rounded-lg`}>{event.displayType}</span>
                    </div>
                    <h4 className="font-black text-xs text-gray-900 mb-1 group-hover:text-brand-gold transition-colors">{event.title}</h4>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tight mb-3">{event.client}</p>
                    <div className="flex items-center text-[8px] font-black text-gray-400 uppercase pt-3 border-t border-gray-50">
                        <MapPin className="w-3 h-3 mr-1 text-brand-gold" />
                        <span className="truncate">{event.location || 'Local não definido'}</span>
                    </div>
                </div>
             ))}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20">
              <div className="bg-[#131313] px-8 py-6 flex justify-between items-center border-b border-brand-gold/20">
                <h3 className="text-sm font-black text-brand-gold uppercase tracking-widest">Novo Agendamento</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-white/40 hover:text-white transition-all"><X className="h-5 w-5" /></button>
              </div>
              
              <div className="p-8">
                <form onSubmit={handleSaveEvent} className="space-y-4">
                   <div>
                      <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Título</label>
                      <input 
                        type="text" required placeholder="Ex: Reunião com Cliente"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-brand-gold/20 outline-none"
                        value={newEvent.title}
                        onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                      />
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div>
                         <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Data</label>
                         <input 
                            type="date" required
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold focus:bg-white outline-none"
                            value={newEvent.date}
                            onChange={e => setNewEvent({...newEvent, date: e.target.value})}
                         />
                      </div>
                      <div>
                         <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Hora</label>
                         <input 
                            type="time"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold focus:bg-white outline-none"
                            value={newEvent.time}
                            onChange={e => setNewEvent({...newEvent, time: e.target.value})}
                         />
                      </div>
                   </div>

                   <div>
                      <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Tipo</label>
                      <select 
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest focus:bg-white outline-none appearance-none"
                        value={newEvent.type}
                        onChange={e => setNewEvent({...newEvent, type: e.target.value as any})}
                      >
                        <option value="meeting">Reunião</option>
                        <option value="hearing">Audiência</option>
                        <option value="deadline">Prazo</option>
                        <option value="call">Ligação</option>
                        <option value="conference">Conferência</option>
                      </select>
                   </div>

                   <button 
                      type="submit" disabled={isSaving}
                      className="w-full py-4 bg-[#131313] text-brand-gold rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all flex items-center justify-center active:scale-95 disabled:opacity-50"
                   >
                      {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                      Salvar Agendamento
                   </button>
                </form>
              </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Agenda;
