import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import SplashScreen from '../screens/SplashScreen';
import PincodeScreen from '../screens/PincodeScreen';
import StoreListScreen from '../screens/StoreListScreen';
import CartScreen from '../screens/CartScreen';
import CheckoutScreen from '../screens/PaymentMethodsScreen';
import OrderConfirmationScreen from '../screens/OrdersScreen';
import ProfileScreen from '../screens/ProfileScreen';
import OrdersScreen from '../screens/OrdersScreen';
import PaymentMethodsScreen from '../screens/PaymentMethodsScreen';
import HelpCenterScreen from '../screens/HelpCenterScreen';
import AllProductsScreen from '../screens/AllProductsScreen';
import BannerDetailScreen from '../screens/BannerDetailScreen';
import PhoneAuthScreen from '../screens/PhoneAuthScreen';
import OTPVerificationScreen from '../screens/OTPVerificationScreen';
import BottomTabNavigator from './BottomTabNavigator';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import MedicineDetailScreen from '../screens/MedicineDetailScreen';
import CategoryDetailScreen from '../screens/CategoryDetailScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import BrandsScreen from '../screens/BrandsScreen';
import RecentlyBoughtScreen from '../screens/RecentlyBoughtScreen';
import GreatOffersScreen from '../screens/GreatOffersScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import MyAddressesScreen from '../screens/MyAddressesScreen';
import AddAddressScreen from '../screens/AddAddressScreen';
import LocationPickerScreen from '../screens/LocationPickerScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Pincode" component={PincodeScreen} />
      <Stack.Screen name="StoreList" component={StoreListScreen} />
      <Stack.Screen name="Main" component={BottomTabNavigator} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="MedicineDetail" component={MedicineDetailScreen} />
      <Stack.Screen name="CategoryDetail" component={CategoryDetailScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="OrderConfirmation" component={OrderConfirmationScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Orders" component={OrdersScreen} />
      <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
      <Stack.Screen name="HelpCenter" component={HelpCenterScreen} />
      <Stack.Screen name="AllProducts" component={AllProductsScreen} />
      <Stack.Screen name="BannerDetail" component={BannerDetailScreen} />
      <Stack.Screen name="PhoneAuth" component={PhoneAuthScreen} />
      <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
      <Stack.Screen name="CategoriesScreen" component={CategoriesScreen} options={{ headerShown: false }} />
      <Stack.Screen name="BrandsScreen" component={BrandsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="RecentlyBoughtScreen" component={RecentlyBoughtScreen} options={{ headerShown: false }} />
      <Stack.Screen name="GreatOffersScreen" component={GreatOffersScreen} options={{ headerShown: false }} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="MyAddresses" component={MyAddressesScreen} />
      <Stack.Screen name="AddAddress" component={AddAddressScreen} />
      <Stack.Screen name="LocationPicker" component={LocationPickerScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator; 