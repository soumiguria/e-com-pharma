import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp } from '@react-navigation/native'; // Add RouteProp
import ThemedButton from '../components/ThemedButton';
import { GroceryStackParamList } from '../navigation/types';
import { useTheme } from '../contexts/ThemeContext';
import { useCart } from '../contexts/CartContext';

// Correct type for route params
type ProductDetailRouteProp = RouteProp<GroceryStackParamList, 'ProductDetail'>;

const ProductDetailScreen = () => {
  const route = useRoute<ProductDetailRouteProp>();
  const { product } = route.params;
  const { theme } = useTheme();
  const { addToGroceryCart } = useCart();

  const handleAddToCart = () => {
    addToGroceryCart({
      id: product.id,
      name: product.name,
      price: product.price,
      storeId: '1' // You would get this from your store context
    });
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: theme.spacing.md,
      backgroundColor: theme.colors.background,
    },
    title: {
      fontSize: theme.typography.h2.fontSize,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    price: {
      fontSize: theme.typography.h3.fontSize,
      color: theme.colors.primary,
      marginBottom: theme.spacing.lg,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{product.name}</Text>
      <Text style={styles.price}>${product.price}</Text>
      <ThemedButton 
        title="Add to Cart" 
        onPress={handleAddToCart} 
      />
    </SafeAreaView>
  );
};

export default ProductDetailScreen;