import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useSoftDelete } from '../hooks/useSoftDelete';

interface ConfirmDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  item: any;
  tableName: 'clients' | 'legal_cases' | 'counterparts';
}

const ConfirmDeleteDialog: React.FC<ConfirmDeleteDialogProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  item, 
  tableName 
}) => {
  const [reason, setReason] = useState('');
  const { softDelete, isDeleting } = useSoftDelete();

  const handleDelete = async () => {
    if (!item || !item.id) return;
    
    const result = await softDelete(tableName, item.id, reason);

    if (result.success) {
        onConfirm();
        onClose();
    } else {
        alert(`Erro ao excluir: ${result.error}`);
    }
  };

  if (!isOpen) return null;

  const getItemName = () => {
      if (tableName === 'legal_cases') return `Processo: ${item.case_number} - ${item.title}`;
      return item.name;
  };

  const dialogContent = (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <h3 className="text-lg font-bold text-red-600 mb-4 flex items-center">
          Confirmar Exclusão
        </h3>
        
        <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg">
          <p className="font-medium text-red-800 mb-1">Você está prestes a excluir:</p>
          <p className="text-gray-800 font-semibold text-sm">
            {getItemName()}
          </p>
          <p className="text-xs text-red-600 mt-2">
            O item será movido para a lixeira e poderá ser recuperado posteriormente.
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Motivo da exclusão (opcional):
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            rows={3}
            placeholder="Ex: Dados duplicados, solicitação do cliente..."
          />
        </div>

        <div className="flex justify-end space-x-3 pt-2 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            disabled={isDeleting}
          >
            Cancelar
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 flex items-center"
          >
            {isDeleting ? (
                <>Excluindo...</>
            ) : 'Confirmar Exclusão'}
          </button>
        </div>
      </div>
    </div>
  );

  // Renderiza o diálogo no body do documento, fora de qualquer modal/overflow pai
  return createPortal(dialogContent, document.body);
};

export default ConfirmDeleteDialog;