
import React from 'react';
import { Client } from '../types';
import { User, Phone, Mail, Pencil, Trash2 } from 'lucide-react';
import DeleteButton from './DeleteButton';

interface ClientListProps {
  clients: Client[];
  onDelete: () => void;
  onEdit: (client: Client) => void;
}

const ClientList: React.FC<ClientListProps> = ({ clients, onDelete, onEdit }) => {
  const handleDeleteSuccess = (success: boolean) => {
    if (success) {
      onDelete();
    }
  };

  return (
    <div className="divide-y divide-gray-200">
      {clients.map((client) => (
        <div key={client.id} className="p-4 hover:bg-gray-50 flex items-center justify-between transition-colors group">
          <div className="flex items-center space-x-4">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0">
               <User className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-900">{client.name}</p>
                {client.status === 'active' ? (
                   <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Ativo</span>
                ) : client.status === 'inactive' ? (
                   <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Inativo</span>
                ) : (
                   <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">Potencial</span>
                )}
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center text-xs text-gray-500 sm:space-x-3 mt-1">
                 <span className="flex items-center mb-1 sm:mb-0"><Phone className="h-2.5 w-2.5 mr-1"/> {client.phone}</span>
                 {client.email && <span className="flex items-center"><Mail className="h-2.5 w-2.5 mr-1"/> {client.email}</span>}
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(client);
              }}
              className="text-gray-400 hover:text-blue-600 p-2 rounded-full hover:bg-blue-50 transition-colors"
              title="Editar"
            >
              <Pencil className="h-3 w-3" />
            </button>
            <DeleteButton 
              tableName="clients"
              recordId={client.id}
              recordName={client.name}
              onDelete={handleDeleteSuccess}
              variant="ghost"
              size="sm"
              showLabel={false}
              className="text-gray-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors"
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ClientList;
