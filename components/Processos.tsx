
import React, { useEffect, useState } from 'react';
import { useCases } from '../hooks/useCases';
import { useClients } from '../hooks/useClients';
import { PlusCircle, Search, Pencil, X, FolderOpen, Loader2, ArrowLeft } from 'lucide-react';
import { CaseForm } from './CaseForm';
import { LegalCase, CaseStatus } from '../types';
import DeleteButton from './DeleteButton';
import CaseDetails from './CaseDetails';
import { SystemSetup } from './SystemSetup';

interface ProcessosProps {
  initialSelectedCaseId?: string | null;
  onClearTarget?: () => void;
}

const Processos: React.FC<ProcessosProps> = ({ initialSelectedCaseId, onClearTarget }) => {
  const { cases, loading, error, fetchCases, createCase, updateCase } = useCases();
  const { clients, fetchClients } = useClients();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<LegalCase | null>(null);
  const [selectedCase, setSelectedCase] = useState<LegalCase | null>(null);

  useEffect(() => {
    fetchCases(searchTerm);
    fetchClients();
  }, [searchTerm, fetchCases, fetchClients]);

  useEffect(() => {
    if (initialSelectedCaseId && cases.length > 0) {
      const found = cases.find(c => c.id === initialSelectedCaseId);
      if (found) {
        setSelectedCase(found);
        if (onClearTarget) onClearTarget();
      }
    }
  }, [initialSelectedCaseId, cases, onClearTarget]);

  const filteredCases = cases.filter(caseItem => {
    if (statusFilter === 'all') return true;
    return caseItem.status === statusFilter;
  });

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : 'Cliente não encontrado';
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open': return 'Aberto';
      case 'in_progress': return 'Em Andamento';
      case 'closed': return 'Concluído';
      case 'archived': return 'Arquivado';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'archived': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const openModal = (legalCase?: LegalCase) => {
    setEditingCase(legalCase || null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCase(null);
  };

  const handleFormSubmit = async (data: any) => {
    if (editingCase) {
        const result = await updateCase(editingCase.id, data);
        if (result.success && result.data) {
            if (selectedCase && selectedCase.id === editingCase.id) {
                 setSelectedCase(result.data as LegalCase);
            }
        }
    } else {
        await createCase(data);
    }
    closeModal();
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {error === 'tabela_missing' && <SystemSetup />}

      {selectedCase ? (
        <CaseDetails 
          legalCase={selectedCase} 
          onBack={() => setSelectedCase(null)}
          onEdit={() => openModal(selectedCase)}
        />
      ) : (
        <>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Processos</h1>
              <p className="mt-1 text-sm text-gray-500 font-medium">Gerencie todos os processos do escritório</p>
            </div>
            <button
              onClick={() => openModal()}
              className="inline-flex items-center px-6 py-3 bg-[#131313] text-brand-gold border border-brand-gold/20 rounded-xl shadow-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Novo Processo
            </button>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-grow">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por número ou título..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2.5 w-full border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-gold/20 outline-none"
                  />
              </div>
              <select 
                className="px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-xs font-bold uppercase"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Todos Status</option>
                <option value="open">Abertos</option>
                <option value="in_progress">Em Andamento</option>
                <option value="closed">Concluídos</option>
                <option value="archived">Arquivados</option>
              </select>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-8 py-5 border-b border-brand-gold/20 bg-[#131313] flex justify-between items-center">
                <h2 className="text-[10px] font-black text-brand-gold uppercase tracking-widest">Lista de Casos ({filteredCases.length})</h2>
            </div>

            {loading && cases.length === 0 ? (
               <div className="p-12 text-center text-gray-400"><Loader2 className="w-8 h-8 animate-spin mx-auto text-brand-gold" /></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-8 py-4 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest">Número</th>
                      <th className="px-8 py-4 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest">Título</th>
                      <th className="px-8 py-4 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest">Cliente</th>
                      <th className="px-8 py-4 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                      <th className="px-8 py-4 text-right text-[9px] font-black text-gray-400 uppercase tracking-widest">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-50">
                    {filteredCases.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-8 py-10 text-center text-gray-400 text-xs italic">Nenhum processo encontrado.</td>
                      </tr>
                    ) : (
                      filteredCases.map((caseItem) => (
                        <tr 
                          key={caseItem.id} 
                          className="hover:bg-gray-50/80 transition-colors group cursor-pointer"
                          onClick={() => setSelectedCase(caseItem)}
                        >
                          <td className="px-8 py-4 text-xs font-black text-gray-900">{caseItem.case_number}</td>
                          <td className="px-8 py-4 text-xs font-bold text-gray-900 group-hover:text-brand-gold transition-colors">{caseItem.title}</td>
                          <td className="px-8 py-4 text-xs text-gray-500 font-medium">{getClientName(caseItem.client_id)}</td>
                          <td className="px-8 py-4">
                            <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg ${getStatusColor(caseItem.status)}`}>
                              {getStatusLabel(caseItem.status)}
                            </span>
                          </td>
                          <td className="px-8 py-4 whitespace-nowrap text-right text-xs">
                            <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                               <button onClick={() => setSelectedCase(caseItem)} className="p-2 text-gray-400 hover:text-brand-gold hover:bg-brand-gold/10 rounded-lg transition-all" title="Ver Detalhes"><FolderOpen className="h-4 w-4" /></button>
                               <button onClick={() => openModal(caseItem)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Editar"><Pencil className="h-4 w-4" /></button>
                               <DeleteButton tableName="legal_cases" recordId={caseItem.id} recordName={caseItem.title} onDelete={() => fetchCases(searchTerm)} variant="ghost" size="sm" showLabel={false} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg" />
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={closeModal}></div>
          <div className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 border border-white/20">
              <div className="bg-[#131313] px-8 py-6 flex justify-between items-center border-b border-brand-gold/20">
                <h3 className="text-xl font-bold text-brand-gold tracking-tight">{editingCase ? 'Editar Processo' : 'Novo Processo'}</h3>
                <button onClick={closeModal} className="text-white/40 hover:text-white transition-all"><X className="h-6 w-6" /></button>
              </div>
              <div className="p-8">
                <CaseForm 
                  initialData={editingCase} 
                  onSubmit={handleFormSubmit} 
                  loading={loading} 
                  onCancel={closeModal} 
                  onDelete={() => { fetchCases(searchTerm); setSelectedCase(null); closeModal(); }} 
                  clients={clients} 
                />
              </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Processos;
