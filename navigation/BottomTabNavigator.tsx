import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { View, Text } from 'react-native';
import HomeScreen from '../screens/home/HomeScreen';
import OrdersScreen from '../screens/order/OrdersScreen';
import PharmacyHomeScreen from '../screens/home/PharmacyHomeScreen';
import { useTheme } from '../contexts/ThemeContext';
import CategoryDetailScreen from '../screens/category/CategoryDetailScreen';
import CategoriesScreen from '../screens/category/CategoriesScreen';
import ProductDetailScreen from '../screens/product/ProductDetailScreen';
import GreatOffersScreen from '../screens/home/GreatOffersScreen';
import CartScreen from '../screens/cart/CartScreen';
import RecentlyBoughtScreen from '../screens/profile/RecentlyBoughtScreen';
import BrandsScreen from '../screens/category/BrandsScreen';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from './types';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAppContext } from '../contexts/AppContext';

const getTabBarStyle = (route: any) => {
  const routeName = getFocusedRouteNameFromRoute(route) ?? '';

  if (routeName === 'ProductDetail' || routeName === 'MedicineDetail') {
    return { display: 'none' };
  }

  return { display: 'flex' };
};
const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const OrdersStack = createNativeStackNavigator();
const PharmacyStack = createNativeStackNavigator();

type NavigationProp = StackNavigationProp<RootStackParamList>;

const HomeStackNavigator = () => (
  <HomeStack.Navigator screenOptions={{ headerShown: false }}>
    <HomeStack.Screen name="HomeRoot" component={HomeScreen} />
    <HomeStack.Screen name="ProductDetail" component={ProductDetailScreen} />
    <HomeStack.Screen name="CategoryDetail" component={CategoryDetailScreen} />
    <HomeStack.Screen name="GreatOffersScreen" component={GreatOffersScreen} />
    <HomeStack.Screen name="Cart" component={CartScreen} />
    <HomeStack.Screen name="RecentlyBoughtScreen" component={RecentlyBoughtScreen} />
    <HomeStack.Screen name="BrandsScreen" component={BrandsScreen} />
    <HomeStack.Screen name="CategoriesScreen" component={CategoriesScreen} />
  </HomeStack.Navigator>
);

const OrdersStackNavigator = () => (
    <OrdersStack.Navigator screenOptions={{ headerShown: false }}>
        <OrdersStack.Screen name="OrdersRoot" component={OrdersScreen} />
    </OrdersStack.Navigator>
);

const PharmacyStackNavigator = () => (
    <PharmacyStack.Navigator screenOptions={{ headerShown: false }}>
        <PharmacyStack.Screen name="PharmacyRoot" component={PharmacyHomeScreen} />
        <PharmacyStack.Screen name="ProductDetail" component={ProductDetailScreen} />
        <PharmacyStack.Screen name="CategoryDetail" component={CategoryDetailScreen} />
        <PharmacyStack.Screen name="GreatOffersScreen" component={GreatOffersScreen} />
        <PharmacyStack.Screen name="Cart" component={CartScreen} />
        <PharmacyStack.Screen name="RecentlyBoughtScreen" component={RecentlyBoughtScreen} />
        <PharmacyStack.Screen name="BrandsScreen" component={BrandsScreen} />
        <PharmacyStack.Screen name="CategoriesScreen" component={CategoriesScreen} />
    </PharmacyStack.Navigator>
);


const BottomTabNavigator = () => {
  const { section, setSection } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const { 
    lastVisitedGroceryStore, 
    lastVisitedPharmacyStore, 
    setSelectedStore,
    saveLastVisitedStore,
    loadLastVisitedGroceryStore,
    loadLastVisitedPharmacyStore
  } = useAppContext();

  const handleGroceryTabPress = async (e: any) => {
    e.preventDefault();
    setSection('grocery');
    
    // Reload grocery store from storage to ensure we have latest
    const groceryStore = await loadLastVisitedGroceryStore();
    
    // Check if last visited grocery store exists
    if (groceryStore && groceryStore.id) {
      console.log('🛒 Opening last visited grocery store:', groceryStore);
      setSelectedStore(groceryStore);
      saveLastVisitedStore(groceryStore);
      
      // Navigate directly to Home with the store
      navigation.navigate('Main', {
        screen: 'Home',
        params: {
          screen: 'HomeRoot',
          params: {
            storeId: groceryStore.id,
            pincode: groceryStore.pincode,
            storeType: 'grocery',
            storeName: groceryStore.name,
          },
        },
      });
    } else {
      console.log('🛒 No last visited grocery store found, proceeding to location flow');
      // No last visited grocery store, proceed to location flow
      navigation.navigate('Pincode' as any);
    }
  };

  const handlePharmacyTabPress = async (e: any) => {
    e.preventDefault();
    setSection('pharma');
    
    // Reload pharmacy store from storage to ensure we have latest
    const pharmacyStore = await loadLastVisitedPharmacyStore();
    
    // Check if last visited pharmacy store exists
    if (pharmacyStore && pharmacyStore.id) {
      console.log('💊 Opening last visited pharmacy store:', pharmacyStore);
      setSelectedStore(pharmacyStore);
      saveLastVisitedStore(pharmacyStore);
      
      // Navigate directly to Pharmacy Home with the store
      navigation.navigate('Main', {
        screen: 'Pharmacy',
        params: {
          screen: 'PharmacyRoot',
          params: {
            storeId: pharmacyStore.id,
            pincode: pharmacyStore.pincode || '',
          },
        },
      });
    } else {
      console.log('💊 No last visited pharmacy store found, proceeding to location flow');
      // No last visited pharmacy store, proceed to location flow
      navigation.navigate('Pincode' as any);
    }
  };

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarStyle: getTabBarStyle(route) as any,
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';
  
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Order Again') {
            iconName = focused ? 'repeat' : 'repeat-outline';
          } else if (route.name === 'Cart') {
            iconName = focused ? 'cart' : 'cart-outline';
          } else if (route.name === 'Categories') {
            iconName = focused ? 'apps' : 'apps-outline';
          } else if (route.name === 'Pharmacy' || route.name === 'Grocery') {
            iconName =
              section === 'grocery'
                ? focused
                  ? 'medical'
                  : 'medical-outline'
                : focused
                ? 'basket'
                : 'basket-outline';
          }
  
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStackNavigator} />
      <Tab.Screen name="Order Again" component={OrdersStackNavigator} />
      <Tab.Screen name="Cart" component={CartScreen} />
      <Tab.Screen name="Categories" component={CategoriesScreen} />
  
      {section === 'grocery' ? (
        <Tab.Screen
          name="Pharmacy"
          component={PharmacyStackNavigator}
          listeners={{ tabPress: handlePharmacyTabPress }}
        />
      ) : (
        <Tab.Screen
          name="Grocery"
          component={HomeStackNavigator}
          listeners={{ tabPress: handleGroceryTabPress }}
        />
      )}
    </Tab.Navigator>
  );
  
};

export default BottomTabNavigator; 