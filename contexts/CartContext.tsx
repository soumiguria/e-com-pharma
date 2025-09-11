// contexts/CartContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CartItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number; // Optional original price for MRP/discount
  image: string;
  quantity: number;
  category: 'grocery' | 'pharma';
  variant?: {
    name: string;
    unit: string;
  };
}

interface CartContextType {
  groceryItems: CartItem[];
  pharmacyItems: CartItem[];
  addToGroceryCart: (product: Omit<CartItem, 'quantity' | 'category'>) => void;
  addToPharmacyCart: (product: Omit<CartItem, 'quantity' | 'category'>) => void;
  removeFromCart: (productId: string, category: 'grocery' | 'pharma') => void;
  updateQuantity: (productId: string, newQuantity: number, category: 'grocery' | 'pharma') => void;
  groceryTotal: number;
  pharmacyTotal: number;
  totalItems: number;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType>({
  groceryItems: [],
  pharmacyItems: [],
  addToGroceryCart: () => {},
  addToPharmacyCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  groceryTotal: 0,
  pharmacyTotal: 0,
  totalItems: 0,
  clearCart: () => {},
});

export const CartProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [groceryItems, setGroceryItems] = useState<CartItem[]>([]);
  const [pharmacyItems, setPharmacyItems] = useState<CartItem[]>([]);

  // Load cart items from AsyncStorage on mount
  useEffect(() => {
    const loadCart = async () => {
      try {
        const savedGroceryCart = await AsyncStorage.getItem('groceryCart');
        const savedPharmacyCart = await AsyncStorage.getItem('pharmacyCart');
        if (savedGroceryCart) {
          setGroceryItems(JSON.parse(savedGroceryCart));
        }
        if (savedPharmacyCart) {
          setPharmacyItems(JSON.parse(savedPharmacyCart));
        }
      } catch (error) {
        console.error('Error loading cart:', error);
      }
    };
    loadCart();
  }, []);

  // Save cart items to AsyncStorage whenever they change
  useEffect(() => {
    const saveCart = async () => {
      try {
        await AsyncStorage.setItem('groceryCart', JSON.stringify(groceryItems));
        await AsyncStorage.setItem('pharmacyCart', JSON.stringify(pharmacyItems));
      } catch (error) {
        console.error('Error saving cart:', error);
      }
    };
    saveCart();
  }, [groceryItems, pharmacyItems]);

  const addToGroceryCart = (product: Omit<CartItem, 'quantity' | 'category'>) => {
    setGroceryItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevItems, { ...product, quantity: 1, category: 'grocery' }];
    });
  };

  const addToPharmacyCart = (product: Omit<CartItem, 'quantity' | 'category'>) => {
    setPharmacyItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevItems, { ...product, quantity: 1, category: 'pharma' }];
    });
  };

  const removeFromCart = (productId: string, category: 'grocery' | 'pharma') => {
    if (category === 'grocery') {
      setGroceryItems(prevItems => prevItems.filter(item => item.id !== productId));
    } else {
      setPharmacyItems(prevItems => prevItems.filter(item => item.id !== productId));
    }
  };

  const updateQuantity = (productId: string, newQuantity: number, category: 'grocery' | 'pharma') => {
    if (newQuantity < 1) {
      removeFromCart(productId, category);
      return;
    }
    if (category === 'grocery') {
      setGroceryItems(prevItems =>
        prevItems.map(item =>
          item.id === productId ? { ...item, quantity: newQuantity } : item
        )
      );
    } else {
      setPharmacyItems(prevItems =>
        prevItems.map(item =>
          item.id === productId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const clearCart = () => {
    setGroceryItems([]);
    setPharmacyItems([]);
  };

  const groceryTotal = groceryItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const pharmacyTotal = pharmacyItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const totalItems = groceryItems.reduce(
    (count, item) => count + item.quantity,
    0
  ) + pharmacyItems.reduce(
    (count, item) => count + item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        groceryItems,
        pharmacyItems,
        addToGroceryCart,
        addToPharmacyCart,
        removeFromCart,
        updateQuantity,
        groceryTotal,
        pharmacyTotal,
        totalItems,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
