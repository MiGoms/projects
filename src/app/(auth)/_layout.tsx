import { Redirect, Stack } from 'expo-router';

import { useAuth } from '@/auth/AuthProvider';

/** Telas públicas. Quem já está logado volta para o início. */
export default function AuthLayout() {
  const { session, recoveringPassword } = useAuth();
  if (session && !recoveringPassword) return <Redirect href="/" />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
