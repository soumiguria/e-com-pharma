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
  OrderDetail: { order: any };
  PaymentMethods: undefined;
  HelpCenter: undefined;
  AllProducts: {
    title: string;
    products: any[];
  };
  BannerDetail: { bannerId: string };
  PhoneAuth: { cartType: 'grocery' | 'pharmacy' };
  Register: { 
    phoneNumber: string; 
    cartType: 'grocery' | 'pharmacy'; 
  };
  OTPVerification: {
    phoneNumber: string;
    cartType: 'grocery' | 'pharmacy';
    isRegistration?: boolean;
    userData?: {
      firstName: string;
      lastName: string;
      email: string;
    };
    otpKey?: string;
  };
  CategoriesScreen: undefined;
  BrandsScreen: undefined;
  RecentlyBoughtScreen: undefined;
  GreatOffersScreen: undefined;
  EditProfile: undefined;
  MyAddresses: undefined;
  AddAddress: { 
    location?: { latitude: number; longitude: number; address: string };
    addressId?: string;
  };
  LocationPicker: undefined;
  MyWishlist: undefined;
  AboutStore: undefined;
  ContactStore: undefined;
  LocateStore: undefined;
  AboutPassKiDukaan: undefined;
  Settings: undefined;
  Notifications: undefined;
  GroceryHome: { storeId: string };
  PharmacyHome: { storeId: string };
  SearchScreen: undefined;
  SearchResults: { query: string };
  SavedProducts: undefined;
  Under99Products: undefined;
  Under199Products: undefined;
  BrandDetail: { brand: string };
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
  CategoryDetail: { category: any };
  GreatOffersScreen: undefined;
  Cart: undefined;
  RecentlyBoughtScreen: undefined;
  BrandsScreen: undefined;
  CategoriesScreen: undefined;
};

export type CategoriesStackParamList = {
  CategoriesRoot: undefined;
  CategoryDetail: { category: any };
};

export type PharmacyStackParamList = {
  PharmacyRoot: undefined;
  MedicineDetail: { medicine: any };
};