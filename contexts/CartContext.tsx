import React, { createContext, useContext, useState, ReactNode } from 'react';

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  storeId: string;
};

type CartContextType = {
  groceryCart: CartItem[];
  pharmacyCart: CartItem[];
  addToGroceryCart: (item: Omit<CartItem, 'quantity'>) => void;
  addToPharmacyCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromGroceryCart: (id: string) => void;
  removeFromPharmacyCart: (id: string) => void;
  clearGroceryCart: () => void;
  clearPharmacyCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [groceryCart, setGroceryCart] = useState<CartItem[]>([]);
  const [pharmacyCart, setPharmacyCart] = useState<CartItem[]>([]);

  const addToGroceryCart = (item: Omit<CartItem, 'quantity'>) => {
    setGroceryCart(prev => {
      const existingItem = prev.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prev.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const addToPharmacyCart = (item: Omit<CartItem, 'quantity'>) => {
    setPharmacyCart(prev => {
      const existingItem = prev.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prev.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromGroceryCart = (id: string) => {
    setGroceryCart(prev => prev.filter(item => item.id !== id));
  };

  const removeFromPharmacyCart = (id: string) => {
    setPharmacyCart(prev => prev.filter(item => item.id !== id));
  };

  const clearGroceryCart = () => setGroceryCart([]);
  const clearPharmacyCart = () => setPharmacyCart([]);

  return (
    <CartContext.Provider
      value={{
        groceryCart,
        pharmacyCart,
        addToGroceryCart,
        addToPharmacyCart,
        removeFromGroceryCart,
        removeFromPharmacyCart,
        clearGroceryCart,
        clearPharmacyCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};