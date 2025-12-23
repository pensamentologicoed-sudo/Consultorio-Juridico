
export enum UserRole {
  ADMIN = 'admin',
  LAWYER = 'lawyer',
  INTERN = 'assistant',
  CLIENT = 'client'
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  logoUrl?: string;
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
  rg?: string | null;
  birth_date?: string | null;
  marital_status?: string | null;
  address?: string | null;
  number?: string | null;
  complement?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
  cep?: string | null;
  profession?: string | null;
  company?: string | null;
  income_range?: string | null;
  observations?: string | null;
  status: ClientStatus;
  
  identification_doc_path?: string | null;
  identification_doc_name?: string | null;
  
  cpf_doc_path?: string | null;
  cpf_doc_name?: string | null;
  
  birth_marriage_doc_path?: string | null;
  birth_marriage_doc_name?: string | null;

  comprovant_residente_doc_path?: string | null; 
  comprovant_residente_doc_name?: string | null; 

  other_doc_path?: string | null;
  other_doc_name?: string | null;

  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
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
  court?: string | null;
  judge?: string | null;
  jurisdiction?: string | null;
  court_room?: string | null;
  created_at: string;
  updated_at: string;
  assigned_to?: string;
  next_hearing?: string;
  deleted_at?: string | null;
  value?: number; 
  fee?: number;   
  outcome?: CaseOutcome | null; 
  clients?: { name: string; email?: string; phone?: string }; 
}

export enum HistoryType {
  PETITION = 'petition',
  HEARING = 'hearing',
  SENTENCE = 'sentence',
  APPEAL = 'appeal',
  NOTE = 'note',
  DOCUMENT = 'document',
  STATUS_CHANGE = 'status',
  DISPATCH = 'dispatch',
  SETTLEMENT = 'settlement',
  SYSTEM = 'system',
  ARCHIVE = 'archive'
}

export interface CaseHistoryItem {
  id: string;
  case_id: string;
  title: string;
  description?: string;
  type: HistoryType;
  date: string; 
  created_at: string;
  created_by?: string;
  is_system_event?: boolean;
}

export enum CounterpartType {
  INDIVIDUAL = 'individual',
  COMPANY = 'company',
  GOVERNMENT = 'government'
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
  deleted_at?: string | null;
}

export interface AppDocument {
  id: string;
  title: string;
  file_name?: string;
  file_path: string;
  file_size?: number;
  file_type?: string;
  mime_type?: string;
  url: string;
  created_at: string;
  case_id?: string;
  client_id?: string;
  name: string;
  size?: number;
  type?: string;
  case_title?: string;
  description?: string;
}
