import React, { useState, useEffect } from 'react';
import { Save, Loader2, X } from 'lucide-react';
import { CounterpartType } from '../types';
import DeleteButton from './DeleteButton';

interface CounterpartFormProps {
  onSubmit: (data: any) => Promise<void>;
  loading?: boolean;
  initialData?: any | null;
  onCancel?: () => void;
  onDelete?: () => void;
}

export const CounterpartForm: React.FC<CounterpartFormProps> = ({
  onSubmit,
  loading = false,
  initialData = null,
  onCancel,
  onDelete
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf_cnpj: '',
    type: CounterpartType.INDIVIDUAL
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        cpf_cnpj: initialData.cpf_cnpj || '',
        type: initialData.type || CounterpartType.INDIVIDUAL
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleDeleteSuccess = (success: boolean) => {
    if (success && onDelete) onDelete();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Nome *</label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
          disabled={loading}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
           <label className="block text-sm font-medium text-gray-700">Tipo</label>
           <select
             value={formData.type}
             onChange={(e) => setFormData({...formData, type: e.target.value as CounterpartType})}
             className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white sm:text-sm"
             disabled={loading}
           >
             <option value={CounterpartType.INDIVIDUAL}>Pessoa Física</option>
             <option value={CounterpartType.COMPANY}>Pessoa Jurídica</option>
             <option value={CounterpartType.GOVERNMENT}>Órgão Público</option>
           </select>
        </div>
        <div>
           <label className="block text-sm font-medium text-gray-700">Documento</label>
           <input
             type="text"
             value={formData.cpf_cnpj}
             onChange={(e) => setFormData({...formData, cpf_cnpj: e.target.value})}
             className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
             disabled={loading}
           />
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-gray-100 mt-4">
         <div>
            {initialData && onDelete && (
              <DeleteButton
                tableName="counterparts"
                recordId={initialData.id}
                recordName={initialData.name}
                onDelete={handleDeleteSuccess}
                variant="destructive"
                size="sm"
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 transition-colors"
              />
            )}
         </div>
         <div className="flex gap-2">
           {onCancel && (
             <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white" disabled={loading}>
               Cancelar
             </button>
           )}
           <button type="submit" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700" disabled={loading}>
             {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
             Salvar
           </button>
         </div>
      </div>
    </form>
  );
};