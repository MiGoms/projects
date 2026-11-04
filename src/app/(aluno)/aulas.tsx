import { Placeholder } from '@/components/Screen';

// TODO Fase 1 — Tela 3 (Design/README + REGRAS §3–5):
// - faixa de dias: hoje + 6 (fuso America/Bahia) → classesForDay(YYYY-MM-DD)
// - card: horário, modalidade, nível · local, spotsLabel(), barra taken/capacity, professor
// - botão: CHECK-IN (isCheckinWindowOpen) | CHECK-IN FEITO (cancelar se canCancel) | Lotada
// - check-in otimista; em erro 409 mostrar "Lotada" e recarregar o dia
export default function Aulas() {
  return <Placeholder eyebrow="CALENDÁRIO" title="Aulas do dia" note="Calendário e check-in — a implementar." />;
}
