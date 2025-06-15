import { NavigatorScreenParams } from '@react-navigation/native';

// navigation/types.ts
export type RootStackParamList = {
  Splash: undefined;
  Pincode: undefined;
  StoreSelection: undefined;
  Home: { 
    pincode: string;
    storeId: string;
    storeType: 'grocery' | 'pharmacy';
    initialTab?: 'grocery' | 'pharmacy';
  };
  StoreList: { pincode: string };
  GroceryHome: { storeId: string };
  ProductDetail: { product: any };
  Cart: undefined;
  Checkout: { type: 'grocery' | 'pharmacy' };
  OrderConfirmation: undefined;
  PharmacyHome: { storeId: string };
  MedicineDetail: { medicine: { id: string; name: string; price: number; image?: string } };
  Profile: undefined;
  Orders: undefined;
  PaymentMethods: undefined;
  HelpCenter: undefined;
  AllProducts: {
    title: string;
    products: any[];
  };
  CategoryDetail: {
    category: {
      id: string;
      name: string;
      image: string;
      subCategories: Array<{
        id: string;
        name: string;
        products: Array<{
          id: string;
          name: string;
          price: number;
          image: string;
          description: string;
          brand: string;
        }>;
        brands?: string[];
      }>;
    };
  };
  BannerDetail: { bannerId: string };
  PhoneAuth: { cartType: 'grocery' | 'pharmacy' };
  OTPVerification: { 
    phoneNumber: string;
    cartType: 'grocery' | 'pharmacy';
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