import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './navigation/AppNavigator';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { StorageProvider } from './contexts/StorageContext';
import { CartProvider } from './contexts/CartContext';
import Toast from 'react-native-toast-message';

const AppContent = () => {
  const { theme } = useTheme();
  return (
    <NavigationContainer theme={theme}>
      <PaperProvider theme={theme}>
        <StorageProvider>
          <CartProvider>
            <AppNavigator />
            <Toast />
          </CartProvider>
        </StorageProvider>
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
