// screens/CartScreen.tsx
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Text, Button, Card, useTheme } from 'react-native-paper';
import { useCart } from '../contexts/CartContext';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useNavigation } from '@react-navigation/native';
import ProductCard from '../components/ProductCard';
import { ScrollView as RNScrollView } from 'react-native';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Cart'>;

const CartScreen = () => {
  const { groceryItems, pharmacyItems, removeFromCart, updateQuantity, groceryTotal, pharmacyTotal, addToGroceryCart, addToPharmacyCart } = useCart();
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();
  
  // Combine all items
  const allItems = [...groceryItems, ...pharmacyItems];
  const totalAmount = groceryTotal + pharmacyTotal;

  const handleCheckout = () => {
    // Navigate to payment methods/checkout screen
    navigation.navigate('PaymentMethods');
  };

  // Mock recommended products
  const recommendedProducts = [
    { id: '101', name: 'Amul Milk 1L', price: 65, image: 'https://blinkit.com/images/products/400/amul-taaza-homogenised-toned-milk.jpg' },
    { id: '102', name: 'Britannia Cheese Slices', price: 120, image: 'https://blinkit.com/images/products/400/britannia-cheese-slices.jpg' },
    { id: '103', name: 'Mother Dairy Curd', price: 30, image: 'https://blinkit.com/images/products/400/mother-dairy-dahi.jpg' },
    { id: '104', name: 'Tropicana Juice', price: 90, image: 'https://blinkit.com/images/products/400/tropicana-orange-delight.jpg' },
    { id: '105', name: 'Cadbury Dairy Milk', price: 45, image: 'https://blinkit.com/images/products/400/cadbury-dairy-milk-chocolate.jpg' },
  ];

  // Mock recommended products for empty cart
  const emptyCartRecommendations = [
    { id: '101', name: 'Amul Milk 1L', price: 65, image: 'https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', category: 'grocery' as const },
    { id: '102', name: 'Britannia Cheese Slices', price: 120, image: 'https://images.pexels.com/photos/821365/pexels-photo-821365.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', category: 'grocery' as const },
    { id: '103', name: 'Mother Dairy Curd', price: 30, image: 'https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', category: 'grocery' as const },
    { id: '104', name: 'Tropicana Juice', price: 90, image: 'https://images.pexels.com/photos/2789328/pexels-photo-2789328.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', category: 'grocery' as const },
    { id: '105', name: 'Cadbury Dairy Milk', price: 45, image: 'https://images.pexels.com/photos/5638597/pexels-photo-5638597.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', category: 'grocery' as const },
    { id: '106', name: 'Fresh Apples', price: 120, image: 'https://images.pexels.com/photos/2093087/pexels-photo-2093087.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', category: 'grocery' as const },
  ];

  const renderRecommendations = (navigation: any) => (
    <View style={{ marginTop: 12, marginBottom: 18 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginLeft: 16, marginBottom: 8 }}>You Might Also Like</Text>
      <RNScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 12, paddingRight: 8 }}>
        {recommendedProducts.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onPress={() => navigation.navigate('ProductDetail', { product })}
            style={{ width: 140, marginRight: 12 }}
          />
        ))}
      </RNScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      {allItems.length === 0 ? (
        <View style={styles.emptyCart}>
          <View style={styles.emptyCartContent}>
            <Text style={[styles.emptyText, { color: theme.colors.onSurface }]}>Your cart is empty</Text>
            <Text style={[styles.emptySubtext, { color: theme.colors.onSurfaceVariant }]}>
              Add some items to get started
            </Text>
          </View>
          
          <View style={styles.recommendationsContainer}>
            <Text style={[styles.recommendationsTitle, { color: theme.colors.onSurface }]}>
              Recommended for you
            </Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recommendationsScroll}
            >
              {emptyCartRecommendations.map(product => (
                <View key={product.id} style={[styles.recommendationCard, { backgroundColor: theme.colors.surface }]}>
                  <Image source={{ uri: product.image }} style={styles.recommendationImage} />
                  <Text style={[styles.recommendationName, { color: theme.colors.onSurface }]} numberOfLines={2}>
                    {product.name}
                  </Text>
                  <Text style={[styles.recommendationPrice, { color: theme.colors.primary }]}>
                    ₹{product.price}
                  </Text>
                  <TouchableOpacity 
                    style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
                    onPress={() => {
                      const cartItem = {
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        image: product.image
                      };
                      addToGroceryCart(cartItem);
                    }}
                  >
                    <Text style={styles.addButtonText}>Add</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      ) : (
        <>
          <ScrollView style={styles.cartList}>
            {allItems.map((item) => (
              <Card key={item.id} style={styles.cartItem}>
                <Card.Content>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemPrice}>₹{item.price}</Text>
                  </View>
                  {item.variant && (
                    <Text style={styles.variantText}>
                      {item.variant.name}: {item.variant.unit}
                    </Text>
                  )}
                  <View style={styles.quantityContainer}>
                    <Button
                      mode="outlined"
                      onPress={() => updateQuantity(item.id, item.quantity - 1, item.category)}
                      style={styles.quantityButton}
                    >
                      -
                    </Button>
                    <Text style={styles.quantityText}>{item.quantity}</Text>
                    <Button
                      mode="outlined"
                      onPress={() => updateQuantity(item.id, item.quantity + 1, item.category)}
                      style={styles.quantityButton}
                    >
                      +
                    </Button>
                    <Button
                      mode="outlined"
                      onPress={() => removeFromCart(item.id, item.category)}
                      style={styles.removeButton}
                    >
                      Remove
                    </Button>
                  </View>
                </Card.Content>
              </Card>
            ))}
          </ScrollView>
          
          {renderRecommendations(navigation)}
          
          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>Total: ₹{totalAmount}</Text>
            <Button
              mode="contained"
              onPress={handleCheckout}
              disabled={allItems.length === 0}
            >
              Proceed to Checkout
            </Button>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cartList: {
    flex: 1,
    padding: 16,
  },
  cartItem: {
    marginBottom: 16,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemPrice: {
    fontSize: 16,
  },
  variantText: {
    fontSize: 14,
    marginBottom: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  quantityButton: {
    marginHorizontal: 4,
  },
  quantityText: {
    fontSize: 16,
    marginHorizontal: 8,
  },
  removeButton: {
    marginLeft: 'auto',
  },
  totalContainer: {
    padding: 16,
    borderTopWidth: 1,
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  emptyCart: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  emptyCartContent: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 50,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  recommendationsContainer: {
    width: '100%',
  },
  recommendationsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  recommendationsScroll: {
    paddingHorizontal: 16,
  },
  recommendationCard: {
    width: 150,
    marginRight: 16,
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recommendationImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 12,
  },
  recommendationName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    lineHeight: 18,
  },
  recommendationPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  addButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default CartScreen;