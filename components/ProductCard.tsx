import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, StyleProp, ViewStyle, ImageURISource } from 'react-native';
import { useCart } from '../contexts/CartContext';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image?: string | ImageURISource;
  rating?: number;
  isNew?: boolean;
  isOnSale?: boolean;
}

interface ProductCardProps {
  product: Product;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onPress, style }) => {
  const { addToCart } = useCart();
  const { theme } = useTheme();
  const imageSource = typeof product.image === 'string' 
    ? { uri: product.image } 
    : product.image;

  const handleAddToCart = (e: any) => {
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: typeof product.image === 'string' ? product.image : ''
    });
  };

  return (
    <TouchableOpacity 
      style={[styles.container, style]} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        {product.image && (
          <Image source={imageSource} style={styles.image} resizeMode="cover" />
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
        
        <TouchableOpacity 
          style={[styles.cartButton, { backgroundColor: theme.colors.primary }]} 
          onPress={handleAddToCart}
        >
          <MaterialIcons name="add-shopping-cart" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
        
        {product.rating !== undefined && (
          <View style={styles.ratingContainer}>
            <Text style={styles.rating}>⭐ {product.rating.toFixed(1)}</Text>
          </View>
        )}
        
        <View style={styles.priceContainer}>
          <Text style={styles.price}>${product.price.toFixed(2)}</Text>
          {product.originalPrice && (
            <Text style={styles.originalPrice}>${product.originalPrice.toFixed(2)}</Text>
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
  imageContainer: {
    position: 'relative',
    aspectRatio: 1,
    backgroundColor: '#f5f5f5',
  },
  image: {
    width: '100%',
    height: '100%',
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
  name: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
    height: 36,
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
  originalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
  },
});

export default ProductCard;