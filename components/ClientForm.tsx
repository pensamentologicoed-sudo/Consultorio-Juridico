
import React, { useState, useEffect } from 'react';
import { Save, X, UploadCloud, FileText, Check, Trash2, Loader2, Eye, MapPin, Briefcase, Calendar } from 'lucide-react';
import { ClientStatus, Client } from '../types';
import { handleSupabaseError, supabase } from '../services/supabaseClient';
import { useClients } from '../hooks/useClients';
import DeleteButton from './DeleteButton';

interface ClientFormProps {
  initialData?: any | null;
  onCancel: () => void;
  client?: any; // Objeto de cliente para edição
  onSave?: () => void;
  onDelete?: () => void;
}

type DocField = 'identification' | 'cpf' | 'birth_marriage' | 'comprovant_residente' | 'other';

export const ClientForm: React.FC<ClientFormProps> = ({
  initialData,
  onCancel,
  client,
  onSave,
  onDelete
}) => {
  const { createClient, updateClient } = useClients();
  const dataToUse = client || initialData;
  
  const [formData, setFormData] = useState<Partial<Client>>({
    name: '',
    email: '',
    phone: '',
    cpf_cnpj: '',
    rg: '',
    address: '',
    city: '',
    state: '',
    cep: '',
    profession: '',
    company: '',
    income_range: '',
    status: ClientStatus.ACTIVE,
    observations: ''
  });
  
  const [docs, setDocs] = useState({
    identification: { path: '', name: '' },
    cpf: { path: '', name: '' },
    birth_marriage: { path: '', name: '' },
    comprovant_residente: { path: '', name: '' },
    other: { path: '', name: '' }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  useEffect(() => {
    if (dataToUse) {
      setFormData({
        name: dataToUse.name || '',
        email: dataToUse.email || '',
        phone: dataToUse.phone || '',
        cpf_cnpj: dataToUse.cpf_cnpj || '',
        rg: dataToUse.rg || '',
        address: dataToUse.address || '',
        city: dataToUse.city || '',
        state: dataToUse.state || '',
        cep: dataToUse.cep || '',
        profession: dataToUse.profession || '',
        company: dataToUse.company || '',
        income_range: dataToUse.income_range || '',
        status: dataToUse.status || ClientStatus.ACTIVE,
        observations: dataToUse.observations || ''
      });

      setDocs({
        identification: { 
          path: dataToUse.identification_doc_path || '', 
          name: dataToUse.identification_doc_name || '' 
        },
        cpf: { 
          path: dataToUse.cpf_doc_path || '', 
          name: dataToUse.cpf_doc_name || '' 
        },
        birth_marriage: { 
          path: dataToUse.birth_marriage_doc_path || '', 
          name: dataToUse.birth_marriage_doc_name || '' 
        },
        comprovant_residente: { 
          path: dataToUse.comprovant_residente_doc_path || '', 
          name: dataToUse.comprovant_residente_doc_name || '' 
        },
        other: { 
          path: dataToUse.other_doc_path || '', 
          name: dataToUse.other_doc_name || '' 
        }
      });
    }
  }, [dataToUse]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const payload = {
        ...formData,
        identification_doc_path: docs.identification.path || null,
        identification_doc_name: docs.identification.name || null,
        cpf_doc_path: docs.cpf.path || null,
        cpf_doc_name: docs.cpf.name || null,
        birth_marriage_doc_path: docs.birth_marriage.path || null,
        birth_marriage_doc_name: docs.birth_marriage.name || null,
        comprovant_residente_doc_path: docs.comprovant_residente.path || null,
        comprovant_residente_doc_name: docs.comprovant_residente.name || null,
        other_doc_path: docs.other.path || null,
        other_doc_name: docs.other.name || null,
      };

      let result;
      if (dataToUse?.id) {
        result = await updateClient(dataToUse.id, payload);
      } else {
        result = await createClient(payload);
      }

      if (result.error) {
        alert(result.error);
      } else {
        if (onSave) onSave(); 
      }
    } catch (error) {
      alert(handleSupabaseError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: DocField) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setUploadingField(field);
    try {
      const fileNameSanitized = file.name.replace(/\s+/g, '_');
      const filePath = `client_docs/${field}/${Date.now()}_${fileNameSanitized}`;
      
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;
      
      setDocs(prev => ({ ...prev, [field]: { path: filePath, name: file.name } }));
    } catch (error: any) {
      console.error("Erro no upload:", error);
      alert(handleSupabaseError(error));
    } finally {
      setUploadingField(null);
    }
  };

  const getPublicUrl = (path: string) => {
    if (!path) return '';
    const { data } = supabase.storage.from('documents').getPublicUrl(path);
    return data.publicUrl;
  };

  const renderUploadField = (label: string, field: DocField) => {
    const currentDoc = docs[field];
    const isUploading = uploadingField === field;
    return (
      <div className="border rounded-lg p-3 bg-gray-50 border-gray-200">
        <label className="block text-[8px] font-black text-gray-400 uppercase mb-2 tracking-widest">{label}</label>
        {currentDoc.path ? (
           <div className="flex items-center justify-between bg-white p-2 rounded border border-gray-200">
              <div className="flex items-center truncate">
                 <FileText className="w-3.5 h-3.5 text-brand-gold mr-2 shrink-0" />
                 <span className="text-[9px] font-bold text-gray-600 truncate max-w-[100px]">{currentDoc.name}</span>
              </div>
              <div className="flex gap-1">
                 <a href={getPublicUrl(currentDoc.path)} target="_blank" rel="noopener noreferrer" className="p-1 text-gray-400 hover:text-blue-600 rounded">
                    <Eye className="w-3.5 h-3.5" />
                 </a>
                 <button type="button" onClick={() => setDocs(prev => ({...prev, [field]: {path: '', name: ''}}))} className="p-1 text-gray-400 hover:text-red-600 rounded">
                    <Trash2 className="w-3.5 h-3.5" />
                 </button>
              </div>
           </div>
        ) : (
           <div className="relative">
              <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={(e) => handleFileUpload(e, field)} disabled={isUploading} accept="image/*,.pdf" />
              <div className={`flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-1.5 bg-white ${isUploading ? 'opacity-50' : ''}`}>
                 {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-gold" /> : <UploadCloud className="w-3.5 h-3.5 text-gray-300 mr-2" />}
                 <span className="text-[8px] font-black text-gray-400 uppercase">Anexar</span>
              </div>
           </div>
        )}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Nome Completo *</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-brand-gold/20 outline-none" />
            </div>
            <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Email</label>
                <input type="email" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:bg-white outline-none" />
            </div>
            <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Telefone *</label>
                <input type="text" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:bg-white outline-none" />
            </div>
            <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">CPF/CNPJ</label>
                <input type="text" value={formData.cpf_cnpj || ''} onChange={e => setFormData({...formData, cpf_cnpj: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:bg-white outline-none" />
            </div>
            <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">RG</label>
                <input type="text" value={formData.rg || ''} onChange={e => setFormData({...formData, rg: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:bg-white outline-none" />
            </div>
        </div>

        <div className="pt-4 border-t border-gray-100">
            <h4 className="text-[10px] font-black text-gray-900 mb-4 flex items-center uppercase tracking-widest"><MapPin className="w-3.5 h-3.5 mr-2 text-brand-gold" /> Endereço Residencial</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="md:col-span-3">
                    <input type="text" placeholder="Logradouro" value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold" />
                </div>
                <div>
                    <input type="text" placeholder="CEP" value={formData.cep || ''} onChange={e => setFormData({...formData, cep: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold" />
                </div>
                <div className="md:col-span-2">
                    <input type="text" placeholder="Cidade" value={formData.city || ''} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold" />
                </div>
                <div className="md:col-span-2">
                    <input type="text" placeholder="Estado" value={formData.state || ''} onChange={e => setFormData({...formData, state: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold" />
                </div>
            </div>
        </div>

        <div className="pt-4 border-t border-gray-100">
            <h4 className="text-[10px] font-black text-gray-900 mb-4 flex items-center uppercase tracking-widest"><Briefcase className="w-3.5 h-3.5 mr-2 text-brand-gold" /> Profissional</h4>
            <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="Profissão" value={formData.profession || ''} onChange={e => setFormData({...formData, profession: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold" />
                <input type="text" placeholder="Empresa" value={formData.company || ''} onChange={e => setFormData({...formData, company: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold" />
            </div>
        </div>

        <div className="pt-4 border-t border-gray-100">
           <h4 className="text-[10px] font-black text-gray-900 mb-4 flex items-center uppercase tracking-widest"><Calendar className="w-3.5 h-3.5 mr-2 text-brand-gold" /> Documentação Anexa</h4>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {renderUploadField('Identidade', 'identification')}
              {renderUploadField('CPF / Docs', 'cpf')}
              {renderUploadField('Estado Civil', 'birth_marriage')}
              {renderUploadField('Comprov. Resid.', 'comprovant_residente')}
              {renderUploadField('Outros Arquivos', 'other')}
           </div>
        </div>

        <div className="flex justify-between items-center pt-6 border-t border-gray-100">
            <div>
                {dataToUse?.id && onDelete && (
                    <DeleteButton tableName="clients" recordId={dataToUse.id} recordName={dataToUse.name} onDelete={(success) => success && onDelete()} variant="destructive" size="sm" />
                )}
            </div>
            <div className="flex gap-3">
                <button type="button" onClick={onCancel} className="px-6 py-3 border border-gray-300 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:bg-gray-50" disabled={isSubmitting}>Cancelar</button>
                <button type="submit" className="px-8 py-3 bg-[#131313] text-brand-gold rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl flex items-center" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> : <Save className="h-3.5 h-3.5 mr-2" />}
                    {dataToUse?.id ? 'Atualizar Registro' : 'Salvar Registro'}
                </button>
            </div>
        </div>
    </form>
  );
};
