import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './navigation/AppNavigator';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { StorageProvider } from './contexts/StorageContext';
import { CartProvider } from './contexts/CartContext';
import { AppProvider } from './contexts/AppContext';
import { ToastProvider } from './contexts/ToastContext';
import CustomToast from './components/ui/CustomToast';
import ErrorBoundary from './components/ui/ErrorBoundary';

const AppContent = () => {
  const { theme } = useTheme();
  return (
    <NavigationContainer theme={theme}>
      <PaperProvider theme={theme}>
        <AppProvider>
          <StorageProvider>
            <CartProvider>
              <ToastProvider>
                <ErrorBoundary>
                  <AppNavigator />
                </ErrorBoundary>
                <CustomToast />
              </ToastProvider>
            </CartProvider>
          </StorageProvider>
        </AppProvider>
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
