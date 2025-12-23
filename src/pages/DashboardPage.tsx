import { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { Clock, FolderOpen, AlertCircle, FileText } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../hooks/useAuth';

const DashboardPage = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState([
        { name: 'Processos Ativos', value: '0', icon: FolderOpen, color: 'bg-blue-500' },
        { name: 'Clientes', value: '0', icon: AlertCircle, color: 'bg-red-500' }, // Changed from Pendências to Clientes for now
        { name: 'Próximas Audiências', value: '0', icon: Clock, color: 'bg-amber-500' },
        { name: 'Documentos', value: '0', icon: FileText, color: 'bg-green-500' },
    ]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch cases count
                const { count: casesCount } = await supabase
                    .from('legal_cases')
                    .select('*', { count: 'exact', head: true });

                // Fetch clients count
                const { count: clientsCount } = await supabase
                    .from('clients')
                    .select('*', { count: 'exact', head: true });

                // Fetch documents count
                const { count: docsCount } = await supabase
                    .from('documents')
                    .select('*', { count: 'exact', head: true });

                setStats([
                    { name: 'Processos Ativos', value: casesCount?.toString() || '0', icon: FolderOpen, color: 'bg-blue-500' },
                    { name: 'Clientes', value: clientsCount?.toString() || '0', icon: AlertCircle, color: 'bg-red-500' },
                    { name: 'Próximas Audiências', value: '0', icon: Clock, color: 'bg-amber-500' }, // Hardcoded for now as verified schema doesn't have "audiences" specifically yet
                    { name: 'Documentos', value: docsCount?.toString() || '0', icon: FileText, color: 'bg-green-500' },
                ]);
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
            }
        };

        fetchStats();
    }, []);

    return (
        <DashboardLayout>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Bem-vindo, {user?.email || 'Dr. Ediel'}</h1>
                <p className="text-slate-600">Aqui está o resumo dos seus processos jurídicos.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat) => (
                    <div key={stat.name} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500">{stat.name}</p>
                                <p className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</p>
                            </div>
                            <div className={`p-3 rounded-lg ${stat.color} text-white`}>
                                <stat.icon className="h-6 w-6" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Activity */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-4">Atualizações Recentes</h2>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex gap-4 items-start pb-4 border-b last:border-0 border-slate-100">
                                <div className="h-2 w-2 rounded-full bg-amber-500 mt-2 flex-shrink-0"></div>
                                <div>
                                    <p className="text-sm font-medium text-slate-900">Atualização no Processo nº 00123.2024</p>
                                    <p className="text-sm text-slate-500 mt-1">Juntada de petição pela parte contrária.</p>
                                    <p className="text-xs text-slate-400 mt-2">Hoje, 14:30</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Upcoming Hearings */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-4">Próximos Compromissos</h2>
                    <div className="space-y-4">
                        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-amber-900">Audiência de Conciliação</h3>
                                    <p className="text-sm text-amber-700 mt-1">Trabalhista - Ref: 00456.2023</p>
                                </div>
                                <span className="bg-white text-amber-800 text-xs px-2 py-1 rounded font-bold shadow-sm">18 DEZ</span>
                            </div>
                            <div className="flex items-center gap-2 mt-3 text-sm text-amber-800">
                                <Clock size={16} /> 10:00 - Online (Zoom)
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default DashboardPage;
