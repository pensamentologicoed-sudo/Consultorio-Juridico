-- ==========================================
-- SUPABASE SETUP SCRIPT (V2)
-- ==========================================
-- Este script cria a estrutura necessária para o aplicativo Consultoria Jurídica.
-- Copie e cole este conteúdo no SQL Editor do Supabase dashboard.

-- Habilita extensão para UUIDs se não estiver habilitada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. TABELAS PRINCIPAIS
-- ==========================================

-- Tabela de CLIENTES
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    cpf TEXT,
    address TEXT,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id)
);

-- Tabela de PROCESSOS/CASOS (Legal Cases)
CREATE TABLE IF NOT EXISTS legal_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'open', -- open, closed, archived, etc.
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    court TEXT, -- Tribunal
    case_number TEXT, -- Número do processo
    created_by UUID REFERENCES auth.users(id)
);

-- Tabela de PARTES CONTRÁRIAS (Counterparts)
CREATE TABLE IF NOT EXISTS counterparts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    role TEXT, -- Ex: Réu, Autor, Testemunha
    related_case_id UUID REFERENCES legal_cases(id) ON DELETE SET NULL,
    created_by UUID REFERENCES auth.users(id)
);

-- Tabela de DOCUMENTOS
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    size INTEGER,
    type TEXT,
    related_case_id UUID REFERENCES legal_cases(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    created_by UUID REFERENCES auth.users(id)
);

-- ==========================================
-- 2. RECICLAGEM / LIXEIRA (SISTEMA HÍBRIDO)
-- ==========================================

-- VIEW para unificar todos os itens deletados
CREATE OR REPLACE VIEW recycle_bin_view AS
SELECT 
    id AS record_id,
    'clients' AS original_table,
    deleted_at,
    to_jsonb(clients.*) AS record,
    id AS id -- ID único para a view (reusando o ID do registro)
FROM clients WHERE deleted_at IS NOT NULL

UNION ALL

SELECT 
    id AS record_id,
    'legal_cases' AS original_table,
    deleted_at,
    to_jsonb(legal_cases.*) AS record,
    id AS id
FROM legal_cases WHERE deleted_at IS NOT NULL

UNION ALL

SELECT 
    id AS record_id,
    'counterparts' AS original_table,
    deleted_at,
    to_jsonb(counterparts.*) AS record,
    id AS id
FROM counterparts WHERE deleted_at IS NOT NULL

UNION ALL

SELECT 
    id AS record_id,
    'documents' AS original_table,
    deleted_at,
    to_jsonb(documents.*) AS record,
    id AS id
FROM documents WHERE deleted_at IS NOT NULL;


-- FUNÇÃO RPC: Mover para lixeira (Soft Delete)
CREATE OR REPLACE FUNCTION move_to_recycle_bin(
    p_table_name TEXT,
    p_record_id UUID,
    p_reason TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    IF p_table_name = 'clients' THEN
        UPDATE clients SET deleted_at = now() WHERE id = p_record_id;
        -- Cascata opcional: deletar processos do cliente? 
        -- Por enquanto vamos manter apenas a tabela principal, o código TS lida com cascata se precisar.
    ELSIF p_table_name = 'legal_cases' THEN
        UPDATE legal_cases SET deleted_at = now() WHERE id = p_record_id;
    ELSIF p_table_name = 'counterparts' THEN
        UPDATE counterparts SET deleted_at = now() WHERE id = p_record_id;
    ELSIF p_table_name = 'documents' THEN
        UPDATE documents SET deleted_at = now() WHERE id = p_record_id;
    ELSE
        RAISE EXCEPTION 'Tabela não suportada para lixeira: %', p_table_name;
    END IF;
END;
$$ LANGUAGE plpgsql;


-- FUNÇÃO RPC: Restaurar da lixeira
CREATE OR REPLACE FUNCTION restore_from_recycle_bin(
    p_recycle_bin_id UUID
)
RETURNS VOID AS $$
DECLARE
    v_table_name TEXT;
BEGIN
    -- Identificar de qual tabela veio esse ID. 
    -- Como usamos UUIDs, e assumimos que o ID da view é o ID do registro:
    
    -- Tenta achar em clients
    PERFORM 1 FROM clients WHERE id = p_recycle_bin_id AND deleted_at IS NOT NULL;
    IF FOUND THEN
        UPDATE clients SET deleted_at = NULL WHERE id = p_recycle_bin_id;
        RETURN;
    END IF;

    -- Tenta achar em legal_cases
    PERFORM 1 FROM legal_cases WHERE id = p_recycle_bin_id AND deleted_at IS NOT NULL;
    IF FOUND THEN
        UPDATE legal_cases SET deleted_at = NULL WHERE id = p_recycle_bin_id;
        RETURN;
    END IF;

    -- Tenta achar em counterparts
    PERFORM 1 FROM counterparts WHERE id = p_recycle_bin_id AND deleted_at IS NOT NULL;
    IF FOUND THEN
        UPDATE counterparts SET deleted_at = NULL WHERE id = p_recycle_bin_id;
        RETURN;
    END IF;

    -- Tenta achar em documents
    PERFORM 1 FROM documents WHERE id = p_recycle_bin_id AND deleted_at IS NOT NULL;
    IF FOUND THEN
        UPDATE documents SET deleted_at = NULL WHERE id = p_recycle_bin_id;
        RETURN;
    END IF;

    RAISE EXCEPTION 'Item não encontrado na lixeira com ID %', p_recycle_bin_id;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 3. POLÍTICAS DE SEGURANÇA (RLS) - Simples para desenvolvimento
-- ==========================================
-- ATENÇÃO: Em produção, refine essas políticas para checar "auth.uid() = created_by"

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE counterparts ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Política permissiva para permitir que usuários autenticados façam tudo (CRUD)
CREATE POLICY "Permitir tudo para usuários autenticados (Clients)" 
ON clients FOR ALL TO authenticated USING (true);

CREATE POLICY "Permitir tudo para usuários autenticados (Cases)" 
ON legal_cases FOR ALL TO authenticated USING (true);

CREATE POLICY "Permitir tudo para usuários autenticados (Counterparts)" 
ON counterparts FOR ALL TO authenticated USING (true);

CREATE POLICY "Permitir tudo para usuários autenticados (Documents)" 
ON documents FOR ALL TO authenticated USING (true);

-- Política para leitura pública (opcional, remova se quiser privado)
-- CREATE POLICY "Leitura pública" ON clients FOR SELECT USING (true);

-- ==========================================
-- 4. STORAGE (Buckets)
-- ==========================================
-- Insira isto apenas se o bucket "documents" ainda não existir.
-- O script SQL não cria buckets diretamente via comando padrão SQL no Supabase, 
-- mas geralmente insere na tabela storage.buckets.

INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- Política de Storage
CREATE POLICY "Acesso total a documentos para auth"
ON storage.objects FOR ALL TO authenticated
USING ( bucket_id = 'documents' )
WITH CHECK ( bucket_id = 'documents' );

CREATE POLICY "Ver documentos publicamente"
ON storage.objects FOR SELECT TO public
USING ( bucket_id = 'documents' );

