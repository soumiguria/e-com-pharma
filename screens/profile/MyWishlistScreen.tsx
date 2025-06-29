import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Mock wishlist data
const mockWishlistItems = [
  {
    id: '1',
    name: 'Organic Apples',
    brand: 'Fresh Farms',
    price: 120,
    originalPrice: 150,
    image: 'https://images.pexels.com/photos/2093087/pexels-photo-2093087.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    inStock: true,
  },
  {
    id: '2',
    name: 'Bananas',
    brand: 'Tropical Fruits',
    price: 80,
    originalPrice: 100,
    image: 'https://images.pexels.com/photos/1093038/pexels-photo-1093038.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    inStock: true,
  },
  {
    id: '3',
    name: 'Milk 1L',
    brand: 'Dairy Fresh',
    price: 260,
    originalPrice: 280,
    image: 'https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    inStock: false,
  },
  {
    id: '4',
    name: 'Whole Wheat Bread',
    brand: 'Bakery Fresh',
    price: 75,
    originalPrice: 90,
    image: 'https://images.pexels.com/photos/1721934/pexels-photo-1721934.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    inStock: true,
  },
];

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const MyWishlistScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const [wishlistItems, setWishlistItems] = useState(mockWishlistItems);

  const removeFromWishlist = (itemId: string) => {
    setWishlistItems(prev => prev.filter(item => item.id !== itemId));
  };

  const renderWishlistItem = ({ item }: { item: typeof mockWishlistItems[0] }) => (
    <View style={[styles.wishlistItem, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      <View style={styles.itemInfo}>
        <Text style={[styles.itemName, { color: theme.colors.text }]} numberOfLines={2}>{item.name}</Text>
        <Text style={[styles.itemBrand, { color: theme.colors.secondary }]}>{item.brand}</Text>
        <View style={styles.priceRow}>
          <Text style={[styles.itemPrice, { color: theme.colors.primary }]}>₹{item.price}</Text>
          <Text style={[styles.originalPrice, { color: theme.colors.secondary }]}>₹{item.originalPrice}</Text>
        </View>
        {!item.inStock && (
          <Text style={[styles.outOfStock, { color: theme.colors.error }]}>Out of Stock</Text>
        )}
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.removeButton, { backgroundColor: theme.colors.error }]}
          onPress={() => removeFromWishlist(item.id)}
        >
          <MaterialCommunityIcons name="heart-off" size={20} color={theme.colors.surface} />
        </TouchableOpacity>
        {item.inStock && (
          <TouchableOpacity 
            style={[styles.addToCartButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => {
              // Add to cart logic here
              navigation.navigate('Cart');
            }}
          >
            <MaterialCommunityIcons name="cart-plus" size={20} color={theme.colors.surface} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>My Wishlist</Text>
        <View style={styles.placeholder} />
      </View>
      
      {wishlistItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="heart-outline" size={80} color={theme.colors.secondary} />
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>Your Wishlist is Empty</Text>
          <Text style={[styles.emptySubtitle, { color: theme.colors.secondary }]}>
            Start adding items to your wishlist to see them here
          </Text>
          <TouchableOpacity 
            style={[styles.shopNowButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => navigation.navigate('Home' as any)}
          >
            <Text style={[styles.shopNowText, { color: theme.colors.surface }]}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={wishlistItems}
          renderItem={renderWishlistItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  listContainer: {
    padding: 16,
  },
  wishlistItem: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemBrand: {
    fontSize: 14,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 14,
    textDecorationLine: 'line-through',
  },
  outOfStock: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionButtons: {
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  removeButton: {
    padding: 8,
    borderRadius: 20,
    marginBottom: 8,
  },
  addToCartButton: {
    padding: 8,
    borderRadius: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  shopNowButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shopNowText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MyWishlistScreen; 