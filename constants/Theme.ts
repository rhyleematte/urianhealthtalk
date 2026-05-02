export const Colors = {
  primary: '#23656b',
  onPrimary: '#ffffff',
  primaryContainer: '#c7e8f2',
  onPrimaryContainer: '#23656b',
  background: '#f8fbff',
  surface: '#ffffff',
  text: '#1a1c1e',
  textMuted: '#5e6266',
  border: '#e1e3e6',
  error: '#ba1a1a',
  success: '#2e7d32',
};

export const Typography = {
  h1: {
    fontSize: 28,
    fontWeight: '800' as const,
    fontFamily: 'Manrope-Bold',
    lineHeight: 36,
  },
  h2: {
    fontSize: 22,
    fontWeight: '700' as const,
    fontFamily: 'Manrope-SemiBold',
    lineHeight: 28,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    fontFamily: 'PublicSans-SemiBold',
    lineHeight: 24,
  },
  body: {
    fontSize: 14,
    fontFamily: 'PublicSans-Regular',
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontFamily: 'PublicSans-Regular',
    lineHeight: 16,
  },
};
