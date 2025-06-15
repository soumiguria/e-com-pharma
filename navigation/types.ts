import { NavigatorScreenParams } from '@react-navigation/native';

// navigation/types.ts
export type RootStackParamList = {
  Splash: undefined;
  Pincode: undefined;
  StoreSelection: undefined;
  Home: { pincode: string };
  StoreList: { pincode: string };
  GroceryHome: { storeId: string };
  ProductDetail: { product: { id: string; name: string; price: number; image?: string } };
  Cart: undefined;
  Checkout: undefined;
  OrderConfirmation: undefined;
  PharmacyHome: { storeId: string };
  MedicineDetail: { medicine: { id: string; name: string; price: number; image?: string } };
  Profile: undefined;
  Orders: undefined;
  PaymentMethods: undefined;
  HelpCenter: undefined;
  AllProducts: {
    title: string;
    products: Array<{
      id: string;
      name: string;
      price: number;
      image: string;
      description?: string;
    }>;
  };
  BannerDetail: {
    bannerId: string;
  };
};

export type HomeTabParamList = {
  Grocery: undefined;
  Pharmacy: undefined;
  Cart: undefined;
  Profile: undefined;
};

export type GroceryStackParamList = {
  GroceryHome: { storeId: string };
  ProductDetail: { product: { id: string; name: string; price: number; image?: string } };
};

export type PharmacyStackParamList = {
  PharmacyHome: undefined;
  MedicineDetail: { medicine: { id: string; name: string; price: number; image?: string } };
};