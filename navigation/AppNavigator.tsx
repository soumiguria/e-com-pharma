import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import SplashScreen from '../screens/SplashScreen';
import PincodeScreen from '../screens/PincodeScreen';
import HomeScreen from '../screens/HomeScreen';
import StoreListScreen from '../screens/StoreListScreen';
import GroceryHomeScreen from '../screens/GroceryHomeScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import CartScreen from '../screens/CartScreen';
import CheckoutScreen from '../screens/PaymentMethodsScreen';
import OrderConfirmationScreen from '../screens/OrdersScreen';
import PharmacyHomeScreen from '../screens/PharmacyHomeScreen';
import MedicineDetailScreen from '../screens/MedicineDetailScreen';
import ProfileScreen from '../screens/ProfileScreen';
import OrdersScreen from '../screens/OrdersScreen';
import PaymentMethodsScreen from '../screens/PaymentMethodsScreen';
import HelpCenterScreen from '../screens/HelpCenterScreen';
import AllProductsScreen from '../screens/AllProductsScreen';
import BannerDetailScreen from '../screens/BannerDetailScreen';
import CategoryDetailScreen from '../screens/CategoryDetailScreen';
import PhoneAuthScreen from '../screens/PhoneAuthScreen';
import OTPVerificationScreen from '../screens/OTPVerificationScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen 
          name="Cart" 
          component={CartScreen} 
          options={{ title: 'Your Cart' }}
        />
      <Stack.Screen name="Pincode" component={PincodeScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="StoreList" component={StoreListScreen} />
      <Stack.Screen name="GroceryHome" component={GroceryHomeScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="OrderConfirmation" component={OrderConfirmationScreen} />
      <Stack.Screen name="PharmacyHome" component={PharmacyHomeScreen} />
      <Stack.Screen name="MedicineDetail" component={MedicineDetailScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Orders" component={OrdersScreen} />
      <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
      <Stack.Screen name="HelpCenter" component={HelpCenterScreen} />
      <Stack.Screen name="AllProducts" component={AllProductsScreen} />
      <Stack.Screen name="BannerDetail" component={BannerDetailScreen} />
      <Stack.Screen name="CategoryDetail" component={CategoryDetailScreen} />
      <Stack.Screen name="PhoneAuth" component={PhoneAuthScreen} />
      <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator; 