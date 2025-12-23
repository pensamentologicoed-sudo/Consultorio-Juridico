import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    FileText,
    Settings,
    LogOut,
    Scale,
    Menu,
    X,
    Bell,
    Search
} from 'lucide-react';
import { cn } from '../utils/cn';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Meus Processos', href: '/dashboard/processos', icon: Scale },
        { name: 'Documentos', href: '/dashboard/documentos', icon: FileText },
        { name: 'Configurações', href: '/dashboard/configuracoes', icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar Overlay for Mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={cn(
                "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-200 ease-in-out lg:transform-none flex flex-col",
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="h-16 flex items-center px-6 border-b border-slate-800">
                    <Scale className="text-amber-500 h-6 w-6 mr-2" />
                    <span className="text-xl font-serif font-bold">Juris<span className="text-amber-600">Consult</span></span>
                </div>

                <div className="flex-1 overflow-y-auto py-4">
                    <nav className="px-4 space-y-1">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={cn(
                                    "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                                    location.pathname === item.href
                                        ? "bg-amber-600 text-white"
                                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                )}
                            >
                                <item.icon className="mr-3 h-5 w-5" />
                                {item.name}
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="p-4 border-t border-slate-800">
                    <button className="flex items-center w-full px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                        <LogOut className="mr-3 h-5 w-5" />
                        Sair
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top Header */}
                <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
                    <button
                        className="lg:hidden p-2 text-slate-600"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu className="h-6 w-6" />
                    </button>

                    <div className="flex-1 flex justify-between items-center ml-4 lg:ml-0">
                        <div className="relative max-w-md w-full hidden md:block">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Buscar processos, documentos..."
                                className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 hover:bg-white transition-colors"
                            />
                        </div>

                        <div className="flex items-center gap-4">
                            <button className="p-2 text-slate-400 hover:text-slate-600 relative">
                                <Bell className="h-6 w-6" />
                                <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full border border-white"></span>
                            </button>
                            <div className="h-8 w-8 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-sm">
                                ED
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dashboard Content */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
