import { Redirect, Stack } from 'expo-router';

import { useAuth } from '@/auth/AuthProvider';

/**
 * Painel do administrador (publicado na web via Vercel).
 * Este guard só esconde a interface. A proteção real é a RLS do banco:
 * só profiles.role = 'admin' consegue criar aulas e ver os check-ins dos outros.
 */
export default function AdminLayout() {
  const { session, isAdmin } = useAuth();
  if (!session) return <Redirect href="/login" />;
  if (!isAdmin) return <Redirect href="/" />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
