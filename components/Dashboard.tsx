import React, { useEffect, useState } from 'react';
import { useClients } from '../hooks/useClients';
import { useCases } from '../hooks/useCases';
import { Users, Scale, Clock, PlusCircle, FileText, Calendar } from 'lucide-react';

interface DashboardProps {
  onNavigate: (view: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { clients, fetchClients, loading: clientsLoading } = useClients();
  const { cases, fetchCases, loading: casesLoading } = useCases();
  const [stats, setStats] = useState({
    totalClients: 0,
    activeCases: 0,
    pendingDeadlines: 0,
  });

  useEffect(() => {
    fetchClients();
    fetchCases();
  }, [fetchClients, fetchCases]);

  useEffect(() => {
    if (clients && cases) {
      const activeCasesCount = cases.filter(c => c.status === 'open' || c.status === 'in_progress').length;
      
      const pendingDeadlinesCount = cases.filter(c => {
        if (!c.next_hearing) return false;
        const hearingDate = new Date(c.next_hearing);
        const today = new Date();
        const diffTime = hearingDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7 && diffDays >= 0;
      }).length;

      setStats({
        totalClients: clients.length,
        activeCases: activeCasesCount,
        pendingDeadlines: pendingDeadlinesCount,
      });
    }
  }, [clients, cases]);

  // Sort upcoming deadlines
  const upcomingDeadlines = cases
    .filter(c => c.next_hearing)
    .sort((a, b) => new Date(a.next_hearing!).getTime() - new Date(b.next_hearing!).getTime())
    .slice(0, 3);

  const recentCases = cases.slice(0, 3);

  const statCards = [
    { name: 'Total de Clientes', value: stats.totalClients, icon: Users, color: 'bg-primary-50 text-primary-600', link: 'clients' },
    { name: 'Processos Ativos', value: stats.activeCases, icon: Scale, color: 'bg-zinc-100 text-zinc-800', link: 'cases' },
    { name: 'Prazos Próximos', value: stats.pendingDeadlines, icon: Clock, color: 'bg-primary-100 text-primary-700', link: 'deadlines' },
  ];

  return (
    <div className="space-y-3 animate-in fade-in duration-500">
      <div className="border-b border-gray-200 pb-2">
        <h1 className="text-2xl font-bold text-blue-900">Dashboard</h1>
        <p className="mt-1 text-xs text-gray-500">
          Visão geral do seu consultório jurídico.
        </p>
      </div>

      {/* Quick Actions (Compact Version) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2">
        <h2 className="text-xs font-semibold text-gray-900 mb-2 px-1">Ações Rápidas</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <button onClick={() => onNavigate('clients')} className="group flex items-center justify-center p-2 bg-gray-50 rounded-lg hover:bg-blue-50 transition-all duration-300 border border-gray-100 hover:border-blue-100">
            <Users className="h-4 w-4 text-blue-600 mr-2" />
            <span className="text-xs font-medium text-gray-700 group-hover:text-blue-700">Novo Cliente</span>
          </button>
          <button onClick={() => onNavigate('cases')} className="group flex items-center justify-center p-2 bg-gray-50 rounded-lg hover:bg-blue-50 transition-all duration-300 border border-gray-100 hover:border-blue-100">
            <PlusCircle className="h-4 w-4 text-blue-600 mr-2" />
            <span className="text-xs font-medium text-gray-700 group-hover:text-blue-700">Novo Processo</span>
          </button>
          <button onClick={() => onNavigate('agenda')} className="group flex items-center justify-center p-2 bg-gray-50 rounded-lg hover:bg-blue-50 transition-all duration-300 border border-gray-100 hover:border-blue-100">
            <Calendar className="h-4 w-4 text-blue-600 mr-2" />
            <span className="text-xs font-medium text-gray-700 group-hover:text-blue-700">Nova Audiência</span>
          </button>
          <button onClick={() => onNavigate('documents')} className="group flex items-center justify-center p-2 bg-gray-50 rounded-lg hover:bg-blue-50 transition-all duration-300 border border-gray-100 hover:border-blue-100">
            <FileText className="h-4 w-4 text-blue-600 mr-2" />
            <span className="text-xs font-medium text-gray-700 group-hover:text-blue-700">Novo Documento</span>
          </button>
        </div>
      </div>

      {/* Stats Grid - Adjusted to 3 columns */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <div
            key={stat.name}
            onClick={() => onNavigate(stat.link)}
            className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-200 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="p-3">
              <div className="flex items-center">
                <div className={`flex-shrink-0 rounded-md p-2 bg-blue-50 group-hover:bg-blue-100 transition-colors`}>
                  <stat.icon className="h-4 w-4 text-blue-600" />
                </div>
                <div className="ml-3 w-0 flex-1">
                  <dt className="text-xs font-medium text-gray-500 truncate">{stat.name}</dt>
                  <dd className="mt-0.5 text-xl font-semibold text-gray-900">{stat.value}</dd>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-3 py-1 border-t border-gray-100">
              <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wide">Ver detalhes →</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        
        {/* Próximos Prazos */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-4 py-2 border-b border-blue-500 flex justify-between items-center bg-blue-600">
            <h2 className="text-sm font-bold text-white">Próximos Prazos</h2>
            <button onClick={() => onNavigate('deadlines')} className="text-xs font-medium text-blue-100 hover:text-white transition-colors">Ver todos</button>
          </div>
          <div className="p-3">
            {upcomingDeadlines.length > 0 ? (
              <ul className="divide-y divide-gray-100">
                {upcomingDeadlines.map((c) => (
                  <li key={c.id} className="py-2 first:pt-0 last:pb-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-medium text-gray-900">{c.title}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5 font-mono">{c.case_number}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold text-blue-600">
                          {new Date(c.next_hearing!).toLocaleDateString('pt-BR')}
                        </p>
                        <p className="text-[10px] text-gray-500">
                          {new Date(c.next_hearing!).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-center text-xs py-2 italic">Nenhum prazo próximo encontrado.</p>
            )}
          </div>
        </div>

        {/* Processos Recentes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-4 py-2 border-b border-blue-500 flex justify-between items-center bg-blue-600">
             <h2 className="text-sm font-bold text-white">Processos Recentes</h2>
             <button onClick={() => onNavigate('cases')} className="text-xs font-medium text-blue-100 hover:text-white transition-colors">Ver todos</button>
          </div>
          <div className="p-3">
             {recentCases.length > 0 ? (
              <ul className="divide-y divide-gray-100">
                {recentCases.map((c) => (
                  <li key={c.id} className="py-2 first:pt-0 last:pb-0">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Scale className="h-6 w-6 text-blue-500 p-1 bg-blue-50 rounded-lg mr-2" />
                        <div>
                           <p className="text-xs font-medium text-gray-900">{c.title}</p>
                           <p className="text-[10px] text-gray-500">{c.case_type}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                        c.status === 'open' ? 'bg-green-100 text-green-800' : 
                        c.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {c.status === 'in_progress' ? 'Andamento' : c.status === 'open' ? 'Aberto' : 'Fechado'}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
             ) : (
                <p className="text-gray-500 text-center text-xs py-2 italic">Nenhum processo recente.</p>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;