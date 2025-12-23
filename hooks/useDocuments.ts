
import { useState, useCallback } from 'react';
import { supabase, handleSupabaseError } from '../services/supabaseClient';
import { AppDocument } from '../types';

export const useDocuments = () => {
  const [documents, setDocuments] = useState<AppDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Busca documentos do banco de dados
  const fetchDocuments = useCallback(async (searchTerm = '') => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('documents')
        .select('*')
        .is('deleted_at', null) // Soft delete check based on schema
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,file_name.ilike.%${searchTerm}%`);
      }

      const { data, error: supabaseError } = await query;

      if (supabaseError) {
        if (supabaseError.code === '42P01') {
            console.warn('Tabela documents não encontrada.');
            setDocuments([]); 
            return;
        }
        throw supabaseError;
      }
      
      // Mapeia os dados do banco para o tipo do Frontend
      const mappedDocs = (data || []).map((doc: any) => {
        // Se a coluna URL não existir no banco (baseado no schema fornecido), tentamos construir ou usar metadados
        let docUrl = doc.url;
        if (!docUrl && doc.file_path) {
           const { data: publicData } = supabase.storage.from('documents').getPublicUrl(doc.file_path);
           docUrl = publicData.publicUrl;
        }

        // Fix: Mapping properties to satisfy AppDocument interface requirements
        return {
          id: doc.id,
          title: doc.title || doc.file_name || 'Sem Nome',
          file_path: doc.file_path || '',
          name: doc.title || doc.file_name || 'Sem Nome',
          size: doc.file_size,
          type: doc.file_type || doc.mime_type,
          url: docUrl || '',
          created_at: doc.created_at,
          case_id: doc.case_id,
          description: doc.description
        };
      });

      setDocuments(mappedDocs);
    } catch (err: any) {
      console.error(err);
      setError(handleSupabaseError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadDocuments = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      // Fix: Casting supabase.auth to any to bypass outdated TypeScript definitions
      const { data: { user } } = await (supabase.auth as any).getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const newDocs: AppDocument[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        
        // 1. Upload para o Supabase Storage
        // Cria um nome único para evitar colisão: timestamp_nome-do-arquivo
        const fileNameSanitized = file.name.replace(/\s+/g, '_');
        const filePath = `${user.id}/${Date.now()}_${fileNameSanitized}`;
        
        const { error: storageError } = await supabase.storage
          .from('documents') 
          .upload(filePath, file);

        if (storageError) throw storageError;

        // 2. Obter URL pública
        const { data: { publicUrl } } = supabase.storage
          .from('documents')
          .getPublicUrl(filePath);

        // 3. Salvar metadados na tabela 'documents' conforme Schema SQL fornecido
        const docMetadata = {
          title: file.name, // Campo obrigatório (NOT NULL)
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          file_type: fileExt,
          mime_type: file.type,
          created_by: user.id,
          // url: publicUrl, // Opcional: Se a tabela aceitar, enviamos. Se não, o fetch reconstrói pelo path.
          metadata: { url: publicUrl } // Guardamos no JSONB por segurança
        };

        const { data: dbData, error: dbError } = await supabase
          .from('documents')
          .insert([docMetadata])
          .select()
          .single();

        if (dbError) {
            console.error('Erro ao salvar metadados:', dbError);
            throw dbError;
        }

        if (dbData) {
            newDocs.push({
                id: dbData.id,
                title: dbData.title,
                file_path: dbData.file_path,
                name: dbData.title,
                size: dbData.file_size,
                type: dbData.file_type,
                url: publicUrl,
                created_at: dbData.created_at
            });
        }
      }

      // Atualiza lista local
      setDocuments(prev => [...newDocs, ...prev]);
      return { success: true };

    } catch (err: any) {
      const msg = handleSupabaseError(err);
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setUploading(false);
    }
  };

  const deleteDocument = async (id: string, url: string) => {
    try {
        // Soft Delete conforme schema (deleted_at)
        const { error: dbError } = await supabase
            .from('documents')
            .update({ 
                deleted_at: new Date().toISOString() 
            })
            .eq('id', id);
            
        if (dbError) throw dbError;

        setDocuments(prev => prev.filter(d => d.id !== id));
    } catch (err: any) {
        alert('Erro ao excluir: ' + err.message);
    }
  };

  return {
    documents,
    loading,
    uploading,
    error,
    fetchDocuments,
    uploadDocuments,
    deleteDocument
  };
};
