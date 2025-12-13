import React, { useState } from 'react';
import { Briefcase } from 'lucide-react';
import { UserRole } from '../types';
import { useAuth } from '../hooks/useAuth';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  // New State Fields
  const [cpf, setCpf] = useState('');
  const [oab, setOab] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.LAWYER);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [phone, setPhone] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    try {
      if (isSignUp) {
        // Sign Up with Meta Data via useAuth
        const { data, error } = await signUp(cleanEmail, cleanPassword, {
          name,
          role,
          cpf,
          oab,
          phone,
          avatarUrl
        });

        if (error) throw new Error(error);

        if (data?.user && !data?.session) {
          setErrorMsg('Conta criada! Por favor verifique seu email para confirmar o cadastro antes de entrar.');
          setTimeout(() => setIsSignUp(false), 3000);
        } else if (data?.session) {
          onLogin();
        }
      } else {
        // Sign In via useAuth
        const { error } = await signIn(cleanEmail, cleanPassword);

        if (error) throw new Error(error);
        // onAuthStateChange in App.tsx will handle the transition
      }
    } catch (err: any) {
      console.error(err);
      if (err.message && err.message.includes('Invalid login credentials')) {
        setErrorMsg('Email ou senha inválidos.');
      } else {
        setErrorMsg(err.message || 'Ocorreu um erro inesperado.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">

      <div className={`w-full ${isSignUp ? 'max-w-2xl' : 'max-w-md'} bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-500`}>

        {/* Top Header Section - Blue Background */}
        <div className="bg-blue-600 px-8 pt-10 pb-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-white p-4 rounded-full shadow-md">
              <Briefcase className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight mb-1">
            Consultoria Jurídica
          </h2>
          <h3 className="text-blue-100 text-sm"> Dr. Samuel Santos </h3>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          <button
            type="button"
            onClick={() => { setIsSignUp(false); setErrorMsg(''); }}
            className={`w-1/2 py-4 text-sm font-semibold transition-colors relative ${!isSignUp ? 'text-blue-600 bg-blue-50/50' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Login
            {!isSignUp && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600" />
            )}
          </button>
          <button
            type="button"
            onClick={() => { setIsSignUp(true); setErrorMsg(''); }}
            className={`w-1/2 py-4 text-sm font-semibold transition-colors relative ${isSignUp ? 'text-blue-600 bg-blue-50/50' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Criar Conta
            {isSignUp && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600" />
            )}
          </button>
        </div>

        {/* Form Section */}
        <div className="px-8 py-8">
          {errorMsg && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${errorMsg.includes('Conta criada') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {errorMsg}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>

            {isSignUp && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-4">

                {/* Name and Role Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block"> Nome Completo </label>
                    <input
                      type="text"
                      required={isSignUp}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 text-sm"
                      placeholder="Dr. John Doe"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block">Profissão</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as UserRole)}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 text-sm"
                    >
                      <option value={UserRole.LAWYER}>Advogado</option>
                      <option value={UserRole.INTERN}>Assessor</option>
                      <option value={UserRole.ADMIN}>ADM</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>
                </div>

                {/* CPF and OAB Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block">CPF</label>
                    <input
                      type="text"
                      value={cpf}
                      onChange={(e) => setCpf(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 text-sm"
                      placeholder="000.000.000-00"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block">OAB Number</label>
                    <input
                      type="text"
                      value={oab}
                      onChange={(e) => setOab(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 text-sm"
                      placeholder="UF 123456"
                    />
                  </div>
                </div>

                {/* Phone and Avatar Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block">Telefone</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 text-sm"
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block"> Foto URL (Optional)</label>
                    <input
                      type="url"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 text-sm"
                      placeholder="https://example.com/photo.jpg"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Email - Common */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 transition-all placeholder-gray-400 text-sm"
                placeholder="you@company.com"
              />
            </div>

            {/* Password - Common */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block">Senha</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 transition-all placeholder-gray-400 text-sm"
                placeholder="••••••••"
              />
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 transition-all transform hover:-translate-y-0.5"
              >
                {isLoading
                  ? (isSignUp ? 'Criando Conta...' : 'Entrando...')
                  : (isSignUp ? 'Criar Conta' : 'Entrar')
                }
              </button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs text-gray-400">
              Ao continuar, você concorda com nossos Termos de Serviço.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;