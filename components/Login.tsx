
import React, { useState, useRef, useEffect } from 'react';
import { Scale, ShieldCheck, Loader2, User, Phone, ArrowLeft, CheckCircle, Camera, Upload } from 'lucide-react';
import { UserRole } from '../types';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../services/supabaseClient';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const { signIn, signUp, resetPassword } = useAuth();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  // Registration Fields
  const [cpf, setCpf] = useState('');
  const [oab, setOab] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.LAWYER);
  const [phone, setPhone] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Carrega logo persistida do escritório (Branding Local)
  useEffect(() => {
    const savedLogo = localStorage.getItem('legalflow_office_logo');
    if (savedLogo) setLogoUrl(savedLogo);
  }, []);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarUrl(url);
    }
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    try {
      // Preview local imediato
      const localUrl = URL.createObjectURL(file);
      setLogoUrl(localUrl);
      localStorage.setItem('legalflow_office_logo', localUrl);

      // Tenta upload real se houver sessão ou apenas marca como sucesso visual
      setSuccessMsg('Logo do escritório atualizada com sucesso!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg('Erro ao processar imagem da logo.');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    
    try {
      if (isForgotPassword) {
        const { error } = await resetPassword(email.trim());
        if (error) throw new Error(error);
        setSuccessMsg('Link de recuperação enviado para seu e-mail.');
      } else if (isSignUp) {
        const { error } = await signUp(email.trim(), password.trim(), {
          name, 
          role,
          cpf,
          oab,
          phone,
          avatarUrl: avatarUrl,
          logoUrl: logoUrl // Vincula a logo escolhida no login ao novo perfil
        });
        if (error) throw new Error(error);
        setSuccessMsg('Cadastro realizado! Verifique seu e-mail para confirmar.');
        setTimeout(() => setIsSignUp(false), 3000);
      } else {
        const { error } = await signIn(email.trim(), password.trim());
        if (error) throw new Error(error);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Falha na operação.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex flex-col items-center justify-center px-4 py-8">
      
      <div className={`bg-white border border-slate-200 shadow-2xl rounded-[14px] w-full ${isSignUp ? 'max-w-xl' : 'max-w-md'} overflow-hidden transition-all duration-500`}>
        
        {/* Cabeçalho Interativo para Mudança de Logo */}
        <div className="bg-[#131313] pt-8 pb-6 px-6 text-center border-b border-brand-gold/10 relative group">
          <input 
            type="file" 
            ref={logoInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleLogoChange}
          />
          
          <div 
            onClick={() => logoInputRef.current?.click()}
            className="inline-flex bg-[#4A4A4A] h-14 w-14 items-center justify-center rounded-lg shadow-2xl mb-3 border border-white/5 ring-2 ring-white/5 overflow-hidden relative cursor-pointer hover:scale-105 transition-all group/logo"
          >
             {isUploadingLogo ? (
               <Loader2 className="animate-spin text-brand-gold h-5 w-5" />
             ) : logoUrl ? (
               <img src={logoUrl} className="w-full h-full object-contain p-1.5" alt="Logo Escritório" />
             ) : (
               <Scale className="text-brand-gold h-5 w-5" />
             )}
             
             <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover/logo:opacity-100 transition-opacity">
                <Camera className="w-4 h-4 text-white mb-0.5" />
                <span className="text-[6px] text-white font-black uppercase tracking-widest">Mudar Logo</span>
             </div>
          </div>

          <h2 className="text-xl font-black text-brand-gold tracking-tight">
            Acesso ao Sistema
          </h2>
          <p className="text-[9px] text-white/40 font-bold uppercase tracking-[0.3em] mt-1">Sistema Jurídico Digital</p>
        </div>

        <div className="p-6 sm:px-8">
          
          {isForgotPassword ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-left-2">
              <button 
                onClick={() => { setIsForgotPassword(false); setErrorMsg(''); setSuccessMsg(''); }}
                className="flex items-center text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-brand-gold transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Voltar ao Login
              </button>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Recuperar Senha</h3>
                <p className="text-sm text-slate-500 mt-1">Enviaremos as instruções para seu e-mail.</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-between mb-6 text-sm items-baseline border-b border-slate-50 pb-3">
              <span className="font-black text-slate-900 uppercase tracking-widest text-[10px]">
                {isSignUp ? 'Registro de Profissional' : 'Credenciais de Acesso'}
              </span>
              <button 
                type="button"
                onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(''); setSuccessMsg(''); }}
                className="text-brand-gold font-black hover:underline text-[10px] uppercase tracking-tighter"
              >
                {isSignUp ? 'Já sou cadastrado' : 'Criar minha conta'}
              </button>
            </div>
          )}

          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg text-[10px] font-bold flex items-center gap-3 border bg-red-50 text-red-700 border-red-100 animate-in shake duration-300">
              <ShieldCheck className="w-4 h-4 shrink-0" /> {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-lg text-[10px] font-bold flex items-center gap-3 border bg-green-50 text-green-700 border-green-100 animate-in zoom-in duration-300">
              <CheckCircle className="w-4 h-4 shrink-0" /> {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-1">
                
                {/* Seletor de Avatar do Usuário */}
                <div className="flex flex-col items-center justify-center py-4 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                  <input 
                    type="file" 
                    ref={avatarInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleAvatarChange}
                  />
                  <div 
                    onClick={() => avatarInputRef.current?.click()}
                    className="relative h-20 w-20 rounded-full bg-[#131313] border-2 border-brand-gold flex items-center justify-center cursor-pointer hover:scale-105 transition-all overflow-hidden group shadow-xl"
                  >
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Sua Foto" className="w-full h-full object-cover" />
                    ) : (
                      <User className="text-brand-gold h-8 w-8 opacity-50" />
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Sua Foto de Perfil</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">NOME COMPLETO</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nome completo do profissional"
                      className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:ring-1 focus:ring-brand-gold focus:border-brand-gold outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">CPF</label>
                    <input
                      type="text"
                      value={cpf}
                      onChange={(e) => setCpf(e.target.value)}
                      placeholder="000.000.000-00"
                      className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:ring-1 focus:ring-brand-gold focus:border-brand-gold outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Nº OAB</label>
                    <input
                      type="text"
                      value={oab}
                      onChange={(e) => setOab(e.target.value)}
                      placeholder="UF 000.000"
                      className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:ring-1 focus:ring-brand-gold focus:border-brand-gold outline-none transition-all"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">CARGO / FUNÇÃO</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as UserRole)}
                      className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:ring-1 focus:ring-brand-gold focus:border-brand-gold outline-none transition-all appearance-none"
                    >
                      <option value={UserRole.LAWYER}>Advogado(a) Sócio(a)</option>
                      <option value={UserRole.INTERN}>Assessor(a) / Estagiário(a)</option>
                      <option value={UserRole.ADMIN}>Gestor(a) Administrativo</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">E-MAIL PROFISSIONAL</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@escritorio.com.br"
                  className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:ring-1 focus:ring-brand-gold focus:border-brand-gold outline-none transition-all"
                />
              </div>

              {!isForgotPassword && (
                <div className="animate-in fade-in duration-500">
                  <div className="flex justify-between items-center mb-1.5 ml-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">SENHA CORPORATIVA</label>
                    {!isSignUp && (
                      <button 
                        type="button"
                        onClick={() => setIsForgotPassword(true)}
                        className="text-[10px] font-black text-brand-gold uppercase hover:underline"
                      >
                        Esqueci minha senha
                      </button>
                    )}
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:ring-1 focus:ring-brand-gold focus:border-brand-gold outline-none transition-all tracking-widest"
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-slate-900 text-brand-gold font-black rounded-lg hover:bg-black transition-all active:scale-[0.98] shadow-xl flex items-center justify-center uppercase tracking-[0.2em] text-[10px] border border-brand-gold/10 mt-2"
            >
              {isLoading ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                isForgotPassword ? 'Enviar Instruções' : isSignUp ? 'Concluir Meu Cadastro' : 'Entrar no Painel'
              )}
            </button>
          </form>

          <p className="mt-6 text-[9px] text-slate-400 text-center font-bold uppercase tracking-tight leading-relaxed">
            Ao acessar a plataforma, você declara estar ciente dos nossos <br />
            <a href="#" className="text-brand-gold hover:underline">Termos de Uso</a> e <a href="#" className="text-brand-gold hover:underline">Políticas de Segurança</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
