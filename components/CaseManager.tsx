import React, { useState, useEffect } from 'react';
import { useCases } from '../hooks/useCases';
import { useClients } from '../hooks/useClients';
import { PlusCircle, Scale, AlertCircle, Calendar, Trash2 } from 'lucide-react';
import { CaseStatus, CasePriority } from '../types';

const CaseManager = () => {
  const { cases, fetchCases, createCase, deleteCase, loading, error } = useCases();
  const { clients, fetchClients } = useClients();
  const [showForm, setShowForm] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    case_number: '',
    client_id: '',
    case_type: 'Civil',
    status: CaseStatus.OPEN,
    priority: CasePriority.MEDIUM,
    description: ''
  });

  useEffect(() => {
    fetchCases();
    fetchClients();
  }, [fetchCases, fetchClients]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.client_id) {
      alert("Selecione um cliente");
      return;
    }
    await createCase(formData);
    setShowForm(false);
    setFormData({
      title: '',
      case_number: '',
      client_id: '',
      case_type: 'Civil',
      status: CaseStatus.OPEN,
      priority: CasePriority.MEDIUM,
      description: ''
    });
  };

  const handleDelete = async (id: string, title: string) => {
      if (window.confirm(`Tem certeza que deseja excluir o processo "${title}"?`)) {
          await deleteCase(id);
      }
  };

  const getPriorityColor = (p: string) => {
    switch(p) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Processos</h1>
          <p className="text-sm text-gray-500">Gerenciamento de casos e andamentos</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Novo Processo
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200 animate-in fade-in slide-in-from-top-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Cadastrar Novo Processo</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Título da Ação</label>
                <input
                  required
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  placeholder="Ex: Ação de Cobrança"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Número do Processo</label>
                <input
                  required
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                  value={formData.case_number}
                  onChange={e => setFormData({...formData, case_number: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Cliente</label>
                <select
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                  value={formData.client_id}
                  onChange={e => setFormData({...formData, client_id: e.target.value})}
                >
                  <option value="">Selecione...</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Prioridade</label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                  value={formData.priority}
                  onChange={e => setFormData({...formData, priority: e.target.value as CasePriority})}
                >
                  <option value={CasePriority.LOW}>Baixa</option>
                  <option value={CasePriority.MEDIUM}>Média</option>
                  <option value={CasePriority.HIGH}>Alta</option>
                  <option value={CasePriority.URGENT}>Urgente</option>
                </select>
              </div>
              <div>
                 <label className="block text-sm font-medium text-gray-700">Tipo</label>
                 <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                  value={formData.case_type}
                  onChange={e => setFormData({...formData, case_type: e.target.value})}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                {loading ? 'Salvando...' : 'Salvar Processo'}
              </button>
            </div>
          </form>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {cases.length === 0 ? (
            <li className="p-6 text-center text-gray-500">Nenhum processo encontrado.</li>
          ) : (
            cases.map((c) => (
              <li key={c.id} className="hover:bg-gray-50">
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                       <Scale className="h-5 w-5 text-gray-400 mr-2" />
                       <p className="text-sm font-medium text-blue-600 truncate">{c.title}</p>
                    </div>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(c.priority)}`}>
                        {c.priority}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        Nº: {c.case_number}
                      </p>
                      {/* Court removed to fix schema error */}
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <button onClick={() => handleDelete(c.id, c.title)} className="text-gray-400 hover:text-red-600 p-2 rounded-full transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default CaseManager;