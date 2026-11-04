import { Redirect } from 'expo-router';

import { useAuth } from '@/auth/AuthProvider';

/**
 * Ponto de entrada (toda vez que o app abre):
 * - sem sessão → login
 * - admin      → painel
 * - aluno      → Boas-vindas, SEMPRE (REGRAS.md §6)
 */
export default function Index() {
  const { session, isAdmin, recoveringPassword } = useAuth();
  if (recoveringPassword) return <Redirect href="/redefinir-senha" />;
  if (!session) return <Redirect href="/login" />;
  if (isAdmin) return <Redirect href="/admin" />;
  return <Redirect href="/boas-vindas" />;
}
