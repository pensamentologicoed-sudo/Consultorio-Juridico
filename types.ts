export enum UserRole {
  ADMIN = 'ADMIN',
  LAWYER = 'LAWYER',
  INTERN = 'INTERN',
  CLIENT = 'CLIENT'
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  oab?: string; 
  cpf?: string; 
  phone?: string; 
}

export enum ClientStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PROSPECT = 'prospect'
}

export interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  cpf_cnpj: string | null;
  address: string | null;
  status: ClientStatus;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null; // Soft Delete
  created_by?: string | null;
}

export enum CaseStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  CLOSED = 'closed',
  ARCHIVED = 'archived'
}

export enum CasePriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum CaseOutcome {
  WON = 'won',
  LOST = 'lost',
  SETTLED = 'settled'
}

export interface LegalCase {
  id: string;
  client_id: string;
  case_number: string;
  title: string;
  description?: string;
  status: CaseStatus;
  case_type: string;
  priority: CasePriority;
  created_at: string;
  assigned_to?: string;
  next_hearing?: string;
  deleted_at?: string | null; // Soft Delete
  
  // Financeiro e Resultados
  value?: number; // Valor da Causa
  fee?: number;   // Honorários
  outcome?: CaseOutcome | null; // Desfecho
  
  // Join fields (opcionais para UI)
  clients?: { name: string; email?: string; phone?: string }; 
}

// Histórico / Andamentos do Processo
export enum HistoryType {
  PETITION = 'petition',   // Petição
  HEARING = 'hearing',     // Audiência
  SENTENCE = 'sentence',   // Sentença
  APPEAL = 'appeal',       // Recurso
  NOTE = 'note',           // Nota/Observação Interna
  DOCUMENT = 'document',   // Documento Juntado
  STATUS_CHANGE = 'status' // Mudança de Status
}

export interface CaseHistoryItem {
  id: string;
  case_id: string;
  title: string;
  description?: string;
  type: HistoryType;
  date: string; // Data do evento
  created_at: string;
  created_by?: string;
}

// Novos tipos para Contrapartes
export enum CounterpartType {
  INDIVIDUAL = 'PF', // Pessoa Física
  COMPANY = 'PJ', // Pessoa Jurídica
  GOVERNMENT = 'GOV' // Órgão Público
}

export interface Counterpart {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  cpf_cnpj: string | null;
  type: CounterpartType;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null; // Soft Delete
}

// Tipo para Documentos
export interface AppDocument {
  id: string;
  name: string;
  size?: number; // Tornado opcional para compatibilidade
  type?: string; // Tornado opcional para compatibilidade
  url: string;
  created_at: string;
  case_id?: string; // Opcional: Link com processo
  case_title?: string; // Para exibição
}