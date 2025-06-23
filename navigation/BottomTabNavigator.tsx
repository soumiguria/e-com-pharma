import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { View, Text } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import OrdersScreen from '../screens/OrdersScreen';
import PharmacyHomeScreen from '../screens/PharmacyHomeScreen';
import { useTheme } from '../contexts/ThemeContext';
import CategoryDetailScreen from '../screens/CategoryDetailScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import GreatOffersScreen from '../screens/GreatOffersScreen';
import CartScreen from '../screens/CartScreen';
import RecentlyBoughtScreen from '../screens/RecentlyBoughtScreen';
import BrandsScreen from '../screens/BrandsScreen';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const OrdersStack = createNativeStackNavigator();
const PharmacyStack = createNativeStackNavigator();

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
    </PharmacyStack.Navigator>
);


const BottomTabNavigator = () => {
  const { section } = useTheme();

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Order Again') {
            iconName = focused ? 'repeat' : 'repeat-outline';
          } else if (route.name === 'Categories') {
            iconName = focused ? 'apps' : 'apps-outline';
          } else if (route.name === 'Pharmacy' || route.name === 'Grocery') {
            if(section === 'grocery') {
              iconName = focused ? 'medical' : 'medical-outline';
            } else {
              iconName = focused ? 'basket' : 'basket-outline';
            }
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeStackNavigator} />
      <Tab.Screen name="Order Again" component={OrdersStackNavigator} />
      <Tab.Screen name="Categories" component={CategoriesScreen} />
      {section === 'grocery' ? (
        <Tab.Screen name="Pharmacy" component={PharmacyStackNavigator} />
      ) : (
        <Tab.Screen name="Grocery" component={HomeStackNavigator} />
      )}
    </Tab.Navigator>
  );
};

export default BottomTabNavigator; 