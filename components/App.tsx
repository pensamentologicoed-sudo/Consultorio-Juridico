import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import Login from './Login';
import Dashboard from './Dashboard';
import Processos from './Processos';
import Prazos from './Prazos';
import Agenda from './Agenda';
import Documentos from './Documentos';
import Relatorios from './Relatorios';
import Contrapartes from './Contrapartes';
import Trash from './Trash';
import { useAuth } from '../hooks/useAuth';
import { User, UserRole } from '../types';
import { Loader2, PlusCircle, Users, Search, X, Trash2, CheckCircle2 } from 'lucide-react';

// New Clients View Imports
import { getClients, Client } from '../services/api';
import ClientList from './ClientList';
import { ClientForm } from './ClientForm';
import TrashList from './TrashList';

const App: React.FC = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState('dashboard');
  
  // Clients View State
  const [activeTab, setActiveTab] = useState<'active' | 'trash'>('active');
  const [clients, setClients] = useState<Client[]>([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  useEffect(() => {
    if (user) {
      mapAndSetUser(user);
    } else {
      setCurrentUser(null);
    }
  }, [user]);

  // Load clients effect
  useEffect(() => {
    if (currentUser && currentView === 'clients' && activeTab === 'active') {
      loadClients();
    }
  }, [currentUser, currentView, activeTab, clientSearchTerm]);

  const mapAndSetUser = (sbUser: any) => {
    const metadata = sbUser.user_metadata || {};
    const displayName = metadata.display_name || metadata.name || metadata.full_name || 'User';
    setCurrentUser({
      id: sbUser.id,
      email: sbUser.email || '',
      name: displayName,
      role: (metadata.role as UserRole) || UserRole.LAWYER,
      avatarUrl: metadata.avatarUrl || '',
      cpf: metadata.cpf,
      oab: metadata.oab,
      phone: metadata.phone
    });
  };

  const handleLogout = async () => {
    await signOut();
    setCurrentUser(null);
  };

  // --- Clients View Logic ---
  const loadClients = async () => {
    setClientsLoading(true);
    try {
      const data = await getClients(clientSearchTerm);
      setClients(data);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    } finally {
      setClientsLoading(false);
    }
  };

  const openClientModal = (client?: Client) => {
    setEditingClient(client || null);
    setIsClientModalOpen(true);
  };

  const closeClientModal = () => {
    setEditingClient(null);
    setIsClientModalOpen(false);
  };

  const handleClientSave = () => {
    loadClients();
    closeClientModal();
  };

  const handleClientDelete = () => {
    loadClients();
    if (isClientModalOpen) closeClientModal();
  };

  const handleRestore = () => {
    if (activeTab === 'active') loadClients();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-[#318CE7] animate-spin" />
      </div>
    );
  }

  if (!currentUser) {
    return <Login onLogin={() => {}} />;
  }

  const renderView = () => {
    switch(currentView) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentView} />;
      case 'clients':
        return (
          <div className="space-y-6 animate-in fade-in">
             <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
               <div>
                  <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Clientes</h1>
                  <p className="mt-1 text-sm text-gray-500">Gerencie seus clientes e visualize a lixeira</p>
               </div>
               
               {activeTab === 'active' && (
                 <button
                    onClick={() => openClientModal()}
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none shadow-sm transition-colors"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Novo Cliente
                  </button>
               )}
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg p-1 inline-flex border border-gray-200 shadow-sm">
              <button
                onClick={() => setActiveTab('active')}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  activeTab === 'active' 
                    ? 'bg-blue-50 text-blue-700 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Clientes Ativos
                <span className="ml-2 bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{clients.length}</span>
              </button>
              <button
                onClick={() => setActiveTab('trash')}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  activeTab === 'trash' 
                    ? 'bg-red-50 text-red-700 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Lixeira
              </button>
            </div>

            {activeTab === 'active' ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                 <div className="px-6 py-4 border-b border-blue-500 bg-blue-600 flex items-center justify-between">
                   <div className="flex items-center">
                      <Users className="h-5 w-5 text-white mr-2" />
                      <h3 className="font-semibold text-white">Lista de Clientes</h3>
                   </div>
                   <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Buscar..."
                        value={clientSearchTerm}
                        onChange={(e) => setClientSearchTerm(e.target.value)}
                        className="pl-9 pr-4 py-2 text-sm border border-blue-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 w-full sm:w-64 bg-white text-gray-900 placeholder-gray-400"
                      />
                   </div>
                 </div>

                 {clientsLoading ? (
                    <div className="p-12 text-center text-gray-400">
                       <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-500" />
                       Carregando...
                    </div>
                 ) : clients.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">Nenhum cliente encontrado.</div>
                 ) : (
                    <ClientList 
                      clients={clients} 
                      onDelete={handleClientDelete}
                      onEdit={openClientModal}
                    />
                 )}
              </div>
            ) : (
              <TrashList onRestore={handleRestore} />
            )}

            {/* Modal */}
            {isClientModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={closeClientModal} />
                <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                   <div className="flex justify-between items-center p-6 border-b">
                      <h3 className="text-lg font-medium text-gray-900">
                        {editingClient ? 'Editar Cliente' : 'Novo Cliente'}
                      </h3>
                      <button onClick={closeClientModal} className="text-gray-400 hover:text-gray-500">
                        <X className="h-6 w-6" />
                      </button>
                   </div>
                   <div className="p-6">
                      <ClientForm 
                        client={editingClient}
                        onSave={handleClientSave} 
                        onCancel={closeClientModal}
                        onDelete={editingClient ? handleClientDelete : undefined}
                        onSubmit={async () => {}} // Backward compat
                      />
                   </div>
                </div>
              </div>
            )}
          </div>
        );
      case 'cases': return <Processos />;
      case 'deadlines': return <Prazos />;
      case 'agenda': return <Agenda />;
      case 'documents': return <Documentos />;
      case 'reports': return <Relatorios />;
      case 'counterparts': return <Contrapartes />;
      case 'trash': return <Trash />;
      default: return <div>Página não encontrada</div>;
    }
  };

  return (
    <Layout 
      currentUser={currentUser} 
      onLogout={handleLogout}
      currentView={currentView}
      onNavigate={setCurrentView}
    >
      {renderView()}
    </Layout>
  );
};

export default App;