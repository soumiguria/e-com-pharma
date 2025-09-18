import { NavigatorScreenParams } from '@react-navigation/native';

// navigation/types.ts
export type RootStackParamList = {
  Splash: undefined;
  Pincode: undefined;
  StoreSelection: undefined;
  StoreList: {
    pincode?: string;
    latitude?: number;
    longitude?: number;
    address?: string;
    storeType?: 'grocery' | 'pharma';
  };
  Main: NavigatorScreenParams<HomeTabParamList>;
  ProductDetail: { product: any };
  CategoryDetail: { category: any };
  MedicineDetail: { medicine: any };
  Cart: undefined;
  Checkout: { type: 'grocery' | 'pharma' };
  OrderConfirmation: {
    paymentData?: any;
    orderId?: string;
    amount?: number;
  };
  Profile: undefined;
  Orders: undefined;
  OrderDetail: { order: any };
  PaymentMethods: { selectedAddress?: any };
  RazorpayCheckout: {
    amount: number;
    currency?: string;
    name?: string;
    description: string;
    prefill?: {
      name?: string;
      email?: string;
      contact?: string;
    };
    orderId: string;
    cartType: 'grocery' | 'pharma';
    deliveryMethod: string;
  };
  HelpCenter: undefined;
  AllProducts: {
    title: string;
    products: any[];
  };
  BannerDetail: { bannerId: string };
  PhoneAuth: { cartType: 'grocery' | 'pharma' };
  Register: { 
    phoneNumber: string; 
    cartType: 'grocery' | 'pharma'; 
  };
  OTPVerification: {
    phoneNumber: string;
    cartType: 'grocery' | 'pharma';
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
  MyAddresses: { fromPaymentMethods?: boolean };
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
  UploadPrescription: undefined;
};

export type HomeTabParamList = {
  Home: { screen: 'HomeRoot', params: { storeId: string, pincode?: string }};
  'Order Again': undefined;
  Categories: undefined;
  Pharmacy: undefined;
  Grocery: undefined;
};

export type HomeStackParamList = {
  HomeRoot: { storeId: string, pincode?: string };
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
  PharmacyRoot: { storeId: string, pincode: string };
  ProductDetail: { product: any };
  CategoryDetail: { category: any };
  GreatOffersScreen: undefined;
  Cart: undefined;
  RecentlyBoughtScreen: undefined;
  BrandsScreen: undefined;
  CategoriesScreen: undefined;
  MedicineDetail: { medicine: any };
};