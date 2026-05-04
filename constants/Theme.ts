import { Platform } from 'react-native';

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
  h3: {
    fontSize: 18,
    fontWeight: '700' as const,
    fontFamily: 'Manrope-SemiBold',
    lineHeight: 24,
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

export const Shadows = {
  small: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 5,
    },
    android: {
      elevation: 2,
    },
    web: {
      boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.05)',
    },
  }),
  medium: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
    },
    android: {
      elevation: 4,
    },
    web: {
      boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
    },
  }),
  large: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.15,
      shadowRadius: 20,
    },
    android: {
      elevation: 8,
    },
    web: {
      boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.15)',
    },
  }),
};
