
import React, { useState } from 'react';
import { Database, Copy, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';

export const SystemSetup: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const sqlScript = `-- SCRIPT DE INFRAESTRUTURA CORRIGIDO - LIXEIRA E AUDITORIA
-- Execute este script no SQL Editor do Supabase para ativar a Lixeira

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabela de Auditoria da Lixeira
CREATE TABLE IF NOT EXISTS recycle_bin (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    original_table TEXT NOT NULL,
    original_id UUID NOT NULL,
    item_name TEXT,
    data JSONB,
    reason TEXT,
    deleted_by UUID REFERENCES auth.users(id),
    deleted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Função para Mover para Lixeira (RPC) - CORRIGIDA para title/name
CREATE OR REPLACE FUNCTION move_to_recycle_bin(p_table_name TEXT, p_record_id UUID, p_reason TEXT DEFAULT NULL)
RETURNS VOID AS $$
DECLARE
    v_item_name TEXT;
    v_data JSONB;
BEGIN
    -- Captura o nome/título correto dependendo da tabela
    IF p_table_name = 'legal_cases' OR p_table_name = 'documents' THEN
        EXECUTE format('SELECT title FROM %I WHERE id = %L', p_table_name, p_record_id) INTO v_item_name;
    ELSE
        EXECUTE format('SELECT name FROM %I WHERE id = %L', p_table_name, p_record_id) INTO v_item_name;
    END IF;

    -- Captura os dados atuais do registro antes de marcar como deletado
    EXECUTE format('SELECT to_jsonb(t) FROM %I t WHERE id = %L', p_table_name, p_record_id) INTO v_data;
    
    -- Insere na lixeira
    INSERT INTO recycle_bin (original_table, original_id, item_name, data, reason, deleted_by)
    VALUES (p_table_name, p_record_id, v_item_name, v_data, p_reason, auth.uid());
    
    -- Marca como deletado na tabela original (Soft Delete)
    EXECUTE format('UPDATE %I SET deleted_at = NOW() WHERE id = %L', p_table_name, p_record_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Função para Restaurar da Lixeira (RPC)
CREATE OR REPLACE FUNCTION restore_from_recycle_bin(p_recycle_bin_id UUID)
RETURNS VOID AS $$
DECLARE
    v_table TEXT;
    v_id UUID;
BEGIN
    SELECT original_table, original_id INTO v_table, v_id FROM recycle_bin WHERE id = p_recycle_bin_id;
    
    -- Remove a marca de deletado na tabela original
    EXECUTE format('UPDATE %I SET deleted_at = NULL WHERE id = %L', v_table, v_id);
    
    -- Remove da lixeira
    DELETE FROM recycle_bin WHERE id = p_recycle_bin_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Garantir colunas deleted_at nas tabelas principais
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'deleted_at') THEN
        ALTER TABLE clients ADD COLUMN deleted_at TIMESTAMPTZ;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'legal_cases' AND column_name = 'deleted_at') THEN
        ALTER TABLE legal_cases ADD COLUMN deleted_at TIMESTAMPTZ;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'counterparts' AND column_name = 'deleted_at') THEN
        ALTER TABLE counterparts ADD COLUMN deleted_at TIMESTAMPTZ;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'deleted_at') THEN
        ALTER TABLE documents ADD COLUMN deleted_at TIMESTAMPTZ;
    END IF;
END $$;

ALTER TABLE recycle_bin ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see their own deleted items" ON recycle_bin FOR SELECT USING (true);
CREATE POLICY "Users can delete their own entries" ON recycle_bin FOR DELETE USING (true);

SELECT pg_notify('pgrst', 'reload schema');
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-yellow-200 overflow-hidden mt-6 animate-in fade-in">
      <div className="bg-yellow-50 p-6 border-b border-yellow-100 flex justify-between items-center">
        <div className="flex items-center gap-3">
           <div className="p-3 bg-yellow-100 rounded-full text-yellow-700">
             <Database className="w-5 h-5" />
           </div>
           <div>
             <h2 className="text-xl font-bold text-gray-900">Configuração do Banco de Dados</h2>
             <p className="text-sm text-gray-600">Execute o script SQL para ativar a Lixeira e Auditoria.</p>
           </div>
        </div>
        <button onClick={() => window.location.reload()} className="flex items-center gap-2 px-4 py-2 bg-white border border-yellow-300 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors text-xs font-bold">
            <RefreshCw className="w-3.5 h-3.5" /> Atualizar App
        </button>
      </div>
      <div className="p-6">
         <div className="relative group">
            <div className="absolute top-2 right-2 z-10">
                <button onClick={handleCopy} className="flex items-center gap-2 px-3 py-1.5 bg-[#131313] text-brand-gold text-[10px] font-black uppercase tracking-widest rounded hover:bg-black transition-colors shadow-sm">
                   {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                   {copied ? 'Copiado!' : 'Copiar Script SQL'}
                </button>
            </div>
            <pre className="bg-gray-900 text-gray-100 p-6 rounded-lg text-[10px] overflow-x-auto font-mono h-64 border border-gray-700 shadow-inner">
               {sqlScript}
            </pre>
         </div>
      </div>
    </div>
  );
};
