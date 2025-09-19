import React from 'react';
import { NavigationContainer, LinkingOptions } from '@react-navigation/native';
import { Linking } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './navigation/AppNavigator';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { StorageProvider } from './contexts/StorageContext';
import { CartProvider, useCart } from './contexts/CartContext';
import { AppProvider } from './contexts/AppContext';
import { ToastProvider } from './contexts/ToastContext';
import { AuthProvider } from './contexts/AuthContext';
import CustomToast from './components/ui/CustomToast';
import ErrorBoundary from './components/ui/ErrorBoundary';
import SimpleStoreDeepLink from './components/deepLink/SimpleStoreDeepLink';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TouchableOpacity, Text } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from './navigation/types';

const getDeepestRouteName = (navState: any) => {
  if (!navState || !navState.routes || navState.routes.length === 0) return null;
  let route = navState.routes[navState.index ?? navState.routes.length - 1];
  while (route.state && route.state.routes) {
    route = route.state.routes[route.state.index ?? route.state.routes.length - 1];
  }
  return route.name;
};

const FloatingCartButton = () => {
  const { totalItems } = useCart();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Get current route name (deepest focused route)
  const navState = useNavigationState(state => state);
  const currentRoute = getDeepestRouteName(navState);

  // Hide on specific screens or if cart is empty
  const homeRouteNames = ['Home', 'HomeScreen', 'HomeRoot'];
  if (
    totalItems === 0 ||
    [
      'Splash',
      'Pincode',
      'StoreList',
      'SearchScreen',
      ...homeRouteNames,
    ].includes(currentRoute) ||
    // Also hide if currentRoute contains 'Home' (for nested routes, tab names, etc.)
    (currentRoute && currentRoute.toLowerCase().includes('home'))
  ) return null;

  // Adjust position for SearchScreen
  const isSearchScreen = currentRoute === 'SearchScreen';

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('Cart')}
      style={{
        position: 'absolute',
        top: isSearchScreen ? 70 : 18,
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
  const linking = React.useMemo<LinkingOptions<RootStackParamList>>(() => ({
    prefixes: [
      'ecomm://',
      'https://stores.yourdomain.com',
      'https://qr.ecomm.com',
      'https://ecomm-stores.com'
    ],
    config: {
      screens: {
        Splash: 'splash',
        Pincode: 'pincode',
        StoreList: 'store-list',
        AboutStore: {
          path: 'store/:storeId',
          parse: {
            storeId: (storeId: string) => storeId,
          },
        },
      },
    },
    // Custom getStateFromPath to handle ecomm://store/{storeId}
    getStateFromPath: (path, options) => {
      console.log('🔗 NavigationContainer: getStateFromPath called with:', path);
      
      // Handle ecomm://store/{storeId} format - SKIP ALL SCREENS
      if (path.startsWith('store/')) {
        const storeId = path.replace('store/', '');
        console.log('🔗 NavigationContainer: Extracted storeId:', storeId);
        console.log('🔗 NavigationContainer: SKIPPING Splash, Pincode, StoreList - Going DIRECT to Store Home Screen');
        
        // Determine store type based on storeId pattern
        // For now, we'll default to GroceryHome and let the screen determine the actual type
        // The screen will fetch store details and redirect to the correct home screen if needed
        const targetScreen = 'GroceryHome'; // Default to grocery, will be corrected by the screen
        
        return {
          routes: [
            {
              name: 'Main',
              state: {
                routes: [
                  {
                    name: 'Home',
                    state: {
                      routes: [
                        {
                          name: 'HomeRoot',
                          params: { storeId },
                        },
                      ],
                    },
                  },
                ],
              },
            },
          ],
        };
      }
      
      // Fallback to default parsing
      return undefined;
    },
  }), []);
  return (
    <NavigationContainer theme={theme} linking={linking}>
      <PaperProvider theme={theme}>
        <AppProvider>
          <StorageProvider>
            <CartProvider>
              <ToastProvider>
                <ErrorBoundary>
                  <SimpleStoreDeepLink>
                    <AppNavigator />
                    <FloatingCartButton />
                  </SimpleStoreDeepLink>
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
      <AuthProvider>
        <StorageProvider> 
          <ThemeProvider> 
            <AppContent />
          </ThemeProvider>
        </StorageProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
