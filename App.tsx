import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './navigation/AppNavigator';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { StorageProvider } from './contexts/StorageContext';
import { CartProvider, useCart } from './contexts/CartContext';
import { AppProvider } from './contexts/AppContext';
import { ToastProvider } from './contexts/ToastContext';
import CustomToast from './components/ui/CustomToast';
import ErrorBoundary from './components/ui/ErrorBoundary';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TouchableOpacity, Text } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from './navigation/types';

const FloatingCartButton = () => {
  const { groceryItems, pharmacyItems } = useCart();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const totalItems = (groceryItems?.length || 0) + (pharmacyItems?.length || 0);
  if (totalItems === 0) return null;
  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('Cart')}
      style={{
        position: 'absolute',
        top: 18,
        right: 14,
        backgroundColor: '#1A7B50',
        borderRadius: 22,
        paddingHorizontal: 12,
        paddingVertical: 7,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 8,
        zIndex: 9999,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
      }}
    >
      <MaterialCommunityIcons name="cart" size={18} color="#fff" />
      <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 13, marginLeft: 6 }}>{totalItems}</Text>
    </TouchableOpacity>
  );
};

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
                  <FloatingCartButton />
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
