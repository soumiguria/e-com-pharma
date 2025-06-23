import { NavigatorScreenParams } from '@react-navigation/native';

// navigation/types.ts
export type RootStackParamList = {
  Splash: undefined;
  Pincode: undefined;
  StoreSelection: undefined;
  StoreList: { pincode: string };
  Main: NavigatorScreenParams<HomeTabParamList>;
  ProductDetail: { product: any };
  CategoryDetail: { category: any };
  MedicineDetail: { medicine: any };
  Cart: undefined;
  Checkout: { type: 'grocery' | 'pharmacy' };
  OrderConfirmation: undefined;
  Profile: undefined;
  Orders: undefined;
  PaymentMethods: undefined;
  HelpCenter: undefined;
  AllProducts: {
    title: string;
    products: any[];
  };
  BannerDetail: { bannerId: string };
  PhoneAuth: { cartType: 'grocery' | 'pharmacy' };
  OTPVerification: {
    phoneNumber: string;
    cartType: 'grocery' | 'pharmacy';
  };
  CategoriesScreen: undefined;
  BrandsScreen: undefined;
  RecentlyBoughtScreen: undefined;
  GreatOffersScreen: undefined;
};

export type HomeTabParamList = {
  Home: { screen: 'HomeRoot', params: { storeId: string, pincode: string }};
  'Order Again': undefined;
  Categories: undefined;
  Pharmacy: undefined;
  Grocery: undefined;
};

export type HomeStackParamList = {
  HomeRoot: { storeId: string, pincode: string };
  ProductDetail: { product: any };
};

export type CategoriesStackParamList = {
  CategoriesRoot: undefined;
  CategoryDetail: { category: any };
};

export type PharmacyStackParamList = {
  PharmacyRoot: undefined;
  MedicineDetail: { medicine: any };
};