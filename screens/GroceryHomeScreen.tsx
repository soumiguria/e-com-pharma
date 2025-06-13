import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native'; // Add RouteProp
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ProductCard from '../components/ProductCard';
import StoreSection from '../components/StoreSection';
import { GroceryStackParamList } from '../navigation/types';
import { useTheme } from '../contexts/ThemeContext';

type NavigationProp = NativeStackNavigationProp<GroceryStackParamList, 'GroceryHome'>;

// Define types for our data structures
type Product = {
  id: string;
  name: string;
  price: number;
};

type Store = {
  id: string;
  name: string;
  distance: string;
  rating: number;
};

// Define proper route prop type
type GroceryHomeRouteProp = RouteProp<GroceryStackParamList, 'GroceryHome'>;

// Mock data with proper typing
const storeProducts: Record<string, Product[]> = {
  '1': [
    { id: '101', name: 'Organic Apples', price: 3.99 },
    { id: '102', name: 'Whole Grain Bread', price: 4.50 },
    { id: '103', name: 'Free Range Eggs', price: 5.99 },
  ],
  '2': [
    { id: '201', name: 'Organic Bananas', price: 1.99 },
    { id: '202', name: 'Almond Milk', price: 3.50 },
  ],
};

const GroceryHomeScreen = () => {
  const route = useRoute<GroceryHomeRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [store, setStore] = useState<Store | null>(null);

  useEffect(() => {
    // Now TypeScript knows storeId might exist in params
    const storeId = route.params?.storeId || '1';
    setStore({
      id: storeId,
      name: `Grocery Store ${storeId}`,
      distance: '0.5 km',
      rating: 4.5
    });
    setProducts(storeProducts[storeId] || []);
  }, [route.params]);

  const handleProductPress = (product: Product) => {
    navigation.navigate('ProductDetail', { product });
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: theme.spacing.md,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      {store && <StoreSection store={store} />}
      <View style={styles.content}>
        <Text style={styles.title}>Featured Products</Text>
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ProductCard 
              product={item} 
              onPress={() => handleProductPress(item)} 
            />
          )}
        />
      </View>
    </SafeAreaView>
  );
};

export default GroceryHomeScreen;