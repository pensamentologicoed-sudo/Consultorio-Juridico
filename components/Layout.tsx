
import React, { useState } from 'react';
import { 
  Briefcase, 
  LogOut, 
  Menu,
  X,
  LayoutDashboard,
  Users,
  Scale,
  Calendar,
  FileText,
  PieChart,
  Clock,
  ShieldAlert,
  Bot,
  Calculator,
  Settings,
  Trash2,
  Loader2
} from 'lucide-react';
import { User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentUser: User;
  onLogout: () => void;
  currentView: string;
  onNavigate: (view: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  currentUser, 
  onLogout,
  currentView,
  onNavigate
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', id: 'dashboard', icon: LayoutDashboard },
    { name: 'Clientes', id: 'clients', icon: Users },
    { name: 'Processos', id: 'cases', icon: Scale },
    { name: 'Prazos', id: 'deadlines', icon: Clock },
    { name: 'Agenda', id: 'agenda', icon: Calendar },
    { name: 'Documentos', id: 'documents', icon: FileText },
    { name: 'Contrapartes', id: 'counterparts', icon: ShieldAlert },
    { name: 'Assistente IA', id: 'ai_assistant', icon: Bot },
    { name: 'Calc. Prazos', id: 'calculator', icon: Calculator },
    { name: 'Relatórios', id: 'reports', icon: PieChart },
    { name: 'Lixeira', id: 'trash', icon: Trash2 },
    { name: 'Configurações', id: 'settings', icon: Settings },
  ];

  const handleNavClick = (viewId: string) => {
    onNavigate(viewId);
    setIsMobileMenuOpen(false);
  };

  const getRoleLabel = (role: string) => {
    const r = role.toLowerCase();
    if (r === 'lawyer') return 'Advogado';
    if (r === 'admin') return 'Administrador';
    if (r === 'assistant') return 'Assessor';
    if (r === 'client') return 'Cliente';
    return role;
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f3f4f6] font-sans">
      
      {/* Sidebar Desktop - Luxury Black & Gold */}
      <aside className="hidden md:flex md:flex-col w-64 bg-[#0a0a0a] text-white flex-shrink-0 transition-all duration-300 shadow-2xl z-20 border-r border-brand-gold/10">
        
        {/* Logo Section */}
        <div className="flex items-center h-20 px-8 bg-[#131313] border-b border-brand-gold/20 relative">
          <div className="relative h-6 w-6 shrink-0 mr-3 flex items-center justify-center">
            {currentUser.logoUrl ? (
              <img src={currentUser.logoUrl} alt="Escritório Logo" className="h-full w-full object-contain" />
            ) : (
              <Briefcase className="h-4 w-4 text-brand-gold" />
            )}
          </div>

          <div className="flex flex-col">
            <span className="text-lg font-black text-brand-gold tracking-tighter leading-tight">Sistema</span>
            <span className="text-[9px] text-white font-bold opacity-40 uppercase tracking-[0.2em] -mt-1">Jurídico</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-1 overflow-y-auto custom-scrollbar">
          {navigation.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full group flex items-center px-4 py-2.5 text-[9px] font-bold uppercase tracking-wider rounded-xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-[#1a1a1a] text-brand-gold border border-brand-gold/30 shadow-lg' 
                    : 'text-gray-500 hover:text-brand-gold hover:bg-white/5'
                }`}
              >
                <item.icon className={`mr-3 h-3.5 w-3.5 ${isActive ? 'text-brand-gold' : 'text-gray-600 group-hover:text-brand-gold'}`} />
                {item.name}
              </button>
            );
          })}
        </nav>

        <div className="p-6 bg-[#050505] border-t border-brand-gold/10">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-[#131313] to-black flex items-center justify-center text-brand-gold font-bold border border-brand-gold/30 overflow-hidden shrink-0 shadow-lg">
              {currentUser.avatarUrl ? (
                <img src={currentUser.avatarUrl} className="h-full w-full object-cover" alt="User Avatar" />
              ) : (
                <span className="text-xs">{currentUser.name.charAt(0)}</span>
              )}
            </div>
            
            <div className="ml-3 overflow-hidden">
              <p className="text-[10px] font-black text-white truncate uppercase tracking-tight">{currentUser.name}</p>
              <p className="text-[8px] text-brand-gold font-bold uppercase opacity-60 tracking-widest">
                {getRoleLabel(currentUser.role)}
              </p>
            </div>
          </div>
          
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center px-4 py-2.5 text-[9px] font-bold uppercase tracking-widest text-brand-gold bg-[#131313] hover:bg-black rounded-xl transition-all border border-brand-gold/20"
          >
            <LogOut className="h-3 w-3 mr-2" />
            Sair
          </button>
        </div>
      </aside>

      {/* Mobile Toggle */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 bg-[#131313] text-brand-gold rounded-lg shadow-lg border border-brand-gold/20"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Sidebar */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
           <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
           <aside className="relative w-64 bg-[#0a0a0a] h-full flex flex-col shadow-2xl border-r border-brand-gold/10 animate-in slide-in-from-left duration-300">
             <div className="flex-1 px-4 py-20 space-y-1 overflow-y-auto">
                {navigation.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full group flex items-center px-4 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                      currentView === item.id ? 'bg-[#1a1a1a] text-brand-gold border border-brand-gold/20' : 'text-gray-500'
                    }`}
                  >
                    <item.icon className="mr-3 h-4 w-4" />
                    {item.name}
                  </button>
                ))}
             </div>
           </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 sm:p-10 custom-scrollbar">
          <div className="max-w-5xl mx-auto">
             {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
