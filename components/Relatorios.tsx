
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useCases } from '../hooks/useCases';
import { useClients } from '../hooks/useClients';
import { CaseStatus, CaseOutcome } from '../types';
import { Loader2 } from 'lucide-react';

const Relatorios: React.FC = () => {
  const { cases, fetchCases, loading: casesLoading } = useCases();
  const { clients, fetchClients } = useClients(); 
  
  useEffect(() => {
    fetchCases();
    fetchClients();
  }, []);

  const totalRevenue = cases.reduce((sum, c) => sum + (c.fee || 0), 0);
  const currentMonth = new Date().getMonth();
  const newClientsThisMonth = clients.filter(c => new Date(c.created_at).getMonth() === currentMonth).length;
  const closedCasesCount = cases.filter(c => c.status === CaseStatus.CLOSED).length;
  
  const casesWithOutcome = cases.filter(c => c.outcome);
  const wonOrSettledCount = casesWithOutcome.filter(c => c.outcome === CaseOutcome.WON || c.outcome === CaseOutcome.SETTLED).length;
  const winRate = casesWithOutcome.length > 0 ? Math.round((wonOrSettledCount / casesWithOutcome.length) * 100) : 0;

  const casesByType = cases.reduce((acc, c) => {
     const type = c.case_type || 'Outros';
     acc[type] = (acc[type] || 0) + 1;
     return acc;
  }, {} as Record<string, number>);

  const pieData = Object.keys(casesByType).map((key, index) => ({
    name: key,
    value: casesByType[key],
    color: ['#C5A059', '#111111', '#3B82F6', '#10B981', '#EF4444'][index % 5]
  }));

  const monthsOrder = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const revenueByMonth = cases.reduce((acc, c) => {
    if (!c.fee) return acc;
    const date = new Date(c.created_at);
    const monthKey = monthsOrder[date.getMonth()];
    acc[monthKey] = (acc[monthKey] || 0) + c.fee;
    return acc;
  }, {} as Record<string, number>);

  const barData = monthsOrder
    .filter(m => revenueByMonth[m] !== undefined)
    .map(m => ({
      name: m,
      value: revenueByMonth[m]
    }));

  if (casesLoading) {
     return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-brand-gold w-8 h-8"/></div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in max-w-5xl mx-auto pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Performance Estratégica</h1>
          <p className="mt-1 text-sm text-gray-500 font-medium uppercase tracking-widest text-[10px]">Análise de métricas e honorários</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Receita Total', value: totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), color: 'text-brand-gold' },
          { label: 'Novos Clientes', value: newClientsThisMonth, color: 'text-gray-900' },
          { label: 'Casos Encerrados', value: closedCasesCount, color: 'text-gray-900' },
          { label: 'Taxa de Êxito', value: `${winRate}%`, color: 'text-brand-gold' },
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{kpi.label}</p>
            <h3 className={`text-xl font-black ${kpi.color}`}>{kpi.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm min-h-[400px]">
          <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em] mb-8">Processos por Área</h3>
          <div className="h-[300px] w-full min-w-0">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-300 uppercase font-black text-[10px] tracking-widest">Sem dados</div>
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-6">
             {pieData.map(d => (
               <div key={d.name} className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full" style={{backgroundColor: d.color}}></div>
                 <span className="text-[9px] font-black text-gray-500 uppercase">{d.name}</span>
               </div>
             ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm min-h-[400px]">
          <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em] mb-8">Receita Mensal</h3>
          <div className="h-[300px] w-full min-w-0">
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} />
                  <Tooltip cursor={{fill: '#f8f9fa'}} formatter={(val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
                  <Bar dataKey="value" fill="#C5A059" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-300 uppercase font-black text-[10px] tracking-widest">Sem movimentação</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Relatorios;
