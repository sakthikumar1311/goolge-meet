import { Platform } from 'react-native';

export const Colors = {
  primary: '#8AB4F8', // Google Blue (Dark Theme)
  secondary: '#5F6368', // Gray
  background: '#202124', // Dark Background
  surface: '#3C4043', // Surface Gray
  error: '#F28B82', // Light Red (Dark Theme)
  success: '#81C995', // Light Green (Dark Theme)
  warning: '#FDD663', // Light Yellow (Dark Theme)
  text: '#E8EAED', // Light Text
  textSecondary: '#BDC1C6', // Muted Text
  border: '#5F6368',
  white: '#FFFFFF',
  black: '#000000',
  accent: '#D2E3FC', // Very Light Blue
  divider: '#3C4043',
  iconActive: '#FFFFFF',
  iconInactive: '#BDC1C6',
  overlay: 'rgba(0, 0, 0, 0.6)',
  whiteboardBg: '#FFFFFF',
  googleBlue: '#1A73E8', // Brand Blue (used in buttons often)
};

export const Spacing = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const Typography = {
  h1: {
    fontSize: 24,
    fontWeight: '400',
    color: Colors.text,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  h2: {
    fontSize: 18,
    fontWeight: '500',
    color: Colors.text,
  },
  h3: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
  },
  body: {
    fontSize: 14,
    color: Colors.text,
  },
  bodySmall: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  caption: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  button: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.white,
  },
};
