// Tokens de design — fonte: Design/README.md ("Design Tokens").

export const colors = {
  bgTop: '#556b6d',
  bgMid: '#4a5f61',
  bgDeep: '#3d4f51',

  gold: '#c9a876',
  goldHover: '#e8c9a8',

  textPrimary: '#e8dcc8',
  textSecondary: '#d4c5b0',
  textMuted: '#b8a892',
  error: '#e8a48a',

  surface: 'rgba(255,255,255,0.06)',
  input: 'rgba(255,255,255,0.08)',
  track: 'rgba(255,255,255,0.1)',
  toggleBg: 'rgba(0,0,0,0.15)',

  border: 'rgba(201,168,118,0.22)',
  borderInput: 'rgba(201,168,118,0.3)',
  borderFocus: 'rgba(201,168,118,0.85)',
  borderDivider: 'rgba(201,168,118,0.18)',
  tabBar: 'rgba(61,79,81,0.96)',
} as const;

export const gradients = {
  screen: { colors: [colors.bgTop, colors.bgMid] as const, start: { x: 0, y: 0 }, end: { x: 0.6, y: 1 } },
  welcome: { colors: [colors.bgTop, colors.bgMid, colors.bgDeep] as const, locations: [0, 0.55, 1] as const },
};

export const fonts = {
  display: 'PlayfairDisplay_400Regular',
  displayItalic: 'PlayfairDisplay_400Regular_Italic',
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
} as const;

export const fontSize = {
  hero: 38, title: 28, card: 18,
  xl: 17, lg: 15, md: 14, base: 13, sm: 12, xs: 11, xxs: 10,
} as const;

export const radius = { sm: 10, md: 12, lg: 14, xl: 16, pill: 999 } as const;

export const space = {
  4: 4, 6: 6, 8: 8, 10: 10, 12: 12, 14: 14, 16: 16, 18: 18, 20: 20, 24: 24, 28: 28, 32: 32, 36: 36,
} as const;
