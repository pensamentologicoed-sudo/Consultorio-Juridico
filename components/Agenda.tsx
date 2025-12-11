import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock, MapPin, X, Save, PlusCircle, Loader2 } from 'lucide-react';
import { useAgenda, AgendaEvent } from '../hooks/useAgenda';

const Agenda: React.FC = () => {
  const { events, fetchEvents, addEvent, loading: agendaLoading } = useAgenda();
  
  const [view, setView] = useState('day');
  const [currentViewDate, setCurrentViewDate] = useState(new Date());
  
  const todayISO = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayISO);

  // Carregar eventos ao montar
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Modal State
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

  // Navegação do Calendário
  const nextMonth = () => {
    setCurrentViewDate(prev => {
      const next = new Date(prev);
      next.setMonth(next.getMonth() + 1);
      return next;
    });
  };

  const prevMonth = () => {
    setCurrentViewDate(prev => {
      const next = new Date(prev);
      next.setMonth(next.getMonth() - 1);
      return next;
    });
  };

  // Cálculos do Grid do Calendário
  const year = currentViewDate.getFullYear();
  const month = currentViewDate.getMonth(); // 0-indexed
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sunday

  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

  const getEventColor = (type: string) => {
    switch (type) {
      case 'hearing': return 'bg-red-50 text-red-700 border-l-4 border-red-500';
      case 'meeting': return 'bg-blue-50 text-blue-700 border-l-4 border-blue-500';
      case 'deadline': return 'bg-yellow-50 text-yellow-700 border-l-4 border-yellow-500';
      case 'conference': return 'bg-green-50 text-green-700 border-l-4 border-green-500';
      default: return 'bg-gray-50 text-gray-700 border-l-4 border-gray-500';
    }
  };

  const getDotColor = (type: string) => {
    switch (type) {
      case 'hearing': return 'bg-red-400';
      case 'meeting': return 'bg-blue-400';
      case 'deadline': return 'bg-yellow-400';
      case 'conference': return 'bg-green-400';
      default: return 'bg-gray-400';
    }
  };

  const getEventTypeLabel = (type: string) => {
      switch(type) {
          case 'hearing': return 'Audiência';
          case 'meeting': return 'Reunião';
          case 'deadline': return 'Prazo';
          case 'conference': return 'Conferência';
          default: return 'Outro';
      }
  };

  const getFilteredEvents = () => {
    if (view === 'day') {
      return events.filter(e => e.date === selectedDate);
    } 
    if (view === 'week') {
      const curr = new Date(selectedDate + 'T00:00:00');
      const day = curr.getDay();
      const firstDay = new Date(curr);
      firstDay.setDate(curr.getDate() - day);
      firstDay.setHours(0, 0, 0, 0);
      const lastDay = new Date(curr);
      lastDay.setDate(curr.getDate() + (6 - day));
      lastDay.setHours(23, 59, 59, 999);
      return events.filter(e => {
        const eventDate = new Date(e.date + 'T00:00:00');
        return eventDate >= firstDay && eventDate <= lastDay;
      });
    }
    if (view === 'month') {
      return events.filter(e => {
        const eventDate = new Date(e.date + 'T00:00:00');
        return eventDate.getMonth() === currentViewDate.getMonth() && 
               eventDate.getFullYear() === currentViewDate.getFullYear();
      });
    }
    return [];
  };

  const filteredEvents = getFilteredEvents().sort((a,b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.time.localeCompare(b.time);
  });

  const getDisplayTitle = () => {
    if (view === 'day') {
      const dateObj = new Date(selectedDate + 'T00:00:00');
      const formatted = dateObj.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
      return formatted.charAt(0).toUpperCase() + formatted.slice(1);
    }
    if (view === 'week') return 'Esta Semana';
    if (view === 'month') return currentViewDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    return 'Compromissos';
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.date || !newEvent.time) {
        alert("Preencha os campos obrigatórios.");
        return;
    }
    
    setIsSaving(true);
    const result = await addEvent(newEvent as any);
    setIsSaving(false);

    if (result.success) {
        setIsModalOpen(false);
        setNewEvent({ title: '', client: '', type: 'meeting', date: selectedDate, time: '', location: '' });
    } else {
        alert("Erro ao salvar: " + result.error);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
          <p className="mt-1 text-sm text-gray-500">Organização de compromissos diários</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 text-sm font-medium flex items-center"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Novo Evento
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex bg-gray-100 p-1 rounded-lg">
            {['day', 'week', 'month'].map((v) => (
               <button
                 key={v}
                 onClick={() => setView(v)}
                 className={`px-4 py-1.5 text-sm font-medium rounded-md capitalize transition-all ${
                    view === v ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                 }`}
               >
                 {v === 'day' ? 'Dia' : v === 'week' ? 'Semana' : 'Mês'}
               </button>
            ))}
          </div>
          <div className="flex items-center space-x-4 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
            <button onClick={prevMonth} className="p-1 hover:bg-gray-200 rounded-full"><ChevronLeft className="w-5 h-5 text-gray-600" /></button>
            <span className="font-semibold text-gray-900 capitalize min-w-[140px] text-center">
                {currentViewDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </span>
            <button onClick={nextMonth} className="p-1 hover:bg-gray-200 rounded-full"><ChevronRight className="w-5 h-5 text-gray-600" /></button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
           <div className="grid grid-cols-7 gap-1 mb-2">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
                 <div key={d} className="text-center text-xs font-semibold text-gray-400 py-2">{d}</div>
              ))}
           </div>
           
           <div className="grid grid-cols-7 gap-1 auto-rows-fr">
              {calendarDays.map((day, i) => {
                 if (day === null) {
                    return <div key={i} className="h-24 bg-gray-50/50 rounded-lg" />;
                 }

                 const viewMonthStr = String(month + 1).padStart(2, '0');
                 const dayStr = String(day).padStart(2, '0');
                 const cellDate = `${year}-${viewMonthStr}-${dayStr}`;
                 
                 const isToday = cellDate === todayISO;
                 const isSelected = cellDate === selectedDate;
                 
                 const daysEvents = events.filter(e => e.date === cellDate);

                 return (
                 <div 
                    key={i} 
                    onClick={() => setSelectedDate(cellDate)}
                    className={`
                    h-24 border rounded-lg p-2 text-sm relative group transition-all cursor-pointer
                    ${isSelected ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-300 z-10' : 'bg-white border-gray-100 hover:border-blue-300 hover:shadow-sm'}
                 `}>
                    <span className={`
                       block w-7 h-7 text-center leading-7 rounded-full font-medium text-xs mb-1
                       ${isToday ? 'bg-blue-600 text-white' : isSelected ? 'bg-blue-200 text-blue-800' : 'text-gray-700'}
                    `}>{day}</span>
                    
                    <div className="flex flex-wrap gap-1 content-start">
                       {daysEvents.slice(0, 5).map((evt) => (
                           <div 
                             key={`dot-${evt.id}`} 
                             className={`h-1.5 w-1.5 rounded-full ${getDotColor(evt.type)}`}
                             title={evt.title}
                           />
                       ))}
                    </div>
                 </div>
              )})}
           </div>
        </div>

        {/* Selected Events List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[600px]">
          <div className="p-4 border-b border-blue-500 bg-blue-600">
             <h3 className="font-semibold text-white">
               {view === 'week' ? 'Compromissos da Semana' : 
                view === 'month' ? 'Compromissos do Mês' : 'Compromissos do Dia'}
             </h3>
             <p className="text-xs text-blue-100 font-medium mt-1 capitalize">{getDisplayTitle()}</p>
          </div>
          <div className="p-4 space-y-3 overflow-y-auto flex-1">
             {agendaLoading ? (
                 <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-500"/></div>
             ) : filteredEvents.length === 0 ? (
                 <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <Calendar className="w-10 h-10 mb-2 opacity-20" />
                    <p className="text-sm">Nada agendado para este período.</p>
                 </div>
             ) : (
                filteredEvents.map((event) => (
                    <div key={event.id} className={`p-3 rounded-lg border ${getEventColor(event.type)}`}>
                        <div className="flex justify-between items-start mb-1">
                            <span className="font-bold text-sm">{event.time}</span>
                            <div className="flex flex-col items-end">
                               {view !== 'day' && (
                                 <span className="text-[10px] text-gray-500 font-semibold mb-1">
                                    {new Date(event.date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                                 </span>
                               )}
                               <span className="text-[9px] uppercase font-bold tracking-wider opacity-70 border border-current px-1 rounded">
                                   {getEventTypeLabel(event.type)}
                               </span>
                            </div>
                        </div>
                        <h4 className="font-semibold text-sm leading-tight mb-1">{event.title}</h4>
                        <p className="text-xs opacity-80 mb-1 truncate">{event.client}</p>
                        <div className="flex items-center text-[10px] opacity-70 mt-2">
                            <MapPin className="w-3 h-3 mr-1" />
                            {event.location}
                        </div>
                    </div>
                ))
             )}
          </div>
        </div>
      </div>

      {/* MODAL NOVO EVENTO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setIsModalOpen(false)}></div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Novo Evento</h3>
                  <button onClick={() => setIsModalOpen(false)} className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none">
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <form onSubmit={handleSaveEvent} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Título</label>
                        <input 
                            type="text" 
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={newEvent.title}
                            onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Data</label>
                            <input 
                                type="date" 
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                value={newEvent.date}
                                onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Hora</label>
                            <input 
                                type="time" 
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                value={newEvent.time}
                                onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tipo</label>
                            <select 
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white sm:text-sm"
                                value={newEvent.type}
                                onChange={(e) => setNewEvent({...newEvent, type: e.target.value})}
                            >
                                <option value="meeting">Reunião</option>
                                <option value="hearing">Audiência</option>
                                <option value="deadline">Prazo</option>
                                <option value="conference">Conferência</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Cliente</label>
                            <input 
                                type="text" 
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                value={newEvent.client}
                                onChange={(e) => setNewEvent({...newEvent, client: e.target.value})}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Local / Link</label>
                        <input 
                            type="text" 
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={newEvent.location}
                            onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                        />
                    </div>
                    <div className="mt-5 sm:mt-6 flex justify-end gap-2">
                        <button
                            type="button"
                            className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:text-sm"
                            onClick={() => setIsModalOpen(false)}
                            disabled={isSaving}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 sm:text-sm items-center"
                            disabled={isSaving}
                        >
                            {isSaving ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                            Salvar Evento
                        </button>
                    </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Agenda;