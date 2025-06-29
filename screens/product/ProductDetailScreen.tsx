import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity,
  Dimensions,
  Platform,
  Animated,
  FlatList,
  SafeAreaView
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import ThemedButton from '../../components/ui/ThemedButton';
import { HomeStackParamList } from '../../navigation/types';
import { useTheme } from '../../contexts/ThemeContext';
import { useCart } from '../../contexts/CartContext';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useToast } from '../../contexts/ToastContext';

const { width } = Dimensions.get('window');

type ProductDetailRouteProp = RouteProp<HomeStackParamList, 'ProductDetail'>;

interface ProductVariant {
  id: string;
  name: string;
  price: number;
  stock: number;
}

interface ExtendedProduct {
  id: string;
  name: string;
  price: number;
  image?: string;
  description?: string;
  brand?: string;
  images?: string[];
  availableQty?: number;
}

const ProductDetailScreen = () => {
  const route = useRoute<ProductDetailRouteProp>();
  const { product } = route.params;
  const extendedProduct = product as ExtendedProduct & { images?: string[], availableQty?: number };
  const { theme } = useTheme();
  const { addToGroceryCart } = useCart();
  const { showToast } = useToast();
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const fadeAnim = new Animated.Value(0);

  // Use images array if present, else fallback to single image
  const images = extendedProduct.images && extendedProduct.images.length > 0
    ? extendedProduct.images
    : extendedProduct.image ? [extendedProduct.image] : [];

  // Mock variants data - replace with actual data from your API
  const variants: ProductVariant[] = [
    { id: '1', name: 'Small (250g)', price: extendedProduct.price, stock: 10 },
    { id: '2', name: 'Medium (500g)', price: extendedProduct.price * 1.8, stock: 15 },
    { id: '3', name: 'Large (1kg)', price: extendedProduct.price * 3.2, stock: 8 },
  ];

  const handleAddToCart = () => {
    const itemToAdd = {
      id: selectedVariant ? `${extendedProduct.id}-${selectedVariant.id}` : extendedProduct.id,
      name: extendedProduct.name,
      price: selectedVariant ? selectedVariant.price : extendedProduct.price,
      image: extendedProduct.image || '',
      quantity,
      variant: selectedVariant ? {
        name: selectedVariant.name,
        unit: selectedVariant.name.split(' ')[1].replace(/[()]/g, '')
      } : undefined
    };

    addToGroceryCart(itemToAdd);
    showToast(`${extendedProduct.name}${selectedVariant ? ` (${selectedVariant.name})` : ''} has been added to your cart`);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      flexGrow: 1,
    },
    imageContainer: {
      width: width,
      height: width,
      backgroundColor: theme.colors.surface,
    },
    image: {
      width: '100%',
      height: '100%',
      resizeMode: 'contain',
    },
    content: {
      padding: theme.spacing.lg,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    brand: {
      fontSize: 16,
      color: theme.colors.secondary,
      marginBottom: theme.spacing.md,
    },
    price: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.colors.primary,
      marginBottom: theme.spacing.lg,
    },
    description: {
      fontSize: 16,
      color: theme.colors.text,
      lineHeight: 24,
      marginBottom: theme.spacing.xl,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    variantsContainer: {
      marginBottom: theme.spacing.xl,
    },
    variantList: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginHorizontal: -theme.spacing.xs,
    },
    variantButton: {
      margin: theme.spacing.xs,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    selectedVariant: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary + '10',
    },
    variantText: {
      fontSize: 14,
      color: theme.colors.text,
    },
    selectedVariantText: {
      color: theme.colors.primary,
      fontWeight: '600',
    },
    quantityContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.xl,
    },
    quantityButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      ...Platform.select({
        ios: {
          shadowColor: theme.colors.text,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        android: {
          elevation: 4,
        },
      }),
    },
    quantityText: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginHorizontal: theme.spacing.lg,
    },
    bottomContainer: {
      padding: theme.spacing.lg,
      backgroundColor: theme.colors.surface,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      ...Platform.select({
        ios: {
          shadowColor: theme.colors.text,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        android: {
          elevation: 8,
        },
      }),
    },
    imageSliderContainer: {
      width: '100%',
      height: width * 0.7,
      backgroundColor: '#f7f7f7',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    sliderImage: {
      width: width,
      height: width * 0.7,
      resizeMode: 'contain',
    },
    paginationContainer: {
      flexDirection: 'row',
      position: 'absolute',
      bottom: 10,
      alignSelf: 'center',
    },
    paginationDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: 'rgba(0,0,0,0.2)',
      marginHorizontal: 4,
    },
    paginationDotActive: {
      backgroundColor: theme.colors.primary,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 18,
      marginBottom: 6,
    },
    productName: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.text,
      flex: 1,
      marginRight: 10,
    },
    productPrice: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.primary,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 18,
      marginBottom: 12,
      gap: 16,
    },
    brandName: {
      fontSize: 15,
      color: theme.colors.secondary,
      marginRight: 12,
    },
    availableQty: {
      fontSize: 15,
      color: theme.colors.text,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Image Slider */}
        <View style={styles.imageSliderContainer}>
          <FlatList
            data={images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, idx) => idx.toString()}
            renderItem={({ item }) => (
              <Image source={{ uri: item }} style={styles.sliderImage} resizeMode="contain" />
            )}
            onScroll={e => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setCurrentImageIndex(index);
            }}
            scrollEventThrottle={16}
          />
          {/* Pagination Dots */}
          <View style={styles.paginationContainer}>
            {images.map((_, idx) => (
              <View
                key={idx}
                style={[styles.paginationDot, idx === currentImageIndex && styles.paginationDotActive]}
              />
            ))}
          </View>
        </View>
        {/* Product Info Row */}
        <View style={styles.infoRow}>
          <Text style={styles.productName}>{extendedProduct.name}</Text>
          <Text style={styles.productPrice}>₹{selectedVariant ? selectedVariant.price : extendedProduct.price}</Text>
        </View>
        <View style={styles.metaRow}>
          {extendedProduct.brand && (
            <Text style={styles.brandName}>Brand: {extendedProduct.brand}</Text>
          )}
          {typeof extendedProduct.availableQty === 'number' && (
            <Text style={styles.availableQty}>Available: {extendedProduct.availableQty}</Text>
          )}
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>{extendedProduct.name}</Text>
          {extendedProduct.brand && (
            <Text style={styles.brand}>{extendedProduct.brand}</Text>
          )}
          <Text style={styles.price}>
            ${selectedVariant ? selectedVariant.price.toFixed(2) : extendedProduct.price.toFixed(2)}
          </Text>

          <Text style={styles.description}>
            {extendedProduct.description || 'No description available for this product.'}
          </Text>

          <View style={styles.variantsContainer}>
            <Text style={styles.sectionTitle}>Select Size</Text>
            <View style={styles.variantList}>
              {variants.map((variant) => (
                <TouchableOpacity
                  key={variant.id}
                  style={[
                    styles.variantButton,
                    selectedVariant?.id === variant.id && styles.selectedVariant
                  ]}
                  onPress={() => setSelectedVariant(variant)}
                >
                  <Text style={[
                    styles.variantText,
                    selectedVariant?.id === variant.id && styles.selectedVariantText
                  ]}>
                    {variant.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.quantityContainer}>
            <Text style={styles.sectionTitle}>Quantity</Text>
            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end' }}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <MaterialCommunityIcons name="minus" size={24} color={theme.colors.text} />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity(quantity + 1)}
              >
                <MaterialCommunityIcons name="plus" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomContainer}>
        <ThemedButton 
          title="Add to Cart" 
          onPress={handleAddToCart}
          style={{ marginBottom: 0 }}
        />
      </View>
    </SafeAreaView>
  );
};

export default ProductDetailScreen;