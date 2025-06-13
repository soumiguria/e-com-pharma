import { useTheme } from '../contexts/ThemeContext';
import { StyleSheet } from 'react-native';
import { AppTheme } from '../theme';

export const useAppTheme = () => {
  const { theme, themeMode, setThemeMode } = useTheme();

  const createStyles = (styleCallback: (theme: AppTheme) => any) => {
    return StyleSheet.create(styleCallback(theme));
  };

  return {
    theme,
    themeMode,
    setThemeMode,
    createStyles,
    colors: theme.paperTheme.colors,
    typography: theme.paperTheme.typography,
    spacing: theme.paperTheme.spacing,
    borderRadius: theme.paperTheme.borderRadius,
    shadows: theme.paperTheme.shadows,
    isDark: themeMode === 'dark',
  };
}; 