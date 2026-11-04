// Tipos do domínio. Quando houver projeto Supabase, gere os tipos completos
// com `npm run db:types` (src/lib/database.types.ts) e derive daqui.

export type UserRole = 'aluno' | 'admin';
export type CheckinStatus = 'confirmed' | 'cancelled';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  whatsapp: string;
  photo_url: string | null;
  role: UserRole;
}

/** Linha retornada por public.classes_for_day(date). */
export interface DayClass {
  id: string;
  modality: string;
  coach_name: string;
  coach_photo: string | null;
  level: string;
  location: string;
  starts_at: string;
  ends_at: string;
  capacity: number;
  taken: number;
  checked_in: boolean;
}

export interface Modality {
  id: number;
  name: string;
}

export interface Coach {
  id: string;
  name: string;
  photo_url: string | null;
}

export interface ClassRow {
  id: string;
  modality_id: number;
  coach_id: string;
  level: string;
  location: string;
  starts_at: string;
  ends_at: string;
  capacity: number;
}
