import React, { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';
import { ClientStatus } from '../types';
import { saveClient } from '../services/api';
import DeleteButton from './DeleteButton';
import { handleSupabaseError } from '../services/supabaseClient';

interface ClientFormProps {
  initialData?: any | null;
  onSubmit: (data: any) => Promise<void>; // Kept for backward compat signature in App.tsx wrapper if needed
  onCancel: () => void;
  onDelete?: () => void;
  loading?: boolean;
  // new props pattern
  client?: any;
  onSave?: () => void;
}

export const ClientForm: React.FC<ClientFormProps> = ({
  initialData,
  onCancel,
  onDelete,
  client, // alias for initialData in new pattern
  onSave
}) => {
  const dataToUse = client || initialData;
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf_cnpj: '',
    address: '',
    status: ClientStatus.ACTIVE
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (dataToUse) {
      setFormData({
        name: dataToUse.name || '',
        email: dataToUse.email || '',
        phone: dataToUse.phone || '',
        cpf_cnpj: dataToUse.cpf_cnpj || '',
        address: dataToUse.address || '',
        status: dataToUse.status || ClientStatus.ACTIVE
      });
    }
  }, [dataToUse]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await saveClient({
        id: dataToUse?.id,
        ...formData
      });
      if (onSave) onSave(); 
    } catch (error) {
      console.error(error);
      alert(handleSupabaseError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSuccess = (success: boolean) => {
    if (success && onDelete) onDelete();
  };

  return (
    <div className="bg-white w-full">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
            <label className="block text-sm font-medium text-gray-700">Nome *</label>
            <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                disabled={isSubmitting}
            />
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    disabled={isSubmitting}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Telefone</label>
                <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    disabled={isSubmitting}
                />
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-gray-700">CPF/CNPJ</label>
                <input
                    type="text"
                    value={formData.cpf_cnpj}
                    onChange={(e) => setFormData({...formData, cpf_cnpj: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    disabled={isSubmitting}
                />
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as ClientStatus})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
                    disabled={isSubmitting}
                >
                    <option value={ClientStatus.ACTIVE}>Ativo</option>
                    <option value={ClientStatus.INACTIVE}>Inativo</option>
                </select>
            </div>
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700">Endereço</label>
            <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                disabled={isSubmitting}
            />
        </div>

        <div className="flex justify-between items-center pt-5 border-t border-gray-100 mt-6">
            <div>
                {dataToUse && (
                    <DeleteButton
                        tableName="clients"
                        recordId={dataToUse.id}
                        recordName={dataToUse.name}
                        onDelete={handleDeleteSuccess}
                        variant="destructive"
                        size="sm"
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none transition-colors"
                    />
                )}
            </div>
            <div className="flex gap-3">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                    disabled={isSubmitting}
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        'Salvando...'
                    ) : (
                        <>
                            <Save className="h-4 w-4 mr-2" />
                            Salvar
                        </>
                    )}
                </button>
            </div>
        </div>
      </form>
    </div>
  );
};