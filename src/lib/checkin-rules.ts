// Espelho no cliente das regras de horário (REGRAS.md §4 e §5).
// Serve só para habilitar/desabilitar botões. Quem decide é o banco
// (public.check_in / public.cancel_checkin); mantenha os números iguais.

const HOUR = 60 * 60 * 1000;
const MINUTE = 60 * 1000;

export const CHECKIN_OPENS_BEFORE_MS = 24 * HOUR;
export const CHECKIN_CLOSES_BEFORE_MS = 20 * MINUTE;

export function isCheckinWindowOpen(startsAt: Date, now = new Date()): boolean {
  const diff = startsAt.getTime() - now.getTime();
  return diff <= CHECKIN_OPENS_BEFORE_MS && diff >= CHECKIN_CLOSES_BEFORE_MS;
}

export function canCancel(startsAt: Date, now = new Date()): boolean {
  return now.getTime() < startsAt.getTime();
}

/** "5 vagas" | "1 vaga" | "Lotada" (REGRAS.md §3). */
export function spotsLabel(capacity: number, taken: number): string {
  const left = Math.max(capacity - taken, 0);
  if (left === 0) return 'Lotada';
  return left === 1 ? '1 vaga' : `${left} vagas`;
}
