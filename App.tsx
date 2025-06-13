import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './navigation/AppNavigator';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { StorageProvider } from './contexts/StorageContext';

const AppContent = () => {
  const { theme } = useTheme();
  return (
    <NavigationContainer theme={theme}>
      <PaperProvider theme={theme}>
        <AppNavigator />
      </PaperProvider>
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <StorageProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </StorageProvider>
    </SafeAreaProvider>
  );
}
