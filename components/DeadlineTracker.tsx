import React, { useState } from 'react';
import { Calendar as CalendarIcon, ArrowRight, Calculator, Check } from 'lucide-react';

const DeadlineTracker: React.FC = () => {
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [days, setDays] = useState<number>(15);
  const [countType, setCountType] = useState<'business' | 'calendar'>('business');
  const [resultDate, setResultDate] = useState<Date | null>(null);

  const calculateDeadline = () => {
    if (!startDate) return;
    
    const start = new Date(startDate);
    // Ajusta fuso para não perder dia na conversão
    const userTimezoneOffset = start.getTimezoneOffset() * 60000;
    let current = new Date(start.getTime() + userTimezoneOffset);
    
    let daysAdded = 0;

    if (countType === 'calendar') {
        current.setDate(current.getDate() + days);
        // Se cair em fim de semana, prorroga para o próximo dia útil (regra geral)
        while (current.getDay() === 0 || current.getDay() === 6) {
            current.setDate(current.getDate() + 1);
        }
    } else {
        // Dias Úteis
        while (daysAdded < days) {
            current.setDate(current.getDate() + 1);
            // 0 = Domingo, 6 = Sábado
            if (current.getDay() !== 0 && current.getDay() !== 6) {
                daysAdded++;
            }
        }
    }

    setResultDate(current);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in">
       <div>
          <h1 className="text-2xl font-bold text-gray-900">Calculadora de Prazos Processuais</h1>
          <p className="mt-1 text-sm text-gray-500">Simule datas finais de prazos com base em dias úteis ou corridos.</p>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           
           {/* Input Section */}
           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
               <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                   <Calculator className="w-5 h-5 mr-2 text-blue-600" />
                   Parâmetros
               </h3>
               
               <div className="space-y-4">
                   <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">Data de Início (Publicação/Intimação)</label>
                       <div className="relative">
                           <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                           <input 
                              type="date"
                              value={startDate}
                              onChange={(e) => setStartDate(e.target.value)}
                              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                           />
                       </div>
                   </div>

                   <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">Prazo (em dias)</label>
                       <input 
                          type="number"
                          min="1"
                          value={days}
                          onChange={(e) => setDays(parseInt(e.target.value) || 0)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                       />
                   </div>

                   <div>
                       <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Contagem (CPC/2015)</label>
                       <div className="flex gap-4">
                           <label className={`flex-1 border rounded-lg p-3 cursor-pointer transition-all ${countType === 'business' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'hover:bg-gray-50 border-gray-200'}`}>
                               <div className="flex items-center">
                                   <input 
                                     type="radio" 
                                     name="type" 
                                     className="hidden" 
                                     checked={countType === 'business'}
                                     onChange={() => setCountType('business')} 
                                   />
                                   <div className={`w-4 h-4 rounded-full border mr-2 flex items-center justify-center ${countType === 'business' ? 'border-blue-600' : 'border-gray-400'}`}>
                                       {countType === 'business' && <div className="w-2 h-2 rounded-full bg-blue-600"></div>}
                                   </div>
                                   <span className="font-medium">Dias Úteis</span>
                               </div>
                           </label>
                           <label className={`flex-1 border rounded-lg p-3 cursor-pointer transition-all ${countType === 'calendar' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'hover:bg-gray-50 border-gray-200'}`}>
                               <div className="flex items-center">
                                   <input 
                                     type="radio" 
                                     name="type" 
                                     className="hidden" 
                                     checked={countType === 'calendar'}
                                     onChange={() => setCountType('calendar')} 
                                   />
                                   <div className={`w-4 h-4 rounded-full border mr-2 flex items-center justify-center ${countType === 'calendar' ? 'border-blue-600' : 'border-gray-400'}`}>
                                       {countType === 'calendar' && <div className="w-2 h-2 rounded-full bg-blue-600"></div>}
                                   </div>
                                   <span className="font-medium">Dias Corridos</span>
                               </div>
                           </label>
                       </div>
                   </div>

                   <button 
                      onClick={calculateDeadline}
                      className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm mt-4 flex justify-center items-center"
                   >
                       Calcular Prazo <ArrowRight className="w-4 h-4 ml-2" />
                   </button>
               </div>
           </div>

           {/* Result Section */}
           <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white p-6 rounded-xl shadow-lg flex flex-col justify-center items-center relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
               <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/20 rounded-full blur-xl -ml-5 -mb-5"></div>
               
               {resultDate ? (
                   <div className="text-center z-10 animate-in zoom-in duration-300">
                       <p className="text-blue-200 text-sm font-medium uppercase tracking-wider mb-2">Data Final do Prazo</p>
                       <div className="text-5xl font-bold mb-4">
                           {resultDate.getDate().toString().padStart(2, '0')}
                           <span className="text-blue-400">/</span>
                           {(resultDate.getMonth() + 1).toString().padStart(2, '0')}
                       </div>
                       <p className="text-xl text-gray-300 mb-6">
                           {resultDate.getFullYear()}
                       </p>
                       <div className="inline-flex items-center bg-white/10 px-4 py-2 rounded-full text-sm backdrop-blur-sm">
                           <CalendarIcon className="w-4 h-4 mr-2 text-blue-400" />
                           {resultDate.toLocaleDateString('pt-BR', { weekday: 'long' })}
                       </div>
                       <p className="mt-8 text-xs text-gray-500 max-w-xs mx-auto">
                           * O cálculo considera apenas finais de semana. Feriados locais ou nacionais devem ser adicionados manualmente.
                       </p>
                   </div>
               ) : (
                   <div className="text-center text-gray-400 z-10">
                       <Calculator className="w-16 h-16 mx-auto mb-4 opacity-20" />
                       <p className="text-sm">Preencha os dados e clique em calcular para ver o resultado.</p>
                   </div>
               )}
           </div>
       </div>
    </div>
  );
};

export default DeadlineTracker;