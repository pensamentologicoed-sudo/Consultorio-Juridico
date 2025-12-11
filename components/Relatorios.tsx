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
  }, [fetchCases, fetchClients]);

  // --- KPIS CALCULATION ---
  const totalRevenue = cases.reduce((sum, c) => sum + (c.fee || 0), 0);
  
  const currentMonth = new Date().getMonth();
  const newClientsThisMonth = clients.filter(c => new Date(c.created_at).getMonth() === currentMonth).length;
  
  const closedCasesCount = cases.filter(c => c.status === CaseStatus.CLOSED).length;
  
  // Win Rate Calculation
  const casesWithOutcome = cases.filter(c => c.outcome);
  const wonOrSettledCount = casesWithOutcome.filter(c => c.outcome === CaseOutcome.WON || c.outcome === CaseOutcome.SETTLED).length;
  const winRate = casesWithOutcome.length > 0 
    ? Math.round((wonOrSettledCount / casesWithOutcome.length) * 100) 
    : 0;


  // --- CHARTS DATA PREPARATION ---

  // 1. Processos por Área (Pie Chart)
  const casesByType = cases.reduce((acc, c) => {
     const type = c.case_type || 'Outros';
     acc[type] = (acc[type] || 0) + 1;
     return acc;
  }, {} as Record<string, number>);

  const pieData = Object.keys(casesByType).map((key, index) => ({
    name: key,
    value: casesByType[key],
    color: ['#3B82F6', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6'][index % 5]
  }));

  // 2. Receita Mensal (Bar Chart)
  const revenueByMonth = cases.reduce((acc, c) => {
    if (!c.fee) return acc;
    const date = new Date(c.created_at);
    const monthKey = date.toLocaleString('default', { month: 'short' }); // "Jan", "Feb"
    acc[monthKey] = (acc[monthKey] || 0) + c.fee;
    return acc;
  }, {} as Record<string, number>);

  const monthsOrder = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  const barData = Object.keys(revenueByMonth).map(key => ({
    name: key.charAt(0).toUpperCase() + key.slice(1), // Capitalize
    value: revenueByMonth[key]
  })).sort((a, b) => {
      const idxA = monthsOrder.indexOf(a.name.toLowerCase().substring(0, 3));
      const idxB = monthsOrder.indexOf(b.name.toLowerCase().substring(0, 3));
      return idxA - idxB;
  });

  if (casesLoading) {
     return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-blue-500 w-8 h-8"/></div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
          <p className="mt-1 text-sm text-gray-500">Análise de performance baseada nos dados reais dos processos</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-500">Receita de Honorários</p>
          <div className="flex items-end justify-between mt-1">
             <h3 className="text-2xl font-bold text-gray-900">
               {totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
             </h3>
          </div>
          <p className="text-xs text-gray-400 mt-1">Soma de honorários cadastrados</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-500">Novos Clientes (Mês)</p>
          <div className="flex items-end justify-between mt-1">
             <h3 className="text-2xl font-bold text-gray-900">{newClientsThisMonth}</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-500">Casos Fechados</p>
          <div className="flex items-end justify-between mt-1">
             <h3 className="text-2xl font-bold text-gray-900">{closedCasesCount}</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-500">Taxa de Êxito</p>
          <div className="flex items-end justify-between mt-1">
             <h3 className="text-2xl font-bold text-gray-900">{winRate}%</h3>
             {winRate > 50 && <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Bom</span>}
          </div>
          <p className="text-xs text-gray-400 mt-1">Baseado em casos com desfecho</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Cases Distribution Chart */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Processos por Área</h3>
          {pieData.length > 0 ? (
            <>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-4 flex-wrap">
                {pieData.map((d) => (
                    <div key={d.name} className="flex items-center text-xs">
                      <div className="w-3 h-3 rounded-full mr-1" style={{backgroundColor: d.color}}></div>
                      {d.name} ({d.value})
                    </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
               Sem dados suficientes
            </div>
          )}
        </div>

        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Receita Mensal (Honorários)</h3>
          {barData.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{fill: 'transparent'}} 
                    formatter={(value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  />
                  <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
               Sem dados financeiros registrados
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Relatorios;