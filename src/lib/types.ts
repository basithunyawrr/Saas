export type AppRole = 'super_admin' | 'admin' | 'teacher' | 'student' | 'parent';
export type AccountStatus = 'active' | 'inactive';

export interface Profile { id: string; full_name: string; email: string | null; phone: string | null; role: AppRole; school_id: string | null; status: AccountStatus; created_at: string; updated_at: string; }
export interface School { id: string; name: string; slug: string; email: string | null; phone: string | null; address: string | null; city: string | null; country: string | null; website: string | null; logo_url: string | null; status: 'active'|'inactive'|'suspended'; created_at: string; updated_at: string; }
