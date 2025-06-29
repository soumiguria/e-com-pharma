import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import SplashScreen from '../screens/SplashScreen';
import PincodeScreen from '../screens/PincodeScreen';
import StoreListScreen from '../screens/StoreListScreen';
import CartScreen from '../screens/CartScreen';
import CheckoutScreen from '../screens/PaymentMethodsScreen';
import OrderConfirmationScreen from '../screens/OrderConfirmationScreen';
import ProfileScreen from '../screens/ProfileScreen';
import OrdersScreen from '../screens/OrdersScreen';
import OrderDetailScreen from '../screens/OrderDetailScreen';
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
import MyWishlistScreen from '../screens/MyWishlistScreen';
import AboutStoreScreen from '../screens/AboutStoreScreen';
import ContactStoreScreen from '../screens/ContactStoreScreen';
import GroceryHomeScreen from '../screens/GroceryHomeScreen';
import PharmacyHomeScreen from '../screens/PharmacyHomeScreen';
import SearchScreen from '../screens/SearchScreen';
import SavedProductsScreen from '../screens/SavedProductsScreen';
import Under99ProductsScreen from '../screens/Under99ProductsScreen';
import Under199ProductsScreen from '../screens/Under199ProductsScreen';
import SearchResultsScreen from '../screens/SearchResultsScreen';

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
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
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
      <Stack.Screen name="MyWishlist" component={MyWishlistScreen} />
      <Stack.Screen name="AboutStore" component={AboutStoreScreen} />
      <Stack.Screen name="ContactStore" component={ContactStoreScreen} />
      <Stack.Screen name="GroceryHome" component={GroceryHomeScreen} />
      <Stack.Screen name="PharmacyHome" component={PharmacyHomeScreen} />
      <Stack.Screen name="LocateStore" component={AboutStoreScreen} />
      <Stack.Screen name="AboutPassKiDukaan" component={AboutStoreScreen} />
      <Stack.Screen name="Settings" component={AboutStoreScreen} />
      <Stack.Screen name="Notifications" component={AboutStoreScreen} />
      <Stack.Screen name="SearchScreen" component={SearchScreen} />
      <Stack.Screen name="SavedProducts" component={SavedProductsScreen} />
      <Stack.Screen name="Under99Products" component={Under99ProductsScreen} />
      <Stack.Screen name="Under199Products" component={Under199ProductsScreen} />
      <Stack.Screen name="SearchResults" component={SearchResultsScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator; 