import React from 'react';
import { Counterpart, CounterpartType } from '../types';
import { User, ShieldAlert, Building2, Landmark, Phone, Mail, Pencil } from 'lucide-react';
import DeleteButton from './DeleteButton';

interface CounterpartListProps {
  counterparts: Counterpart[];
  onDelete: () => void;
  onEdit: (counterpart: Counterpart) => void;
}

const CounterpartList: React.FC<CounterpartListProps> = ({ counterparts, onDelete, onEdit }) => {
  const handleDeleteSuccess = (success: boolean) => {
    if (success) onDelete();
  };

  const getTypeIcon = (type: CounterpartType) => {
    switch (type) {
      case CounterpartType.COMPANY: return <Building2 className="w-4 h-4" />;
      case CounterpartType.GOVERNMENT: return <Landmark className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  return (
    <div className="divide-y divide-gray-200">
      {counterparts.map((cp) => (
        <div key={cp.id} className="p-4 hover:bg-gray-50 flex items-center justify-between transition-colors">
          <div className="flex items-center space-x-4">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 
              ${cp.type === CounterpartType.GOVERNMENT ? 'bg-orange-100 text-orange-600' : 
                cp.type === CounterpartType.COMPANY ? 'bg-purple-100 text-purple-600' : 'bg-red-100 text-red-600'}`}>
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{cp.name}</p>
              <div className="flex items-center gap-2 mt-1">
                 <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 gap-1">
                    {getTypeIcon(cp.type)} {cp.type}
                 </span>
                 {cp.email && <span className="text-xs text-gray-500">{cp.email}</span>}
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <button onClick={() => onEdit(cp)} className="text-gray-400 hover:text-blue-600 p-2 rounded-full">
               <Pencil className="h-4 w-4" />
            </button>
            <DeleteButton 
              tableName="counterparts" 
              recordId={cp.id}
              recordName={cp.name}
              onDelete={handleDeleteSuccess} 
              variant="ghost"
              size="sm"
              showLabel={false}
              className="text-gray-400 hover:text-red-600 p-2 rounded-full"
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default CounterpartList;