import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Store {
  id: string;
  name: string;
  address: string;
  type?: 'grocery' | 'pharma';
  pincode?: string;
}

interface Location {
  latitude: number;
  longitude: number;
}

interface CartItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface AppContextType {
  selectedStore: Store | null;
  setSelectedStore: (store: Store | null) => void;
  lastVisitedStore: Store | null;
  setLastVisitedStore: (store: Store | null) => void;
  lastVisitedGroceryStore: Store | null;
  setLastVisitedGroceryStore: (store: Store | null) => void;
  lastVisitedPharmacyStore: Store | null;
  setLastVisitedPharmacyStore: (store: Store | null) => void;
  userLocation: Location | null;
  setUserLocation: (location: Location | null) => void;
  cart: CartItem[];
  setCart: (cart: CartItem[]) => void;
  user: User | null;
  setUser: (user: User | null) => void;
  saveLastVisitedStore: (store: Store) => Promise<void>;
  loadLastVisitedStore: () => Promise<Store | null>;
  loadLastVisitedGroceryStore: () => Promise<Store | null>;
  loadLastVisitedPharmacyStore: () => Promise<Store | null>;
}

export const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [lastVisitedStore, setLastVisitedStore] = useState<Store | null>(null);
  const [lastVisitedGroceryStore, setLastVisitedGroceryStore] = useState<Store | null>(null);
  const [lastVisitedPharmacyStore, setLastVisitedPharmacyStore] = useState<Store | null>(null);
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [user, setUser] = useState<User | null>(null);

  // Load last visited store on app start and set it as selected store
  useEffect(() => {
    const initializeStore = async () => {
      const lastStore = await loadLastVisitedStore();
      if (lastStore && !selectedStore) {
        console.log('🔄 Auto-setting last visited store as selected store:', lastStore);
        setSelectedStore(lastStore);
      }
    };
    
    initializeStore();
  }, []);

  const saveLastVisitedStore = async (store: Store) => {
    try {
      console.log('💾 Saving last visited store:', store);
      // Save general last visited store
      await AsyncStorage.setItem('last_visited_store', JSON.stringify(store));
      setLastVisitedStore(store);
      
      // Save based on store type
      if (store.type === 'grocery') {
        console.log('💾 Saving last visited grocery store:', store);
        await AsyncStorage.setItem('last_visited_grocery_store', JSON.stringify(store));
        setLastVisitedGroceryStore(store);
      } else if (store.type === 'pharma') {
        console.log('💾 Saving last visited pharmacy store:', store);
        await AsyncStorage.setItem('last_visited_pharmacy_store', JSON.stringify(store));
        setLastVisitedPharmacyStore(store);
      }
    } catch (error) {
      console.error('  Error saving last visited store:', error);
    }
  };

  const loadLastVisitedStore = async (): Promise<Store | null> => {
    try {
      console.log('🔄 Loading last visited store...');
      const storeData = await AsyncStorage.getItem('last_visited_store');
      if (storeData) {
        const store = JSON.parse(storeData);
        console.log(' Loaded last visited store:', store);
        setLastVisitedStore(store);
        return store;
      }
      console.log('ℹ️ No last visited store found');
      return null;
    } catch (error) {
      console.error('  Error loading last visited store:', error);
      return null;
    }
  };

  const loadLastVisitedGroceryStore = async (): Promise<Store | null> => {
    try {
      console.log('🔄 Loading last visited grocery store...');
      const storeData = await AsyncStorage.getItem('last_visited_grocery_store');
      if (storeData) {
        const store = JSON.parse(storeData);
        console.log(' Loaded last visited grocery store:', store);
        setLastVisitedGroceryStore(store);
        return store;
      }
      console.log('ℹ️ No last visited grocery store found');
      return null;
    } catch (error) {
      console.error('  Error loading last visited grocery store:', error);
      return null;
    }
  };

  const loadLastVisitedPharmacyStore = async (): Promise<Store | null> => {
    try {
      console.log('🔄 Loading last visited pharmacy store...');
      const storeData = await AsyncStorage.getItem('last_visited_pharmacy_store');
      if (storeData) {
        const store = JSON.parse(storeData);
        console.log(' Loaded last visited pharmacy store:', store);
        setLastVisitedPharmacyStore(store);
        return store;
      }
      console.log('ℹ️ No last visited pharmacy store found');
      return null;
    } catch (error) {
      console.error('  Error loading last visited pharmacy store:', error);
      return null;
    }
  };

  // Load grocery and pharmacy stores on app start
  useEffect(() => {
    const initializeStores = async () => {
      await loadLastVisitedGroceryStore();
      await loadLastVisitedPharmacyStore();
    };
    initializeStores();
  }, []);

  return (
    <AppContext.Provider value={{ 
      selectedStore, 
      setSelectedStore, 
      lastVisitedStore, 
      setLastVisitedStore,
      lastVisitedGroceryStore,
      setLastVisitedGroceryStore,
      lastVisitedPharmacyStore,
      setLastVisitedPharmacyStore,
      userLocation, 
      setUserLocation, 
      cart, 
      setCart, 
      user, 
      setUser,
      saveLastVisitedStore,
      loadLastVisitedStore,
      loadLastVisitedGroceryStore,
      loadLastVisitedPharmacyStore
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}; 