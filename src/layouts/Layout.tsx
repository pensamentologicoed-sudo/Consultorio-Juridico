import React from 'react';
import { Scale, Menu, X, Phone, Mail, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { cn } from '../utils/cn';

const Layout = ({ children }: { children: React.ReactNode }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            {/* Top Bar - Contact Info */}
            <div className="bg-slate-900 text-slate-300 py-2 px-4 text-sm hidden md:block">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex gap-6">
                        <span className="flex items-center gap-2"><Phone size={14} /> (11) 99999-9999</span>
                        <span className="flex items-center gap-2"><Mail size={14} /> contato@consultoriajuridica.com.br</span>
                    </div>
                    <div className="flex gap-4">
                        <Link to="/login" className="hover:text-white transition-colors">Área do Cliente</Link>
                    </div>
                </div>
            </div>

            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        {/* Logo */}
                        <div className="flex items-center gap-2">
                            <div className="bg-slate-900 p-2 rounded-lg">
                                <Scale className="text-amber-500 h-6 w-6" />
                            </div>
                            <span className="text-2xl font-serif font-bold text-slate-900 tracking-tight">
                                Juris<span className="text-amber-600">Consult</span>
                            </span>
                        </div>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex gap-8 items-center">
                            {['Início', 'Sobre', 'Áreas de Atuação', 'Equipe', 'Contato'].map((item) => (
                                <a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`} className="text-slate-600 hover:text-slate-900 font-medium transition-colors">
                                    {item}
                                </a>
                            ))}
                            <Link
                                to="/agendar"
                                className="bg-slate-900 text-white px-5 py-2.5 rounded-md hover:bg-slate-800 transition-colors font-medium text-sm"
                            >
                                Agendar Consulta
                            </Link>
                        </nav>

                        {/* Mobile Menu Button */}
                        <button
                            className="md:hidden p-2 text-slate-600"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? <X /> : <Menu />}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <div className="md:hidden bg-white border-t border-slate-100 py-4 px-4 shadow-lg">
                        <nav className="flex flex-col gap-4">
                            {['Início', 'Sobre', 'Áreas de Atuação', 'Equipe', 'Contato'].map((item) => (
                                <a
                                    key={item}
                                    href={`#${item.toLowerCase().replace(/ /g, '-')}`}
                                    className="text-slate-600 hover:text-slate-900 font-medium"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {item}
                                </a>
                            ))}
                            <Link
                                to="/agendar"
                                className="bg-slate-900 text-white px-5 py-3 rounded-md text-center font-medium"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Agendar Consulta
                            </Link>
                        </nav>
                    </div>
                )}
            </header>

            {/* Main Content */}
            <main className="flex-grow">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-400 py-12">
                <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-8">
                    <div>
                        <div className="flex items-center gap-2 mb-6">
                            <Scale className="text-amber-500 h-6 w-6" />
                            <span className="text-xl font-serif font-bold text-white">
                                Juris<span className="text-amber-600">Consult</span>
                            </span>
                        </div>
                        <p className="text-sm leading-relaxed">
                            Soluções jurídicas estratégicas com excelência e compromisso ético. Seu parceiro legal para decisões seguras.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-white font-semibold mb-4">Áreas de Atuação</h3>
                        <ul className="space-y-2 text-sm">
                            <li>Direito Civil</li>
                            <li>Direito Trabalhista</li>
                            <li>Direito Empresarial</li>
                            <li>Consultoria Tributária</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-white font-semibold mb-4">Contato</h3>
                        <ul className="space-y-3 text-sm">
                            <li className="flex gap-2"><MapPin size={16} className="text-amber-500" /> Av. Paulista, 1000 - SP</li>
                            <li className="flex gap-2"><Phone size={16} className="text-amber-500" /> (11) 99999-9999</li>
                            <li className="flex gap-2"><Mail size={16} className="text-amber-500" /> contato@jurisconsult.com</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-white font-semibold mb-4">Horário</h3>
                        <p className="text-sm">Segunda a Sexta</p>
                        <p className="text-white font-medium">09:00 - 18:00</p>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-slate-800 text-center text-xs">
                    © 2024 JurisConsult. Todos os direitos reservados.
                </div>
            </footer>
        </div>
    );
};

export default Layout;
