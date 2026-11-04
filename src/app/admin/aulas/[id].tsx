import { useLocalSearchParams } from 'expo-router';

import { Placeholder } from '@/components/Screen';

// TODO Fase 1 — REGRAS §7: quem confirmou check-in (adminClassAttendees) e vagas restantes.
export default function AulaDetalhe() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <Placeholder eyebrow="ADMINISTRAÇÃO" title="Presença" note={`Check-ins da aula ${id} — a implementar.`} />;
}
