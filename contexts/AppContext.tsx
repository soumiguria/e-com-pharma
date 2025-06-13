import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Store {
  id: string;
  name: string;
  address: string;
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
  userLocation: Location | null;
  setUserLocation: (location: Location | null) => void;
  cart: CartItem[];
  setCart: (cart: CartItem[]) => void;
  user: User | null;
  setUser: (user: User | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [user, setUser] = useState<User | null>(null);

  return (
    <AppContext.Provider
      value={{
        selectedStore,
        setSelectedStore,
        userLocation,
        setUserLocation,
        cart,
        setCart,
        user,
        setUser,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}; 