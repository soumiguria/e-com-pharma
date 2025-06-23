import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, StyleProp, ViewStyle, ImageURISource } from 'react-native';
import { useCart } from '../contexts/CartContext';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import Toast from 'react-native-toast-message';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image?: string | ImageURISource;
  rating?: number;
  isNew?: boolean;
  isOnSale?: boolean;
  category?: 'grocery' | 'pharmacy';
}

interface ProductCardProps {
  product: Product;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  compact?: boolean;
  hideCartButton?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onPress, style, compact, hideCartButton }) => {
  const { addToGroceryCart, addToPharmacyCart } = useCart();
  const { theme } = useTheme();
  const imageSource = typeof product.image === 'string' 
    ? { uri: product.image } 
    : product.image;

  const handleAddToCart = (e: any) => {
    e.stopPropagation();
    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: typeof product.image === 'string' ? product.image : ''
    };

    if (product.category === 'pharmacy') {
      addToPharmacyCart(cartItem);
      Toast.show({
        type: 'success',
        text1: 'Added to Cart',
        text2: `${product.name} has been added to your pharmacy cart`,
        position: 'bottom',
        visibilityTime: 2000,
      });
    } else {
      addToGroceryCart(cartItem);
      Toast.show({
        type: 'success',
        text1: 'Added to Cart',
        text2: `${product.name} has been added to your grocery cart`,
        position: 'bottom',
        visibilityTime: 2000,
      });
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.container, compact && styles.compactContainer, { backgroundColor: theme.colors.surface }, style]} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.imageContainer, compact && styles.compactImageContainer, { backgroundColor: theme.colors.background }]}>
        {product.image && (
          <Image source={imageSource} style={[styles.image, compact && styles.compactImage]} resizeMode="cover" />
        )}
        
        <View style={styles.badgeContainer}>
          {product.isNew && (
            <View style={[styles.badge, styles.newBadge]}>
              <Text style={styles.badgeText}>New</Text>
            </View>
          )}
          {product.isOnSale && (
            <View style={[styles.badge, styles.saleBadge]}>
              <Text style={styles.badgeText}>Sale</Text>
            </View>
          )}
        </View>
        
        {!hideCartButton && (
          <TouchableOpacity 
            style={[styles.cartButton, { backgroundColor: theme.colors.primary }]} 
            onPress={handleAddToCart}
          >
            <MaterialIcons name="add-shopping-cart" size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      <View style={[styles.infoContainer, compact && styles.compactInfoContainer]}>
        <Text style={[styles.name, compact && styles.compactName, { color: theme.colors.text }]} numberOfLines={2}>{product.name}</Text>
        
        {product.rating !== undefined && (
          <View style={styles.ratingContainer}>
            <Text style={[styles.rating, { color: theme.colors.accent }]}>{`⭐ ${product.rating.toFixed(1)}`}</Text>
          </View>
        )}
        
        <View style={styles.priceContainer}>
          <Text style={[styles.price, compact && styles.compactPrice, { color: theme.colors.text }]}>{`₹${product.price.toFixed(2)}`}</Text>
          {product.originalPrice && (
            <Text style={[styles.originalPrice, { color: theme.colors.secondary }]}>{`₹${product.originalPrice.toFixed(2)}`}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    minHeight: 72,
    marginBottom: 8,
  },
  imageContainer: {
    position: 'relative',
    aspectRatio: 1,
    backgroundColor: '#f5f5f5',
  },
  compactImageContainer: {
    width: 56,
    height: 56,
    aspectRatio: undefined,
    borderRadius: 8,
    marginRight: 12,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  compactImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  badgeContainer: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    gap: 4,
  },
  badge: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  newBadge: {
    backgroundColor: '#4CAF50',
  },
  saleBadge: {
    backgroundColor: '#F44336',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  cartButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  infoContainer: {
    padding: 12,
  },
  compactInfoContainer: {
    flex: 1,
    padding: 0,
    marginLeft: 8,
    justifyContent: 'center',
  },
  name: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
    height: 36,
  },
  compactName: {
    fontSize: 13,
    height: undefined,
    marginBottom: 2,
  },
  ratingContainer: {
    marginBottom: 6,
  },
  rating: {
    fontSize: 12,
    color: '#FFC107',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  compactPrice: {
    fontSize: 14,
  },
  originalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
  },
});

export default ProductCard;