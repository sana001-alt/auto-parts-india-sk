import { MD3LightTheme as DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#F97316', // Vibrant Orange Accent
    primaryContainer: '#FFEDD5',
    secondary: '#0F172A', // Dark Navy
    secondaryContainer: '#1E293B',
    tertiary: '#38BDF8',
    background: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceVariant: '#F1F5F9',
    outline: '#CBD5E1',
    error: '#EF4444',
    success: '#10B981',
  },
};
