import React, { createContext, useState, useMemo, useContext, useEffect } from 'react';
import { lightTheme, darkTheme, Theme } from '../theme/theme';
import { useStorage } from './StorageContext';

type ThemeMode = 'light' | 'dark';
type AppSection = 'grocery' | 'pharma';

interface ThemeContextProps {
  theme: Theme;
  themeMode: ThemeMode;
  section: AppSection;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  setSection: (section: AppSection) => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { appSection, setAppSection } = useStorage();
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');

  const toggleTheme = () => {
    setThemeMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const theme = useMemo(() => {
    const baseTheme = themeMode === 'light' ? lightTheme : darkTheme;
    const section: AppSection = appSection === 'pharma' ? 'pharma' : 'grocery';
    const sectionColors = baseTheme.colors[section];

    return {
      ...baseTheme,
      colors: {
        ...baseTheme.colors,
        primary: sectionColors.primary,
        secondary: sectionColors.secondary,
        tertiary: sectionColors.tertiary,
      },
    };
  }, [themeMode, appSection]);

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      themeMode,
      section: (appSection || 'grocery') as AppSection,
      setThemeMode,
      toggleTheme, 
      setSection: setAppSection 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};