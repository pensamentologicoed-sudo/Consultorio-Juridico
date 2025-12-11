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
  Trash2,
  Bot,
  Calculator
} from 'lucide-react';
import { User, UserRole } from '../types';

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
  ];

  const getDisplayNames = (fullName: string) => {
    const cleanName = fullName.replace(/^Dr\.?\s+/i, '');
    const parts = cleanName.trim().split(/\s+/);
    const twoNames = parts.slice(0, 2).join(' ');
    return `Dr. ${twoNames}`;
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case UserRole.LAWYER: return 'Advogado';
      case UserRole.ADMIN: return 'Administrador';
      case UserRole.INTERN: return 'Estagiário';
      case UserRole.CLIENT: return 'Cliente';
      default: return role;
    }
  };

  const handleNavClick = (viewId: string) => {
    onNavigate(viewId);
    setIsMobileMenuOpen(false);
  };

  // Permite acesso à lixeira para Admins e Advogados
  const canAccessTrash = currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.LAWYER;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      
      {/* Sidebar for Desktop - Blue Theme */}
      <aside className="hidden md:flex md:flex-col w-64 bg-blue-900 text-white flex-shrink-0 transition-all duration-300 shadow-xl z-10">
        {/* Header with Button Color (Blue-600) */}
        <div className="flex items-center h-16 px-6 bg-blue-600 border-b border-blue-500 shadow-sm">
          <Briefcase className="h-8 w-8 text-white mr-3" />
          <span className="text-xl font-bold leading-none text-white tracking-wide">LegalFlow</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
          {navigation.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-700 text-white shadow-md ring-1 ring-blue-600' 
                    : 'text-blue-100 hover:bg-blue-800 hover:text-white'
                }`}
              >
                <item.icon className={`mr-3 h-5 w-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-blue-300 group-hover:text-white'}`} />
                {item.name}
              </button>
            );
          })}
          
          {canAccessTrash && (
            <div className="pt-4 mt-4 border-t border-blue-800">
               <button
                  onClick={() => handleNavClick('trash')}
                  className={`w-full group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    currentView === 'trash' 
                      ? 'bg-red-900/40 text-red-100 border border-red-800' 
                      : 'text-blue-200 hover:bg-blue-800 hover:text-red-200'
                  }`}
                >
                  <Trash2 className="mr-3 h-5 w-5 flex-shrink-0" />
                  Lixeira
                </button>
            </div>
          )}
        </nav>

        <div className="p-4 bg-blue-900 border-t border-blue-800">
          <div className="flex items-center mb-4">
            <div className="h-9 w-9 rounded-full bg-white flex items-center justify-center text-blue-900 font-bold border-2 border-blue-200">
              {currentUser.name.charAt(0)}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white truncate w-32">{getDisplayNames(currentUser.name)}</p>
              <p className="text-xs text-blue-200 uppercase">{getRoleDisplayName(currentUser.role)}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center px-4 py-2 text-sm text-blue-100 bg-blue-800 hover:bg-blue-700 hover:text-white rounded-lg transition-colors border border-blue-700"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </button>
        </div>
      </aside>

      {/* Mobile Header & Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Mobile Header */}
        <header className="md:hidden bg-blue-600 text-white shadow-md z-20 flex items-center justify-between px-4 h-16 shrink-0">
          <div className="flex items-center">
            <Briefcase className="h-6 w-6 text-white mr-2" />
            <span className="font-bold text-lg">LegalFlow</span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 rounded-md text-blue-100 hover:bg-blue-500 focus:outline-none"
          >
            <Menu className="h-6 w-6" />
          </button>
        </header>

        {/* Mobile Menu Off-Canvas Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-blue-900/90 backdrop-blur-sm transition-opacity" 
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Sidebar Drawer */}
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-blue-900 text-white shadow-xl animate-in slide-in-from-left duration-300 border-r border-blue-800">
              {/* Close Button & Header */}
              <div className="flex items-center justify-between h-16 px-6 bg-blue-600 shrink-0 border-b border-blue-500">
                <div className="flex items-center">
                  <Briefcase className="h-6 w-6 text-white mr-2" />
                  <span className="font-bold text-lg text-white">LegalFlow</span>
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 rounded-md text-blue-100 hover:text-white hover:bg-blue-500 focus:outline-none"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                {navigation.map((item) => {
                  const isActive = currentView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full group flex items-center px-3 py-3 text-base font-medium rounded-lg transition-colors ${
                        isActive 
                          ? 'bg-blue-700 text-white shadow-sm' 
                          : 'text-blue-100 hover:bg-blue-800 hover:text-white'
                      }`}
                    >
                      <item.icon className={`mr-3 h-5 w-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-blue-300 group-hover:text-white'}`} />
                      {item.name}
                    </button>
                  );
                })}
                
                {canAccessTrash && (
                  <div className="pt-4 mt-4 border-t border-blue-800">
                     <button
                        onClick={() => handleNavClick('trash')}
                        className={`w-full group flex items-center px-3 py-3 text-base font-medium rounded-lg transition-colors ${
                          currentView === 'trash' 
                             ? 'bg-red-900/40 text-red-100 border border-red-800' 
                             : 'text-blue-200 hover:bg-blue-800 hover:text-red-200'
                        }`}
                      >
                        <Trash2 className="mr-3 h-5 w-5 flex-shrink-0" />
                        Lixeira
                      </button>
                  </div>
                )}
              </nav>

              {/* User Footer */}
              <div className="p-4 bg-blue-900 border-t border-blue-800 shrink-0">
                <div className="flex items-center mb-4">
                  <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-blue-900 font-bold border-2 border-blue-200 shrink-0">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div className="ml-3 overflow-hidden">
                    <p className="text-sm font-medium text-white truncate">{getDisplayNames(currentUser.name)}</p>
                    <p className="text-xs text-blue-200 uppercase">{getRoleDisplayName(currentUser.role)}</p>
                  </div>
                </div>
                <button 
                  onClick={onLogout}
                  className="w-full flex items-center justify-center px-4 py-3 text-sm text-blue-100 bg-blue-800 hover:bg-blue-700 hover:text-white rounded-lg transition-colors font-medium border border-blue-700"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </button>
              </div>
            </div>
            
            {/* Clickable area to close (remaining space) */}
            <div className="flex-shrink-0 w-14" aria-hidden="true">
              {/* Dummy element to force drawer width */}
            </div>
          </div>
        )}

        {/* Main Content Scrollable Area */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-8">
          <div className="max-w-7xl mx-auto">
             {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;