import { Placeholder } from '@/components/Screen';

// TODO Fase 1 — destino do link do e-mail.
// Web: o supabase-js lê os tokens da URL sozinho (detectSessionInUrl).
// Celular: ler access_token/refresh_token do fragmento da URL (Linking.useURL)
//          e chamar supabase.auth.setSession(...).
// Depois: nova senha (mín. 8) → updatePassword() → volta para "/".
export default function RedefinirSenha() {
  return <Placeholder eyebrow="RECUPERAR ACESSO" title="Nova senha" note="Definição de nova senha — a implementar." />;
}
