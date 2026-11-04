// Acesso a dados. Toda regra de vaga/janela fica no Postgres; aqui só chamamos.
import { supabase } from './supabase';
import type { ClassRow, DayClass, Profile } from './types';

/** Mensagens para os erros levantados pelas funções SQL (ver migration). */
const SQL_ERRORS: Record<string, string> = {
  lotada: 'Lotada',
  checkin_duplicado: 'Você já fez check-in nesta aula.',
  checkin_ainda_nao_abriu: 'O check-in abre 24h antes da aula.',
  checkin_encerrado: 'O check-in fecha 20 minutos antes da aula.',
  cancelamento_encerrado: 'A aula já começou; não é possível cancelar.',
  checkin_nao_encontrado: 'Você não tem check-in nesta aula.',
  aula_nao_encontrada: 'Aula não encontrada.',
  nao_autenticado: 'Faça login novamente.',
};

export class ApiError extends Error {
  constructor(message: string, readonly code?: string) {
    super(message);
  }
}

function fail(error: { message: string; code?: string }): never {
  throw new ApiError(SQL_ERRORS[error.message] ?? error.message, error.code);
}

// ---------- Auth ----------
export async function signUp(input: { fullName: string; email: string; whatsapp: string; password: string }) {
  const { error } = await supabase.auth.signUp({
    email: input.email.trim(),
    password: input.password,
    options: { data: { full_name: input.fullName.trim(), whatsapp: input.whatsapp } },
  });
  if (error) fail(error);
}

export async function signIn(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  if (error) fail(error);
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) fail(error);
}

export async function requestPasswordReset(email: string, redirectTo: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });
  if (error) fail(error);
}

export async function updatePassword(password: string) {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) fail(error);
}

// ---------- Perfil ----------
export async function getProfile(userId: string): Promise<Profile> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (error) fail(error);
  return data as Profile;
}

export async function updateProfile(userId: string, patch: Partial<Pick<Profile, 'full_name' | 'whatsapp' | 'photo_url'>>) {
  const { error } = await supabase.from('profiles').update(patch).eq('id', userId);
  if (error) fail(error);
}

/** Troca de e-mail passa pelo Auth (envia confirmação); um trigger sincroniza profiles.email. */
export async function updateEmail(email: string) {
  const { error } = await supabase.auth.updateUser({ email: email.trim() });
  if (error) fail(error);
}

// ---------- Aulas e check-in ----------
/** @param date "YYYY-MM-DD" no fuso de Itacaré */
export async function classesForDay(date: string): Promise<DayClass[]> {
  const { data, error } = await supabase.rpc('classes_for_day', { p_date: date });
  if (error) fail(error);
  return (data ?? []) as DayClass[];
}

export async function checkIn(classId: string) {
  const { error } = await supabase.rpc('check_in', { p_class_id: classId });
  if (error) fail(error);
}

export async function cancelCheckIn(classId: string) {
  const { error } = await supabase.rpc('cancel_checkin', { p_class_id: classId });
  if (error) fail(error);
}

// ---------- Admin ----------
export async function adminCreateClass(input: Omit<ClassRow, 'id'>) {
  const { error } = await supabase.from('classes').insert(input);
  if (error) fail(error);
}

export async function adminClassAttendees(classId: string) {
  const { data, error } = await supabase
    .from('checkins')
    .select('id, created_at, profiles(full_name, whatsapp, email)')
    .eq('class_id', classId)
    .eq('status', 'confirmed')
    .order('created_at');
  if (error) fail(error);
  return data ?? [];
}
