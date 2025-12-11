import React, { useEffect, useState } from 'react';
import { useCounterparts } from '../hooks/useCounterparts';
import { CounterpartForm } from './CounterpartForm';
import CounterpartList from './CounterpartList';
import { Counterpart } from '../types';
import { ShieldAlert, PlusCircle, Loader2, Search, X } from 'lucide-react';

const Contrapartes: React.FC = () => {
  const { counterparts, loading, error, fetchCounterparts, createCounterpart, updateCounterpart } = useCounterparts();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCounterpart, setEditingCounterpart] = useState<Counterpart | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchCounterparts(searchTerm);
  }, [fetchCounterparts, searchTerm]);

  const handleSubmit = async (data: any) => {
    if (editingCounterpart) {
      await updateCounterpart(editingCounterpart.id, data);
    } else {
      await createCounterpart(data);
    }
    closeModal();
  };

  const handleDeleted = () => {
     fetchCounterparts(searchTerm);
     if (editingCounterpart) {
         closeModal();
     }
  };

  const openModal = (counterpart?: Counterpart) => {
    if (counterpart) {
      setEditingCounterpart(counterpart);
    } else {
      setEditingCounterpart(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCounterpart(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contrapartes</h1>
          <p className="mt-1 text-sm text-gray-500">Gestão de partes contrárias e advogados adversos</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
         
         {/* Header & Filter & Add Button */}
         <div className="px-6 py-4 border-b border-blue-500 bg-blue-600 flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div className="flex items-center">
              <ShieldAlert className="h-5 w-5 text-white mr-2" />
              <h3 className="font-semibold text-white">Lista de Contrapartes</h3>
              <span className="ml-2 bg-white/20 text-white text-xs font-bold px-2.5 py-0.5 rounded-full border border-white/20">{counterparts.length}</span>
           </div>
           
           <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative flex-grow sm:flex-grow-0">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por nome ou documento..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-4 py-2 text-sm border border-blue-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 w-full sm:w-64 bg-white text-gray-900"
                  />
               </div>
               <button
                  onClick={() => openModal()}
                  className="inline-flex items-center justify-center px-4 py-2 border border-white text-sm font-medium rounded-lg text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white shadow-sm"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Nova Contraparte
                </button>
           </div>
         </div>

         {error && <div className="p-4 bg-red-50 text-red-600 text-sm border-b border-red-100">{error}</div>}
         
         {loading && counterparts.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
               <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-500" />
               Carregando...
            </div>
         ) : (
            <>
              {counterparts.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  Nenhuma contraparte encontrada.
                </div>
              ) : (
                <CounterpartList 
                  counterparts={counterparts} 
                  onDelete={handleDeleted} 
                  onEdit={openModal}
                />
              )}
            </>
         )}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            
            {/* Background overlay */}
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={closeModal}></div>

            {/* Modal panel */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    {editingCounterpart ? 'Editar Contraparte' : 'Nova Contraparte'}
                  </h3>
                  <button
                    onClick={closeModal}
                    className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <CounterpartForm 
                  initialData={editingCounterpart}
                  onSubmit={handleSubmit} 
                  loading={loading} 
                  onCancel={closeModal}
                  onDelete={handleDeleted}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contrapartes;