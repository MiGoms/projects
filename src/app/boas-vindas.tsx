import { Redirect } from 'expo-router';

import { useAuth } from '@/auth/AuthProvider';
import { Placeholder } from '@/components/Screen';
import { manifesto } from '@/content/manifesto';

// TODO Fase 1 — Tela 2 (Design/README): logo, título "Itacaré *Training* Center",
// manifesto, botão "MERGULHAR" → /aulas. Aparece sempre que o app abre (REGRAS §6).
export default function BoasVindas() {
  const { session } = useAuth();
  if (!session) return <Redirect href="/login" />;
  return <Placeholder eyebrow={manifesto.eyebrow} title="Itacaré Training Center" note={manifesto.texto} />;
}
