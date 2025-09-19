// screens/CartScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, Alert } from 'react-native';
import { Text, Button, Card, useTheme } from 'react-native-paper';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useNavigation, useRoute } from '@react-navigation/native';
import ProductCard from '../../components/product/ProductCard';
import { ScrollView as RNScrollView } from 'react-native';
import { Appbar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Cart'>;

const CartScreen = () => {
  const { groceryItems, pharmacyItems, removeFromCart, updateQuantity, groceryTotal, pharmacyTotal, addToGroceryCart, addToPharmacyCart } = useCart();
  const { isAuthenticated } = useAuth();
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  
  
  // Separate totals
  const hasGroceryItems = groceryItems.length > 0;
  const hasPharmacyItems = pharmacyItems.length > 0;
  const allItems = [...groceryItems, ...pharmacyItems];
  const totalAmount = groceryTotal + pharmacyTotal;

  const toNumber = (value: unknown): number => {
    if (typeof value === 'number') return value;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const formatAmount = (value: unknown): string => {
    const n = toNumber(value);
    return n.toFixed(2);
  };

  const handleCheckout = () => {
    // Navigate to payment methods/checkout screen
    navigation.navigate('PaymentMethods', {});
  };

  // Mock recommended products for grocery
  const groceryRecommendations = [
    { id: '101', name: 'Amul Milk 1L', price: 65, originalPrice: 80, image: 'https://blinkit.com/images/products/400/amul-taaza-homogenised-toned-milk.jpg', category: 'grocery' as const },
    { id: '102', name: 'Britannia Cheese Slices', price: 120, originalPrice: 150, image: 'https://blinkit.com/images/products/400/britannia-cheese-slices.jpg', category: 'grocery' as const },
    { id: '103', name: 'Mother Dairy Curd', price: 30, originalPrice: 40, image: 'https://blinkit.com/images/products/400/mother-dairy-dahi.jpg', category: 'grocery' as const },
  ];

  // Mock recommended products for pharmacy
  const pharmacyRecommendations = [
    { id: 'p101', name: 'Paracetamol 500mg', price: 5.99, originalPrice: 8.99, image: 'https://cdn.pixabay.com/photo/2017/02/28/14/37/pills-2106003_1280.jpg', category: 'pharma' as const },
    { id: 'p102', name: 'Vitamin C 1000mg', price: 12.50, originalPrice: 15.99, image: 'https://cdn.pixabay.com/photo/2017/02/28/14/37/pills-2106003_1280.jpg', category: 'pharma' as const },
    { id: 'p103', name: 'Cetirizine 10mg', price: 8.99, originalPrice: 12.99, image: 'https://cdn.pixabay.com/photo/2017/02/28/14/37/pills-2106003_1280.jpg', category: 'pharma' as const },
  ];

  const renderRecommendations = (items: any[], title: string, addToCart: (item: any) => void) => (
    <View style={{ marginTop: 12, marginBottom: 18 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginLeft: 16, marginBottom: 8 }}>{title}</Text>
      <RNScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 12, paddingRight: 8 }}>
        {items.map(product => (
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

  const renderCartSection = (items: any[], title: string, total: number, addToCart: (item: any) => void) => {
    // Only show items with quantity > 0
    const activeItems = items.filter(item => item.quantity > 0);
    if (activeItems.length === 0) return null;

    return (
      <View style={styles.cartSection}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {activeItems.map((item) => (
          <Card key={item.id} style={styles.cartItem}>
            <Card.Content>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {/* Product Image */}
                {item.image && (
                  <Image source={{ uri: item.image }} style={{ width: 48, height: 48, borderRadius: 8, marginRight: 12, backgroundColor: '#f0f0f0' }} />
                )}
                <View style={{ flex: 1 }}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemPrice}>₹{formatAmount(item.price)}</Text>
                  </View>
                  {toNumber(item.originalPrice) > toNumber(item.price) && (
                    <Text style={[styles.itemPrice, { textDecorationLine: 'line-through', color: theme.colors.secondary, marginLeft: 6 }]}>₹{formatAmount(item.originalPrice)}</Text>
                  )}
                  {toNumber(item.originalPrice) > toNumber(item.price) && (
                    <Text style={[styles.itemPrice, { color: '#FF9800', marginLeft: 6 }]}>{Math.round(((toNumber(item.originalPrice) - toNumber(item.price)) / toNumber(item.originalPrice)) * 100)}% off</Text>
                  )}
                  {item.variant && (
                    <Text style={styles.variantText}>
                      {item.variant.name}: {item.variant.unit}
                    </Text>
                  )}
                  <View style={styles.quantityContainer}>
                    <TouchableOpacity
                      style={[styles.quantityButton, { backgroundColor: theme.colors.surface }]}
                      onPress={() => updateQuantity(item.id, item.quantity - 1, item.category)}
                      activeOpacity={0.7}
                    >
                      <MaterialCommunityIcons name="minus" size={18} color={theme.colors.onSurface} />
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{item.quantity}</Text>
                    <TouchableOpacity
                      style={[styles.quantityButton, { backgroundColor: theme.colors.surface }]}
                      onPress={() => updateQuantity(item.id, item.quantity + 1, item.category)}
                      activeOpacity={0.7}
                    >
                      <MaterialCommunityIcons name="plus" size={18} color={theme.colors.onSurface} />
                    </TouchableOpacity>
                    <Button
                      mode="outlined"
                      onPress={() => removeFromCart(item.id, item.category)}
                      style={styles.removeButton}
                    >
                      Remove
                    </Button>
                  </View>
                </View>
              </View>
            </Card.Content>
          </Card>
        ))}
        <View style={styles.sectionTotal}>
          <Text style={styles.sectionTotalText}>{title} Total: ₹{formatAmount(total)}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
    <Appbar.Header>
      <Appbar.BackAction onPress={() => navigation.goBack()} />
      <Appbar.Content title="My Cart" />
    </Appbar.Header>

      {allItems.length === 0 ? (
        <View style={styles.emptyCart}>
          <View style={styles.emptyCartContent}>
            <Text style={[styles.emptyText, { color: theme.colors.onSurface }]}>Your cart is empty</Text>
            <Text style={[styles.emptySubtext, { color: theme.colors.onSurfaceVariant }]}>
              Add some items to get started
            </Text>
          </View>
          
          {/* Recommended for You section - HIDDEN */}
          {/* <View style={styles.recommendationsContainer}>
            <Text style={[styles.recommendationsTitle, { color: theme.colors.onSurface }]}>
              Recommended for you
            </Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recommendationsScroll}
            >
              {groceryRecommendations.map(product => (
                <View key={product.id} style={[styles.recommendationCard, { backgroundColor: theme.colors.surface }]}>
                  <Image source={{ uri: product.image }} style={styles.recommendationImage} />
                  <Text style={[styles.recommendationName, { color: theme.colors.onSurface }]} numberOfLines={2}>
                    {product.name}
                  </Text>
                  <Text style={[styles.recommendationPrice, { color: theme.colors.primary }]}>₹{formatAmount(product.price)}</Text>
                  {toNumber(product.originalPrice) > toNumber(product.price) && (
                    <Text style={[styles.recommendationPrice, { textDecorationLine: 'line-through', color: theme.colors.secondary, marginLeft: 6 }]}>₹{formatAmount(product.originalPrice)}</Text>
                  )}
                  {toNumber(product.originalPrice) > toNumber(product.price) && (
                    <Text style={[styles.recommendationPrice, { color: '#FF9800', marginLeft: 6 }]}>{Math.round(((toNumber(product.originalPrice) - toNumber(product.price)) / toNumber(product.originalPrice)) * 100)}% off</Text>
                  )}
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
          </View> */}
          
          <Button
            mode="contained"
            onPress={() => navigation.navigate('Main', { screen: 'Home', params: { screen: 'HomeRoot', params: { storeId: '', pincode: '' } } })}
            style={{ marginTop: 32, borderRadius: 24, paddingHorizontal: 24 }}
          >
            Continue Shopping
          </Button>
        </View>
      ) : (
        <>
          <ScrollView style={styles.cartList}>
            {allItems.map((item) => (
              <Card key={item.id} style={styles.cartItem}>
                <Card.Content>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {/* Product Image */}
                    {item.image && (
                      <Image source={{ uri: item.image }} style={{ width: 48, height: 48, borderRadius: 8, marginRight: 12, backgroundColor: '#f0f0f0' }} />
                    )}
                    <View style={{ flex: 1 }}>
                      <View style={styles.itemHeader}>
                        <Text style={styles.itemName}>{item.name}</Text>
                        <Text style={styles.itemPrice}>₹{formatAmount(item.price)}</Text>
                      </View>
                      {toNumber(item.originalPrice) > toNumber(item.price) && (
                        <Text style={[styles.itemPrice, { textDecorationLine: 'line-through', color: theme.colors.secondary, marginLeft: 6 }]}>₹{formatAmount(item.originalPrice)}</Text>
                      )}
                      {toNumber(item.originalPrice) > toNumber(item.price) && (
                        <Text style={[styles.itemPrice, { color: '#FF9800', marginLeft: 6 }]}>{Math.round(((toNumber(item.originalPrice) - toNumber(item.price)) / toNumber(item.originalPrice)) * 100)}% off</Text>
                      )}
                      {item.variant && (
                        <Text style={styles.variantText}>
                          {item.variant.name}: {item.variant.unit}
                        </Text>
                      )}
                      <View style={styles.quantityContainer}>
                        <TouchableOpacity
                          style={[styles.quantityButton, { backgroundColor: theme.colors.surface }]}
                          onPress={() => updateQuantity(item.id, item.quantity - 1, item.category)}
                          activeOpacity={0.7}
                        >
                          <MaterialCommunityIcons name="minus" size={18} color={theme.colors.onSurface} />
                        </TouchableOpacity>
                        <Text style={styles.quantityText}>{item.quantity}</Text>
                        <TouchableOpacity
                          style={[styles.quantityButton, { backgroundColor: theme.colors.surface }]}
                          onPress={() => updateQuantity(item.id, item.quantity + 1, item.category)}
                          activeOpacity={0.7}
                        >
                          <MaterialCommunityIcons name="plus" size={18} color={theme.colors.onSurface} />
                        </TouchableOpacity>
                        <Button
                          mode="outlined"
                          onPress={() => removeFromCart(item.id, item.category)}
                          style={styles.removeButton}
                        >
                          Remove
                        </Button>
                      </View>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            ))}
          </ScrollView>
          
          {/* Recommendation sections - HIDDEN */}
          {/* {hasGroceryItems && renderRecommendations(groceryRecommendations, 'You Might Also Like', addToGroceryCart)}
          {hasPharmacyItems && renderRecommendations(pharmacyRecommendations, 'Recommended Medicines', addToPharmacyCart)} */}
          
          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>Total: ₹{formatAmount(totalAmount)}</Text>
            <Button
              mode="contained"
              onPress={handleCheckout}
              disabled={allItems.length === 0}
            >
              {isAuthenticated ? 'Process to Checkout' : 'Proceed to Checkout'}
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
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
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
  cartSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    marginLeft: 16,
  },
  sectionTotal: {
    marginTop: 16,
    marginBottom: 16,
    marginLeft: 16,
  },
  sectionTotalText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CartScreen;