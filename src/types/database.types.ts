export interface Client {
    id: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    name: string;
    email: string | null;
    phone: string | null;
    cpf: string | null;
    address: string | null;
    notes: string | null;
    created_by: string | null;
}

export interface LegalCase {
    id: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    title: string;
    description: string | null;
    status: string | null;
    client_id: string | null;
    court: string | null;
    case_number: string | null;
    created_by: string | null;
}

export interface Counterpart {
    id: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    name: string;
    email: string | null;
    phone: string | null;
    role: string | null;
    related_case_id: string | null;
    created_by: string | null;
}

export interface Document {
    id: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    name: string;
    file_path: string;
    size: number | null;
    type: string | null;
    related_case_id: string | null;
    client_id: string | null;
    created_by: string | null;
}
