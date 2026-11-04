import { Redirect, Tabs } from 'expo-router';

import { useAuth } from '@/auth/AuthProvider';
import { colors, fonts } from '@/theme/tokens';

/** Área do aluno: exige login. Tab bar Aulas | Perfil (Design/README "Tab bar"). */
export default function AlunoLayout() {
  const { session } = useAuth();
  if (!session) return <Redirect href="/login" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: 'rgba(201,168,118,0.2)',
          height: 84,
          paddingBottom: 14,
        },
        tabBarLabelStyle: { fontFamily: fonts.semibold, fontSize: 10, letterSpacing: 0.6, textTransform: 'uppercase' },
      }}
    >
      {/* TODO: ícones calendar / user (ex.: lucide-react-native) */}
      <Tabs.Screen name="aulas" options={{ title: 'Aulas' }} />
      <Tabs.Screen name="perfil" options={{ title: 'Perfil' }} />
    </Tabs>
  );
}
