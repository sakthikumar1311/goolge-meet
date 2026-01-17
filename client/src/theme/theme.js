export const Colors = {
  primary: '#1A73E8', // Google Blue
  secondary: '#5F6368', // Gray
  background: '#202124', // Dark Background
  surface: '#3C4043', // Surface Gray
  error: '#EA4335', // Red
  success: '#34A853', // Green
  warning: '#FBBC04', // Yellow
  text: '#E8EAED', // Light Text
  textSecondary: '#BDC1C6', // Muted Text
  border: '#5F6368',
  white: '#FFFFFF',
  black: '#000000',
  accent: '#8AB4F8', // Lighter Blue
  divider: '#5F6368',
  iconActive: '#FFFFFF',
  iconInactive: '#BDC1C6',
  overlay: 'rgba(0, 0, 0, 0.6)',
  whiteboardBg: '#FFFFFF',
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
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
  },
  h2: {
    fontSize: 22,
    fontWeight: '600',
    color: Colors.text,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  body: {
    fontSize: 16,
    color: Colors.text,
  },
  bodySmall: {
    fontSize: 14,
    color: Colors.text,
  },
  caption: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  button: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
};
