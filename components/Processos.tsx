import React, { useEffect, useState } from 'react';
import { useCases } from '../hooks/useCases';
import { useClients } from '../hooks/useClients';
import { PlusCircle, Search, Filter, Pencil, X, FolderOpen } from 'lucide-react';
import { CaseForm } from './CaseForm';
import { LegalCase } from '../types';
import DeleteButton from './DeleteButton';
import CaseDetails from './CaseDetails';

const Processos: React.FC = () => {
  const { cases, loading, error, fetchCases, createCase, updateCase } = useCases();
  const { clients, fetchClients } = useClients();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Modal & View State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<LegalCase | null>(null);
  
  // Drill-down State
  const [selectedCase, setSelectedCase] = useState<LegalCase | null>(null);

  useEffect(() => {
    fetchCases(searchTerm);
    fetchClients();
  }, [searchTerm, fetchCases, fetchClients]);

  const filteredCases = cases.filter(caseItem => {
    if (statusFilter === 'all') return true;
    return caseItem.status === statusFilter;
  });

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : 'Cliente não encontrado';
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open': return 'Aberto';
      case 'in_progress': return 'Em Andamento';
      case 'closed': return 'Fechado';
      case 'archived': return 'Arquivado';
      default: return status;
    }
  };

  const handleDeleted = (success: boolean) => {
    if (success) {
      fetchCases(searchTerm);
      if (editingCase) closeModal();
      // Se deletar o caso que está aberto em detalhes, volta para lista
      if (selectedCase && editingCase?.id === selectedCase.id) {
          setSelectedCase(null);
      }
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
    let result;
    if (editingCase) {
        result = await updateCase(editingCase.id, data);
        // Atualiza a visualização de detalhes se estiver aberta
        if (selectedCase && selectedCase.id === editingCase.id && result.data) {
             setSelectedCase(result.data as LegalCase);
        }
    } else {
        await createCase(data);
    }
    closeModal();
  };

  // Se um caso estiver selecionado, renderiza a visão detalhada
  if (selectedCase) {
      return (
          <CaseDetails 
             legalCase={selectedCase} 
             onBack={() => setSelectedCase(null)}
             onEdit={() => openModal(selectedCase)}
          />
      );
  }

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Processos</h1>
          <p className="mt-1 text-sm text-gray-500">Gerencie todos os processos do escritório</p>
        </div>
        <button
          onClick={() => openModal()}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 shadow-sm transition-colors"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Novo Processo
        </button>
      </div>
      
      {/* Filtros e Busca */}
      <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por número ou título..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
          </div>
          <div className="flex gap-2">
               <select 
                  className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
               >
                  <option value="all">Todos os Status</option>
                  <option value="open">Aberto</option>
                  <option value="in_progress">Em Andamento</option>
                  <option value="closed">Fechado</option>
                  <option value="archived">Arquivado</option>
               </select>
          </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-blue-500 bg-blue-600 flex justify-between items-center">
          <h2 className="text-sm font-semibold text-white">
            Lista de Processos ({filteredCases.length})
          </h2>
        </div>

        {loading ? (
           <div className="p-12 text-center text-gray-400">Carregando processos...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Número</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 cursor-pointer">
                {filteredCases.map((caseItem) => (
                  <tr 
                    key={caseItem.id} 
                    className="hover:bg-blue-50 transition-colors group"
                    onClick={() => setSelectedCase(caseItem)} // Click na linha abre detalhes
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{caseItem.case_number}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 group-hover:text-blue-600 font-medium">
                        {caseItem.title}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{getClientName(caseItem.client_id)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(caseItem.status)}`}>
                        {getStatusText(caseItem.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                         <button 
                            onClick={() => setSelectedCase(caseItem)} 
                            className="text-gray-400 hover:text-blue-600 p-2 rounded-full hover:bg-blue-100"
                            title="Ver Detalhes"
                         >
                             <FolderOpen className="h-4 w-4" />
                         </button>
                         <button 
                            onClick={() => openModal(caseItem)} 
                            className="text-gray-400 hover:text-blue-600 p-2 rounded-full hover:bg-blue-100"
                            title="Editar Rápido"
                         >
                            <Pencil className="h-4 w-4" />
                         </button>
                         <DeleteButton 
                           tableName="legal_cases" 
                           recordId={caseItem.id} 
                           recordName={caseItem.title}
                           onDelete={handleDeleted}
                           variant="ghost"
                           size="sm"
                           showLabel={false}
                           className="text-gray-400 hover:text-red-600 p-2 rounded-full hover:bg-white"
                         />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

       {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={closeModal}></div>
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {editingCase ? 'Editar Processo' : 'Novo Processo'}
                  </h3>
                  <button onClick={closeModal}><X className="h-6 w-6 text-gray-400" /></button>
                </div>
                <CaseForm 
                  initialData={editingCase}
                  onSubmit={handleFormSubmit} 
                  loading={loading} 
                  onCancel={closeModal}
                  onDelete={() => handleDeleted(true)}
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