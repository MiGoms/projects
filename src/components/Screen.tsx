import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { colors, fonts, fontSize, gradients } from '@/theme/tokens';

/** Fundo em gradiente usado em todas as telas (Design/README: 160deg #556b6d → #4a5f61). */
export function Screen({ children, variant = 'screen', style }: {
  children: ReactNode;
  variant?: 'screen' | 'welcome';
  style?: ViewStyle;
}) {
  const g = variant === 'welcome' ? gradients.welcome : gradients.screen;
  return (
    <LinearGradient {...g} style={styles.fill}>
      <View style={[styles.fill, style]}>{children}</View>
    </LinearGradient>
  );
}

/** Marcador temporário para telas ainda não implementadas. */
export function Placeholder({ eyebrow, title, note }: { eyebrow: string; title: string; note: string }) {
  return (
    <Screen style={styles.placeholder}>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.note}>{note}</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  placeholder: { paddingTop: 56, paddingHorizontal: 24, gap: 8 },
  eyebrow: { fontFamily: fonts.medium, fontSize: fontSize.xs, letterSpacing: 2, color: colors.gold },
  title: { fontFamily: fonts.display, fontSize: fontSize.title, color: colors.textPrimary },
  note: { fontFamily: fonts.regular, fontSize: fontSize.base, color: colors.textSecondary, marginTop: 12 },
});
