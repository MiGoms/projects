// Validações do cadastro (REGRAS.md §1). O banco repete a do WhatsApp (check constraint).

export const WHATSAPP_REGEX = /^\(\d{2}\) 9 \d{4}-\d{4}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MIN_PASSWORD = 8;

export function validateName(v: string): string | null {
  return v.trim() ? null : 'Informe seu nome completo.';
}

export function validateEmail(v: string): string | null {
  return EMAIL_REGEX.test(v.trim()) ? null : 'E-mail inválido.';
}

export function validatePassword(v: string): string | null {
  return v.length >= MIN_PASSWORD ? null : `A senha precisa ter no mínimo ${MIN_PASSWORD} caracteres.`;
}

export function validateWhatsapp(v: string): string | null {
  return WHATSAPP_REGEX.test(v) ? null : 'Use o formato (DD) 9 XXXX-XXXX.';
}

/** Máscara progressiva: "73912345678" -> "(73) 9 1234-5678". */
export function maskWhatsapp(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 11);
  if (d.length === 0) return '';
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 3) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2, 3)} ${d.slice(3)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 3)} ${d.slice(3, 7)}-${d.slice(7)}`;
}
