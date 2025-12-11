import React, { useState, useEffect } from 'react';
import { Save, Loader2, X, DollarSign } from 'lucide-react';
import { CaseStatus, CasePriority, Client, CaseOutcome } from '../types';
import DeleteButton from './DeleteButton';

interface CaseFormProps {
  onSubmit: (data: any) => Promise<void>;
  loading?: boolean;
  initialData?: any | null;
  onCancel?: () => void;
  onDelete?: () => void;
  clients: Client[];
}

export const CaseForm: React.FC<CaseFormProps> = ({
  onSubmit,
  loading = false,
  initialData = null,
  onCancel,
  onDelete,
  clients
}) => {
  const [formData, setFormData] = useState({
    title: '',
    case_number: '',
    client_id: '',
    case_type: 'Civil',
    status: CaseStatus.OPEN,
    priority: CasePriority.MEDIUM,
    description: '',
    next_hearing: '',
    value: '', // Valor da Causa
    fee: '',   // Honorários
    outcome: '' // Desfecho
  });

  useEffect(() => {
    if (initialData) {
      let formattedDate = '';
      if (initialData.next_hearing) {
        const date = new Date(initialData.next_hearing);
        const offset = date.getTimezoneOffset() * 60000;
        formattedDate = new Date(date.getTime() - offset).toISOString().slice(0, 16);
      }

      setFormData({
        title: initialData.title || '',
        case_number: initialData.case_number || '',
        client_id: initialData.client_id || '',
        case_type: initialData.case_type || 'Civil',
        status: initialData.status || CaseStatus.OPEN,
        priority: initialData.priority || CasePriority.MEDIUM,
        description: initialData.description || '',
        next_hearing: formattedDate,
        value: initialData.value ? initialData.value.toString() : '',
        fee: initialData.fee ? initialData.fee.toString() : '',
        outcome: initialData.outcome || ''
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
        ...formData,
        value: formData.value ? parseFloat(formData.value) : null,
        fee: formData.fee ? parseFloat(formData.fee) : null,
        outcome: formData.outcome || null,
        next_hearing: formData.next_hearing ? new Date(formData.next_hearing).toISOString() : null
    };
    await onSubmit(submitData);
  };

  const handleDeleteSuccess = (success: boolean) => {
    if (success && onDelete) onDelete();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Título *</label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500"
            disabled={loading}
            placeholder="Ex: Ação de Cobrança"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Número Processo *</label>
          <input
            type="text"
            required
            value={formData.case_number}
            onChange={(e) => setFormData({...formData, case_number: e.target.value})}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500"
            disabled={loading}
            placeholder="0000000-00.0000.0.00.0000"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <div>
            <label className="block text-sm font-medium text-gray-700">Cliente *</label>
            <select
              required
              value={formData.client_id}
              onChange={(e) => setFormData({...formData, client_id: e.target.value})}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white sm:text-sm focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            >
              <option value="">Selecione...</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700">Tipo da Ação</label>
            <input
              type="text"
              value={formData.case_type}
              onChange={(e) => setFormData({...formData, case_type: e.target.value})}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
              placeholder="Ex: Civil, Trabalhista..."
            />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value as CaseStatus})}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white sm:text-sm focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            >
              <option value={CaseStatus.OPEN}>Aberto</option>
              <option value={CaseStatus.IN_PROGRESS}>Em Andamento</option>
              <option value={CaseStatus.CLOSED}>Fechado</option>
              <option value={CaseStatus.ARCHIVED}>Arquivado</option>
            </select>
         </div>
         <div>
             <label className="block text-sm font-medium text-gray-700">Prioridade</label>
             <select
              value={formData.priority}
              onChange={(e) => setFormData({...formData, priority: e.target.value as CasePriority})}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white sm:text-sm focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            >
              <option value={CasePriority.LOW}>Baixa</option>
              <option value={CasePriority.MEDIUM}>Média</option>
              <option value={CasePriority.HIGH}>Alta</option>
              <option value={CasePriority.URGENT}>Urgente</option>
            </select>
         </div>
      </div>
      
      {/* Seção Financeira */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <DollarSign className="w-4 h-4 mr-1 text-green-600" />
            Dados Financeiros e Resultado
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                  <label className="block text-xs font-medium text-gray-500">Valor da Causa (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.value}
                    onChange={(e) => setFormData({...formData, value: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-green-500 focus:border-green-500"
                    placeholder="0,00"
                    disabled={loading}
                  />
              </div>
              <div>
                  <label className="block text-xs font-medium text-gray-500">Honorários Previstos (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.fee}
                    onChange={(e) => setFormData({...formData, fee: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-green-500 focus:border-green-500"
                    placeholder="0,00"
                    disabled={loading}
                  />
              </div>
              <div>
                  <label className="block text-xs font-medium text-gray-500">Desfecho</label>
                  <select
                    value={formData.outcome}
                    onChange={(e) => setFormData({...formData, outcome: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white sm:text-sm focus:ring-blue-500 focus:border-blue-500"
                    disabled={loading}
                  >
                    <option value="">Em Aberto / Indefinido</option>
                    <option value={CaseOutcome.WON}>Ganho (Procedente)</option>
                    <option value={CaseOutcome.LOST}>Perdido (Improcedente)</option>
                    <option value={CaseOutcome.SETTLED}>Acordo</option>
                  </select>
              </div>
          </div>
      </div>

      <div>
          <label className="block text-sm font-medium text-gray-700">Próxima Audiência</label>
          <input
            type="datetime-local"
            value={formData.next_hearing}
            onChange={(e) => setFormData({...formData, next_hearing: e.target.value})}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500"
            disabled={loading}
          />
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-gray-100 mt-4">
         <div>
            {initialData && onDelete && (
              <DeleteButton
                tableName="legal_cases"
                recordId={initialData.id}
                recordName={initialData.title}
                onDelete={handleDeleteSuccess}
                variant="destructive"
                size="sm"
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 transition-colors"
              />
            )}
         </div>
         <div className="flex gap-2">
           {onCancel && (
             <button
               type="button"
               onClick={onCancel}
               className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
               disabled={loading}
             >
               Cancelar
             </button>
           )}
           <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Salvar
          </button>
         </div>
      </div>
    </form>
  );
};