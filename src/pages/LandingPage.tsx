import React from 'react';
import Layout from '../layouts/Layout';
import { ArrowRight, Shield, Clock, Award, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
    return (
        <Layout>
            {/* Hero Section */}
            <section className="relative bg-slate-900 text-white py-24 lg:py-32 overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/90 to-transparent"></div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-sm font-medium mb-6 border border-amber-500/20">
                            <Shield size={14} /> Excelência Jurídica
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold leading-tight mb-6">
                            Defendendo seus direitos com <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">estratégia e dedicação</span>.
                        </h1>
                        <p className="text-lg text-slate-300 mb-8 leading-relaxed max-w-xl">
                            Nossa equipe de especialistas oferece consultoria jurídica completa, combinando tradição e inovação para garantir os melhores resultados para você e sua empresa.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link to="/agendar" className="inline-flex justify-center items-center gap-2 bg-amber-500 text-slate-900 px-6 py-3.5 rounded-lg font-bold hover:bg-amber-400 transition-all transform hover:scale-105">
                                Agendar Consulta <ArrowRight size={18} />
                            </Link>
                            <a href="#areas" className="inline-flex justify-center items-center gap-2 bg-white/10 text-white px-6 py-3.5 rounded-lg font-semibold hover:bg-white/20 transition-all backdrop-blur-sm">
                                Nossas Áreas
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features / Trust Indicators */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: Shield, title: "Segurança Jurídica", desc: "Análise minuciosa para mitigar riscos e proteger seu patrimônio." },
                            { icon: Clock, title: "Agilidade", desc: "Atuação proativa e célere para resolução eficiente de conflitos." },
                            { icon: Award, title: "Experiência Comprovada", desc: "Anos de atuação com alto índice de êxito em causas complexas." }
                        ].map((feature, idx) => (
                            <div key={idx} className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg transition-shadow">
                                <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center mb-4 text-amber-500">
                                    <feature.icon size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h3>
                                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* About Section Preview */}
            <section id="sobre" className="py-20 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-12">
                    <div className="md:w-1/2 relative">
                        <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                            <img
                                src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80"
                                alt="Meeting"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-xl shadow-xl border border-slate-100 max-w-xs hidden lg:block">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="text-4xl font-bold text-amber-500">15+</div>
                                <div className="text-sm font-semibold text-slate-900 leading-tight">Anos de<br />Excelência</div>
                            </div>
                            <p className="text-xs text-slate-500">Comprometidos com a justiça e a satisfação de nossos clientes.</p>
                        </div>
                    </div>
                    <div className="md:w-1/2">
                        <h2 className="text-sm font-bold text-amber-600 uppercase tracking-wider mb-2">Sobre Nós</h2>
                        <h3 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-6">Advocacia moderna com valores tradicionais.</h3>
                        <p className="text-slate-600 mb-6 leading-relaxed">
                            Fundado com o objetivo de oferecer um atendimento personalizado e de alta qualidade, nosso escritório se destaca pela excelência técnica e pelo compromisso inabalável com a ética.
                        </p>
                        <ul className="space-y-3 mb-8">
                            {[
                                "Atendimento Personalizado e Humanizado",
                                "Especialistas em Diversas Áreas do Direito",
                                "Transparência e Comunicação Clara"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                                    <CheckCircle2 size={18} className="text-green-600" /> {item}
                                </li>
                            ))}
                        </ul>
                        <Link to="/sobre" className="text-slate-900 font-bold border-b-2 border-amber-500 hover:text-amber-600 transition-colors inline-block pb-1">
                            Conheça Nossa História
                        </Link>
                    </div>
                </div>
            </section>
        </Layout>
    );
};

export default LandingPage;
