import { NavigatorScreenParams } from '@react-navigation/native';

// navigation/types.ts
export type RootStackParamList = {
  Splash: undefined;
  Pincode: undefined;
  StoreSelection: undefined;
  Home: { pincode: string };
  StoreList: { pincode: string };
  GroceryHome: { storeId: string }; // Updated
  ProductDetail: { product: { id: string; name: string; price: number } };
  Cart: undefined;
  Checkout: undefined;
  OrderConfirmation: undefined;
  PharmacyHome: { storeId: string }; // Updated
  MedicineDetail: { medicine: { id: string; name: string; price: number } };
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
  GroceryHome: { storeId: string }; // or make it optional: { storeId?: string }
  ProductDetail: { product: { id: string; name: string; price: number } };
};

export type PharmacyStackParamList = {
  PharmacyHome: undefined;
  MedicineDetail: { medicine: { id: string; name: string; price: number } };
};