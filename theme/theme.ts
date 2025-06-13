import { DefaultTheme, DarkTheme } from '@react-navigation/native';
import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

export const palette = {
  // Primary green shades for grocery
  primary_green: '#34A853',
  secondary_green: '#81C784',
  tertiary_green: '#A5D6A7',

  // Primary blue shades for pharmacy
  primary_blue: '#4285F4',
  secondary_blue: '#90CAF9',
  tertiary_blue: '#B3E5FC',

  // Neutral shades
  neutral_white: '#FFFFFF',
  neutral_black: '#000000',
  neutral_grey_light: '#F5F5F5',
  neutral_grey_dark: '#1E1E1E',

  // Accent colors
  accent_yellow: '#FBBC05',
  accent_red: '#EA4335',
};

const typography = {
  fontFamily: 'Roboto',
  h1: {
    fontSize: 32,
    fontWeight: '700' as '700',
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontWeight: '700' as '700',
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: '700' as '700',
    lineHeight: 28,
  },
  body1: {
    fontSize: 16,
    lineHeight: 24,
  },
  body2: {
    fontSize: 14,
    lineHeight: 20,
  },
  button: {
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
};

const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 9999,
};

const shadows = {
  light: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
  },
  dark: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.5,
      shadowRadius: 16,
      elevation: 8,
    },
  },
};

export const lightTheme = {
  ...DefaultTheme,
  ...MD3LightTheme,
  colors: {
    ...DefaultTheme.colors,
    ...MD3LightTheme.colors,
    primary: palette.primary_green,
    secondary: palette.secondary_green,
    tertiary: palette.tertiary_green,
    background: palette.neutral_white,
    surface: palette.neutral_grey_light,
    text: palette.neutral_black,
    accent: palette.accent_yellow,
    error: palette.accent_red,
    // Grocery-specific colors
    grocery: {
      primary: palette.primary_green,
      secondary: palette.secondary_green,
      tertiary: palette.tertiary_green,
    },
    // Pharmacy-specific colors
    pharmacy: {
      primary: palette.primary_blue,
      secondary: palette.secondary_blue,
      tertiary: palette.tertiary_blue,
    },
  },
  typography,
  spacing,
  borderRadius,
  shadows: shadows.light,
};

export const darkTheme = {
  ...DarkTheme,
  ...MD3DarkTheme,
  colors: {
    ...DarkTheme.colors,
    ...MD3DarkTheme.colors,
    primary: palette.primary_green,
    secondary: palette.secondary_green,
    tertiary: palette.tertiary_green,
    background: palette.neutral_black,
    surface: palette.neutral_grey_dark,
    text: palette.neutral_white,
    accent: palette.accent_yellow,
    error: palette.accent_red,
    // Grocery-specific colors
    grocery: {
      primary: palette.primary_green,
      secondary: palette.secondary_green,
      tertiary: palette.tertiary_green,
    },
    // Pharmacy-specific colors
    pharmacy: {
      primary: palette.primary_blue,
      secondary: palette.secondary_blue,
      tertiary: palette.tertiary_blue,
    },
  },
  typography,
  spacing,
  borderRadius,
  shadows: shadows.dark,
};

export type Theme = typeof lightTheme;