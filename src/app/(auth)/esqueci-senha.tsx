import { Placeholder } from '@/components/Screen';

// TODO Fase 1 — campo de e-mail + requestPasswordReset(email, Linking.createURL('/redefinir-senha')).
// A URL de retorno precisa estar em Auth > URL Configuration do Supabase.
export default function EsqueciSenha() {
  return <Placeholder eyebrow="RECUPERAR ACESSO" title="Esqueci minha senha" note="Envio do link por e-mail — a implementar." />;
}
