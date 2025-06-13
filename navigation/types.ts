import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Splash: undefined;
  Pincode: undefined;
  Home: { pincode: string }; // Add pincode parameter
  StoreList: { pincode: string };
  GroceryHome: { pincode: string };
  ProductDetail: { id: string };
  Cart: undefined;
  Checkout: undefined;
  OrderConfirmation: undefined;
  PharmacyHome: { pincode: string };
  MedicineDetail: { id: string };
  Profile: undefined;
  Orders: undefined;
  PaymentMethods: undefined;
  HelpCenter: undefined;
};

export type HomeTabParamList = {
  Grocery: undefined;
  Pharmacy: undefined;
  Cart: undefined;
  Profile: undefined;
};

export type GroceryStackParamList = {
  GroceryHome: undefined;
  ProductDetail: { product: { id: string; name: string; price: number } };
};

export type PharmacyStackParamList = {
  PharmacyHome: undefined;
  MedicineDetail: { medicine: { id: string; name: string; price: number } };
};