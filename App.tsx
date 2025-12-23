
import React, { useState, useEffect, useCallback } from 'react';
import Layout from './components/Layout';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Processos from './components/Processos';
import Prazos from './components/Prazos';
import Agenda from './components/Agenda';
import Documentos from './components/Documentos';
import Relatorios from './components/Relatorios';
import Contrapartes from './components/Contrapartes';
import Trash from './components/Trash';
import AiAssistant from './components/AiAssistant';
import DeadlineTracker from './components/DeadlineTracker';
import Settings from './components/Settings';
import { useAuth } from './hooks/useAuth';
import { User, UserRole, Client } from './types';
import { Loader2, PlusCircle, Users, Search, X } from 'lucide-react';
import { useClients } from './hooks/useClients';
import { SystemSetup } from './components/SystemSetup';
import ClientList from './components/ClientList';
import { ClientForm } from './components/ClientForm';
import TrashList from './components/TrashList';

const App: React.FC = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [targetCaseId, setTargetCaseId] = useState<string | null>(null);
  
  const { 
    clients, 
    fetchClients, 
    loading: clientsLoading, 
    error: clientsError 
  } = useClients();

  const [activeTab, setActiveTab] = useState<'active' | 'trash'>('active');
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  useEffect(() => {
    if (user) {
      const metadata = user.user_metadata || {};
      setCurrentUser({
        id: user.id,
        email: user.email || '',
        name: metadata.full_name || metadata.name || metadata.display_name || 'Usuário',
        role: (metadata.role as UserRole) || UserRole.LAWYER,
        avatarUrl: metadata.avatarUrl || '',
        logoUrl: metadata.logoUrl || '',
        cpf: metadata.cpf,
        oab: metadata.oab,
        phone: metadata.phone
      });
    } else {
      setCurrentUser(null);
    }
  }, [user]);

  useEffect(() => {
    if (currentUser && currentView === 'clients' && activeTab === 'active') {
      fetchClients(clientSearchTerm);
    }
  }, [currentUser, currentView, activeTab, clientSearchTerm, fetchClients]);

  const handleLogout = async () => {
    await signOut();
    setCurrentUser(null);
  };

  const handleNavigate = (view: string, caseId?: string) => {
    if (caseId) setTargetCaseId(caseId);
    else setTargetCaseId(null);
    setCurrentView(view);
  };

  const openClientModal = (client?: Client) => {
    setEditingClient(client || null);
    setIsClientModalOpen(true);
  };

  const handleRestoreCallback = (tableName: string) => {
    if (tableName === 'clients') fetchClients(clientSearchTerm);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#cfcfcf] flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-[#D4AF37] animate-spin" />
      </div>
    );
  }

  if (!currentUser) return <Login onLogin={() => {}} />;

  const renderView = () => {
    switch(currentView) {
      case 'dashboard': return <Dashboard onNavigate={handleNavigate} />;
      case 'clients':
        return (
          <div className="space-y-6 animate-in fade-in">
             {clientsError === 'tabela_missing' && <SystemSetup />}
             <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
               <div>
                  <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Gestão de Clientes</h1>
                  <p className="mt-1 text-sm text-gray-500 font-medium">Administre sua base de clientes e documentos anexos</p>
               </div>
               {activeTab === 'active' && (
                 <button onClick={() => openClientModal()} className="inline-flex items-center justify-center px-6 py-3 border border-[#D4AF37]/50 text-[10px] font-black uppercase tracking-widest rounded-xl text-[#D4AF37] bg-[#131313] hover:bg-black shadow-xl transition-all">
                    <PlusCircle className="h-4 w-4 mr-2" /> Novo Cliente
                  </button>
               )}
            </div>

            <div className="bg-white rounded-xl p-1.5 inline-flex border border-gray-200 shadow-sm">
              <button onClick={() => setActiveTab('active')} className={`flex items-center px-6 py-2.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'active' ? 'bg-[#131313] text-[#D4AF37] shadow-lg' : 'text-gray-400'}`}>Ativos ({clients.length})</button>
              <button onClick={() => setActiveTab('trash')} className={`flex items-center px-6 py-2.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'trash' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-400'}`}>Arquivados</button>
            </div>

            {activeTab === 'active' ? (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                 <div className="px-8 py-5 border-b border-[#D4AF37]/20 bg-[#131313] flex items-center justify-between">
                   <div className="flex items-center"><Users className="h-5 w-5 text-[#D4AF37] mr-3" /><h3 className="font-bold text-[#D4AF37] text-sm uppercase tracking-widest">Listagem de Clientes</h3></div>
                   <div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" /><input type="text" placeholder="Pesquisar..." value={clientSearchTerm} onChange={(e) => setClientSearchTerm(e.target.value)} className="pl-10 pr-4 py-2.5 text-xs border border-[#333] rounded-xl focus:outline-none w-full sm:w-80 bg-white shadow-inner"/></div>
                 </div>
                 {clientsLoading ? <div className="p-20 text-center"><Loader2 className="h-10 w-10 animate-spin mx-auto text-[#D4AF37]" /></div> : <ClientList clients={clients} onDelete={() => fetchClients(clientSearchTerm)} onEdit={openClientModal} />}
              </div>
            ) : (
              <TrashList onRestore={() => fetchClients(clientSearchTerm)} />
            )}
          </div>
        );
      case 'cases': return <Processos initialSelectedCaseId={targetCaseId} onClearTarget={() => setTargetCaseId(null)} />;
      case 'deadlines': return <Prazos />;
      case 'agenda': return <Agenda onNavigate={handleNavigate} />;
      case 'documents': return <Documentos />;
      case 'reports': return <Relatorios />;
      case 'counterparts': return <Contrapartes />;
      case 'trash': return <Trash onRestore={handleRestoreCallback} />;
      case 'ai_assistant': return <AiAssistant />;
      case 'calculator': return <DeadlineTracker />;
      case 'settings': return <Settings />;
      default: return <div>Página não encontrada</div>;
    }
  };

  return (
    <Layout currentUser={currentUser!} onLogout={handleLogout} currentView={currentView} onNavigate={handleNavigate}>
      {renderView()}
      {isClientModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsClientModalOpen(false)} />
          <div className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-white/20 animate-in zoom-in-95">
             <div className="flex justify-between items-center p-8 bg-[#131313] border-b border-brand-gold/30">
                <div><h3 className="text-xl font-bold text-brand-gold">{editingClient ? 'Ajustar Cadastro' : 'Novo Registro'}</h3><p className="text-[9px] text-white/40 font-black uppercase mt-1">Identidade Jurídica de Performance</p></div>
                <button onClick={() => setIsClientModalOpen(false)} className="text-white/40 hover:text-white"><X className="h-6 w-6" /></button>
             </div>
             <div className="p-8 overflow-y-auto custom-scrollbar bg-white">
                <ClientForm client={editingClient} onSave={() => { fetchClients(); setIsClientModalOpen(false); }} onCancel={() => setIsClientModalOpen(false)} />
             </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;
