
import React, { useState, useRef, useEffect } from 'react';
import { 
  User as UserIcon, 
  Briefcase, 
  Camera, 
  Upload, 
  Save, 
  Loader2, 
  ShieldCheck, 
  CheckCircle2,
  Phone,
  CreditCard,
  Hash,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../services/supabaseClient';

const Settings: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    cpf: '',
    oab: '',
    phone: '',
  });

  const loadUserData = () => {
    if (user?.user_metadata) {
      const meta = user.user_metadata;
      setFormData({
        name: meta.full_name || meta.name || '',
        cpf: meta.cpf || '',
        oab: meta.oab || '',
        phone: meta.phone || '',
      });
    }
  };

  useEffect(() => {
    loadUserData();
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdateInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await updateProfile({
      full_name: formData.name,
      name: formData.name,
      cpf: formData.cpf,
      oab: formData.oab,
      phone: formData.phone
    });
    setLoading(false);
    if (result.success) {
      setSuccessMsg('Perfil atualizado!');
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'logo') => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    type === 'avatar' ? setUploadingAvatar(true) : setUploadingLogo(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${type}_${user.id}_${Date.now()}.${fileExt}`;
      const filePath = `${type}s/${fileName}`;
      const { error: uploadError } = await supabase.storage.from('documents').upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(filePath);
      await updateProfile(type === 'avatar' ? { avatarUrl: publicUrl } : { logoUrl: publicUrl });
      if (type === 'logo') localStorage.setItem('legalflow_office_logo', publicUrl);
      setSuccessMsg('Imagem atualizada!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } finally {
      type === 'avatar' ? setUploadingAvatar(false) : setUploadingLogo(false);
      if (e.target) e.target.value = '';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto py-4">
      <div className="flex justify-between items-center border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-xl font-black text-gray-900 tracking-tight uppercase">Configurações</h1>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Identidade do Perfil e Escritório</p>
        </div>
        {successMsg && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg border border-green-100 animate-in zoom-in">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="text-[9px] font-black uppercase tracking-widest">{successMsg}</span>
          </div>
        )}
      </div>

      {/* Fileira Superior: Imagens Reduzidas (50%) */}
      <div className="grid grid-cols-2 gap-6">
        {/* Avatar Compacto */}
        <div className="bg-white p-4 rounded-[1.5rem] border border-gray-100 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="relative">
                    <div className="h-16 w-16 rounded-full bg-[#131313] border-2 border-brand-gold/20 flex items-center justify-center overflow-hidden">
                        {uploadingAvatar ? (
                        <Loader2 className="w-4 h-4 animate-spin text-brand-gold" />
                        ) : user?.user_metadata?.avatarUrl ? (
                        <img src={user.user_metadata.avatarUrl} className="h-full w-full object-cover" alt="Avatar" />
                        ) : (
                        <UserIcon className="w-6 h-6 text-brand-gold opacity-50" />
                        )}
                    </div>
                    <button onClick={() => avatarInputRef.current?.click()} className="absolute -bottom-1 -right-1 p-1.5 bg-brand-gold text-[#131313] rounded-lg shadow-lg border-2 border-white">
                        <Camera className="w-3 h-3" />
                    </button>
                </div>
                <div>
                    <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Sua Foto</h3>
                    <p className="text-[8px] text-gray-400 font-bold uppercase tracking-tighter">Avatar Profissional</p>
                </div>
            </div>
            <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'avatar')} />
        </div>

        {/* Logo Compacta */}
        <div className="bg-[#131313] p-4 rounded-[1.5rem] border border-brand-gold/10 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="relative">
                    <div className="h-16 w-16 rounded-xl bg-white/5 border border-dashed border-brand-gold/20 flex items-center justify-center overflow-hidden">
                        {uploadingLogo ? (
                        <Loader2 className="w-4 h-4 animate-spin text-brand-gold" />
                        ) : user?.user_metadata?.logoUrl ? (
                        <img src={user.user_metadata.logoUrl} className="h-full w-full object-contain p-2" alt="Office Logo" />
                        ) : (
                        <Briefcase className="w-6 h-6 text-brand-gold opacity-30" />
                        )}
                    </div>
                    <button onClick={() => logoInputRef.current?.click()} className="absolute -bottom-1 -right-1 p-1.5 bg-white text-[#131313] rounded-lg shadow-lg">
                        <Upload className="w-3 h-3" />
                    </button>
                </div>
                <div>
                    <h3 className="text-[10px] font-black text-brand-gold uppercase tracking-widest">Escritório</h3>
                    <p className="text-[8px] text-brand-gold/40 font-bold uppercase tracking-tighter">Logotipo Institucional</p>
                </div>
            </div>
            <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'logo')} />
        </div>
      </div>

      {/* Formulário na Parte Inferior */}
      <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
            <ShieldCheck className="w-5 h-5 text-brand-gold" />
            <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider">Dados Profissionais</h3>
        </div>

        <form onSubmit={handleUpdateInfo} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block ml-1">Nome Completo</label>
              <input 
                type="text" name="name" required value={formData.name} onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold focus:bg-white focus:border-brand-gold outline-none transition-all" 
              />
            </div>
            <div>
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block ml-1">CPF</label>
              <input 
                type="text" name="cpf" value={formData.cpf} onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold focus:bg-white outline-none" 
              />
            </div>
            <div>
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block ml-1">OAB / Registro</label>
              <input 
                type="text" name="oab" value={formData.oab} onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold focus:bg-white outline-none" 
              />
            </div>
            <div className="col-span-2">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block ml-1">Telefone Profissional</label>
              <input 
                type="text" name="phone" value={formData.phone} onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold focus:bg-white outline-none" 
              />
            </div>
          </div>

          <button 
            type="submit" disabled={loading}
            className="w-full mt-4 flex items-center justify-center py-4 bg-[#131313] text-brand-gold rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-black transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
              <><Save className="w-4 h-4 mr-3" /> Salvar Perfil</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Settings;
