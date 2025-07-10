import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, StyleProp, ViewStyle, ImageURISource } from 'react-native';
import { useCart } from '../../contexts/CartContext';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';
import PriceBlock from '../ui/PriceBlock';

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
  perUnit?: string;
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
  const { showToast } = useToast();
  const [quantity, setQuantity] = useState(0);

  const imageSource = typeof product.image === 'string' 
    ? { uri: product.image } 
    : product.image;

  const handleAddToCart = (e: any) => {
    e.stopPropagation();
    setQuantity(1);
    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: typeof product.image === 'string' ? product.image : ''
    };
    if (product.category === 'pharmacy') {
      addToPharmacyCart(cartItem);
    } else {
      addToGroceryCart(cartItem);
    }
  };

  const handleIncrement = (e: any) => {
    e.stopPropagation();
    setQuantity(q => q + 1);
    // Optionally, add to cart again or update cart quantity here
  };

  const handleDecrement = (e: any) => {
    e.stopPropagation();
    setQuantity(q => {
      if (q <= 1) return 0;
      return q - 1;
    });
    // Optionally, remove from cart or update cart quantity here
  };

  const percentOff = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  // In the ProductCard component, before rendering:
  // For demonstration, if product.id === '1', set originalPrice to 199
  const displayOriginalPrice = product.id === '1' ? 199 : product.originalPrice;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        style,
        {
          backgroundColor: theme.dark ? '#4B3F1D' : '#FFF9E5',
          borderColor: theme.colors.border,
          margin: 8,
          padding: 10,
          borderRadius: 12,
          shadowColor: theme.dark ? '#000' : '#FFD700',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 4,
          elevation: 2,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.imageContainer, compact && styles.compactImageContainer, { backgroundColor: theme.colors.background }]}> 
        {product.image && (
          <Image source={imageSource} style={[styles.image, compact && styles.compactImage, { borderRadius: 12 }]} resizeMode="cover" />
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
          {percentOff && (
            <View style={[styles.badge, { backgroundColor: '#FF9800', marginLeft: 4 }]}> 
              <Text style={styles.badgeText}>{percentOff}% off</Text>
            </View>
          )}
        </View>
        {!hideCartButton && (
          quantity === 0 ? (
            <TouchableOpacity 
              style={styles.addButton}
              onPress={handleAddToCart}
              activeOpacity={0.85}
            >
              <Text style={styles.addButtonText}>ADD</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.counterContainer}>
              <TouchableOpacity onPress={handleDecrement} style={styles.counterBtn}>
                <Text style={styles.counterBtnText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.counterValue}>{quantity}</Text>
              <TouchableOpacity onPress={handleIncrement} style={styles.counterBtn}>
                <Text style={styles.counterBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          )
        )}
      </View>
      <View style={[styles.infoContainer, compact && styles.compactInfoContainer]}>
        <Text style={[styles.name, compact && styles.compactName, { color: theme.colors.text }]} numberOfLines={2}>{product.name}</Text>
        {product.rating !== undefined && (
          <View style={styles.ratingContainer}>
            <Text style={[styles.rating, { color: theme.colors.accent }]}>{`⭐ ${product.rating.toFixed(1)}`}</Text>
          </View>
        )}
        <PriceBlock price={product.price} originalPrice={displayOriginalPrice} perUnit={product.perUnit || '₹33.4/100 g'} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    minHeight: 220, // Increased for better fit
  },
  imageContainer: {
    position: 'relative',
    aspectRatio: 1,
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
    borderRadius: 12,
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
  addButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    minWidth: 54,
    height: 28,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#27ae60',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    shadowColor: 'rgba(39, 174, 96, 0.08)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
    margin: 0, // No spacing between image border and button
  },
  addButtonText: {
    color: '#27ae60',
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  counterContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#27ae60',
    height: 28,
    minWidth: 70,
    paddingHorizontal: 4,
    margin: 0,
  },
  counterBtn: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterBtnText: {
    color: '#27ae60',
    fontWeight: 'bold',
    fontSize: 18,
  },
  counterValue: {
    width: 24,
    textAlign: 'center',
    color: '#27ae60',
    fontWeight: 'bold',
    fontSize: 16,
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
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  compactPrice: {
    fontSize: 14,
  },
  originalPrice: {
    fontSize: 14,
    textDecorationLine: 'line-through',
  },
  compactOriginalPrice: {
    fontSize: 12,
  },
});

export default ProductCard;