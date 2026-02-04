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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import ThemedButton from '../../components/ui/ThemedButton';
import PrescriptionRequiredTag from '../../components/ui/PrescriptionRequiredTag';
import { HomeStackParamList } from '../../navigation/types';
import { useTheme } from '../../contexts/ThemeContext';
import { useCart } from '../../contexts/CartContext';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useToast } from '../../contexts/ToastContext';
import { RootStackParamList } from '../../navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppContext } from '../../contexts/AppContext';
import { storeProductService } from '../../services/api/storeProductService';

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
  productDescription?: string;
  brand?: string;
  images?: string[];
  availableQty?: number;
  prescriptionRequired?: boolean;
}

const ProductDetailScreen = () => {
  const route = useRoute<ProductDetailRouteProp>();
  const { product } = route.params;
  const extendedProduct = product as ExtendedProduct & { images?: string[], availableQty?: number };
  const { theme, section } = useTheme();
  const { addToGroceryCart, addToPharmacyCart, removeFromCart, updateQuantity, groceryItems, pharmacyItems } = useCart();
  const { showToast } = useToast();
  const { selectedStore } = useAppContext();
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const fadeAnim = new Animated.Value(0);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [detailsExpanded, setDetailsExpanded] = useState(false);

  // Helper to ensure image URLs are full URLs (in case they're relative paths)
  const ensureFullImageUrl = (imgPath: string | undefined | null): string => {
    if (!imgPath) return 'https://images.pexels.com/photos/461382/pexels-photo-461382.jpeg';
    if (imgPath.startsWith('http://') || imgPath.startsWith('https://')) return imgPath;
    if (imgPath.startsWith('/')) {
      // Prepend base URL for relative paths
      return `https://passkidukaanapi.margerp.com${imgPath}`;
    }
    return imgPath;
  };

  // Ensure initial product has full image URLs
  const initialProduct = {
    ...extendedProduct,
    image: extendedProduct.image ? ensureFullImageUrl(extendedProduct.image) : undefined,
    images: extendedProduct.images ? extendedProduct.images.map(ensureFullImageUrl) : undefined,
  };

  const [productDetails, setProductDetails] = useState<any>(initialProduct);

  // Use original product ID for cart operations (consistent with ProductCard)
  const originalProductId = extendedProduct.id;

  // Debug product IDs
  console.log('🔍 ProductDetailScreen IDs:', {
    originalProductId: originalProductId,
    extendedProductId: extendedProduct.id,
    productDetailsId: productDetails.id,
    selectedVariantId: selectedVariant?.id,
    category: productDetails.category
  });
  const [loading, setLoading] = useState(false);

  // Fetch product details from API if store is selected
  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!selectedStore?.id) {
        console.log('   No store selected, using fallback mock data');
        return;
      }

      try {
        setLoading(true);
        console.log(`🔄 Fetching ${section} product details:`, { storeId: selectedStore.id, productId: extendedProduct.id });

        if (section === 'pharma') {
          const response = await storeProductService.getPharmaProductDetails(selectedStore.id, extendedProduct.id);
          if (response.success && response.data) {
            console.log(' Pharma product details loaded from API');
            setProductDetails(response.data);
          } else {
            console.log('   Pharma API failed, using fallback mock data');
          }
        } else {
          const response = await storeProductService.getGroceryProductDetails(selectedStore.id, extendedProduct.id);
          if (response.success && response.data) {
            console.log(' Grocery product details loaded from API');
            setProductDetails(response.data);
          } else {
            console.log('   Grocery API failed, using fallback mock data');
          }
        }
      } catch (error) {
        console.log(`  Error fetching ${section} product details:`, error);
        console.log('   Using fallback mock data');
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [selectedStore?.id, section, extendedProduct.id]);

  // Use images array if present, else fallback to single image
  let images = productDetails.images && productDetails.images.length > 0
    ? productDetails.images.map(ensureFullImageUrl)
    : productDetails.image ? [ensureFullImageUrl(productDetails.image)] : [];

  // If no images at all, use placeholder
  if (images.length === 0) {
    images = ['https://images.pexels.com/photos/461382/pexels-photo-461382.jpeg'];
  }

  // If only one image, add dummy images for demo (but keep the real one first)
  if (images.length === 1) {
    images = [
      images[0],
      'https://images.pexels.com/photos/42059/orange-fruit-vitamins-healthy-eating-42059.jpeg',
      'https://images.pexels.com/photos/162806/lemon-yellow-citrus-fruit-162806.jpeg',
    ];
  }

  // Helper function to validate price
  const isValidPrice = (value: any): boolean => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') {
      const num = parseFloat(value);
      return !isNaN(num) && num > 0 && isFinite(num);
    }
    if (typeof value === 'number') {
      return value > 0 && isFinite(value);
    }
    return false;
  };

  // Helper function to validate quantity (stricter - must be a valid integer, not extracted from string)
  const isValidQuantity = (value: any): boolean => {
    if (value === null || value === undefined || value === '') return false;
    // If it's a number, check if it's a valid positive integer
    if (typeof value === 'number') {
      return Number.isInteger(value) && value > 0 && isFinite(value);
    }
    // If it's a string, check if it's a pure number (no letters or units)
    if (typeof value === 'string') {
      // Remove whitespace and check if it's a pure number
      const trimmed = value.trim();
      // Check if string is a valid integer (no decimal, no letters, no units)
      const num = parseInt(trimmed, 10);
      // Only valid if the parsed number equals the original string (no extra characters)
      return !isNaN(num) && num > 0 && String(num) === trimmed;
    }
    return false;
  };

  // Get valid price from product details
  const getValidPrice = (): number => {
    const price = selectedVariant ? selectedVariant.price : (productDetails.price || productDetails.sp || 0);
    if (typeof price === 'string') {
      const num = parseFloat(price);
      return !isNaN(num) && num > 0 ? num : 0;
    }
    return price > 0 ? price : 0;
  };

  // Get valid quantity/stock (stricter validation)
  const getValidQuantity = (): number => {
    const qty = productDetails.availableQty || productDetails.quantity || productDetails.stock || 0;
    // Use strict validation - only accept if it's a valid integer
    if (isValidQuantity(qty)) {
      if (typeof qty === 'number') {
        return qty;
      }
      if (typeof qty === 'string') {
        return parseInt(qty.trim(), 10);
      }
    }
    return 0;
  };

  // Check if product can be added to cart
  const canAddToCart = (): boolean => {
    const price = getValidPrice();
    const qty = getValidQuantity();
    return price > 0 && qty > 0;
  };

  // Variants - check if API provides variants, otherwise use empty array
  const variants: ProductVariant[] = productDetails.variants && Array.isArray(productDetails.variants) && productDetails.variants.length > 0
    ? productDetails.variants.map((v: any, idx: number) => ({
      id: v.id || v.variantId || String(idx),
      name: v.name || v.packing || v.quantity || 'Default',
      price: isValidPrice(v.price || v.sp) ? (typeof (v.price || v.sp) === 'string' ? parseFloat(v.price || v.sp) : (v.price || v.sp)) : 0,
      stock: isValidQuantity(v.stock || v.availableQty || v.quantity) ? (typeof (v.stock || v.availableQty || v.quantity) === 'string' ? parseInt(String(v.stock || v.availableQty || v.quantity).trim(), 10) : (v.stock || v.availableQty || v.quantity)) : 0,
    }))
    : [];

  // Set first variant as default when component loads (only if variants exist)
  useEffect(() => {
    if (variants.length > 0 && !selectedVariant) {
      setSelectedVariant(variants[0]);
    } else if (variants.length === 0) {
      setSelectedVariant(null);
    }
  }, [variants.length]);

  const addToCorrectCart = (itemToAdd: any) => {
    // Add to appropriate cart based on product category
    console.log('🛒 Adding to cart:', { itemToAdd, category: productDetails.category });
    if (productDetails.category === 'pharma') {
      addToPharmacyCart(itemToAdd);
    } else {
      addToGroceryCart(itemToAdd);
    }
  };

  // Get actual cart quantity for a product/variant
  const getCartQuantity = (productId: string, variantId?: string) => {
    const itemId = variantId ? `${productId}-${variantId}` : productId;
    const category = productDetails.category || 'grocery';
    const cartItems = category === 'pharma' ? pharmacyItems : groceryItems;
    const cartItem = cartItems.find(item => item.id === itemId);
    const quantity = cartItem ? cartItem.quantity : 0;
    console.log('🔍 getCartQuantity:', {
      productId,
      variantId,
      itemId,
      category,
      quantity,
      cartItems: cartItems.length,
      allCartItemIds: cartItems.map(item => item.id),
      foundItem: cartItem
    });
    return quantity;
  };

  // Get current cart quantity for the product (without variant)
  const getCurrentCartQuantity = () => {
    return getCartQuantity(originalProductId);
  };

  // Format long text into bullet points for better readability
  const toBulletPoints = (text?: string): string[] => {
    if (!text) return [];
    // Split on new lines or sentence boundaries, then trim out empties
    return text
      .split(/\n|(?<!\w\.\w.)(?<=\.|\?|!)\s+/)
      .map(part => part.trim())
      .filter(Boolean);
  };

  const renderBullets = (items: string[]) => {
    if (items.length === 0) return null;
    return items.map((line, idx) => (
      <View key={idx} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 }}>
        <Text style={{ marginRight: 8, color: theme.colors.text }}>{'\u2022'}</Text>
        <Text style={{ flex: 1, color: theme.colors.text, fontSize: 15, lineHeight: 22 }}>{line}</Text>
      </View>
    ));
  };

  const handleAddToCart = () => {
    const itemToAdd = {
      id: selectedVariant ? `${originalProductId}-${selectedVariant.id}` : originalProductId,
      name: productDetails.name,
      price: selectedVariant ? selectedVariant.price : getValidPrice(),
      image: productDetails.image || 'https://i.ibb.co/vCkbyTDX/Whats-App-Image-2026-01-24-at-11-14-54-PM.jpg',
      variant: selectedVariant ? {
        name: selectedVariant.name,
        unit: selectedVariant.name.split(' ')[1]?.replace(/[()]/g, '') || ''
      } : undefined,
      // Store the actual product ID that the API expects
      // Use the productId from API response if available, otherwise use originalProductId
      productId: productDetails.productId || originalProductId,
      originalPrice: productDetails.originalPrice,
      prescriptionRequired: productDetails.prescriptionRequired || false,
    };

    addToCorrectCart(itemToAdd);
  };

  const percentOff = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: 120, // Add extra bottom padding for bottom bar visibility
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
    productDescription: {
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
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Large Product Image */}
        <View style={{ width: '100%', height: width * 0.7, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginBottom: 24, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, borderBottomLeftRadius: 18, borderBottomRightRadius: 18, overflow: 'hidden' }}>
          <FlatList
            data={images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, idx) => idx.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={1}
                style={{ width, height: width * 0.7, alignItems: 'center', justifyContent: 'center' }}
                onPress={() => navigation.navigate('ImageViewer', { imageUrl: item, title: extendedProduct.name })}
              >
                <Image source={{ uri: item }} style={{ width: width * 0.8, height: width * 0.6, resizeMode: 'contain', borderRadius: 16, backgroundColor: '#f7f7f7' }} />
              </TouchableOpacity>
            )}
            onScroll={e => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setCurrentImageIndex(index);
            }}
            scrollEventThrottle={16}
          />
          {/* Pagination Dots */}
          <View style={{ flexDirection: 'row', position: 'absolute', bottom: 12, alignSelf: 'center' }}>
            {images.map((_: any, idx: number) => (
              <View
                key={idx}
                style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: idx === currentImageIndex ? theme.colors.primary : '#ddd', marginHorizontal: 4 }}
              />
            ))}
          </View>
        </View>
        {/* Product Info Card */}
        <View style={{ backgroundColor: '#fff', borderRadius: 18, marginHorizontal: 12, marginTop: 0, marginBottom: 18, padding: 18, elevation: 2, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, zIndex: 2 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, gap: 8 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.colors.text, flex: 1 }}>{extendedProduct.name}</Text>
            {extendedProduct.prescriptionRequired && (
              <PrescriptionRequiredTag />
            )}
          </View>
          {/* Show selected variant name dynamically */}
          <Text style={{ fontSize: 15, color: theme.colors.secondary, marginBottom: 8 }}>{selectedVariant ? selectedVariant.name : (variants[0]?.name || '')}</Text>
          {/* Price block on left, Add/counter on extreme right */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, width: '100%', flexWrap: 'wrap' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', backgroundColor: '#F7F7F7', borderRadius: 8, padding: 8, gap: 8 }}>
              <Text style={{ fontSize: 22, fontWeight: 'bold', color: theme.colors.primary }}>₹{getValidPrice().toFixed(2)}</Text>
              {getValidPrice() > 0 && percentOff > 0 && (
                <>
                  <Text style={{ fontSize: 15, color: '#888', textDecorationLine: 'line-through' }}>₹{product.originalPrice.toFixed(2)}</Text>
                  <Text style={{ fontSize: 14, color: '#27ae60', fontWeight: 'bold' }}>{percentOff}% OFF</Text>
                </>
              )}
            </View>
            <View style={{ marginLeft: 8 }}>
            {selectedVariant ? (
              getCartQuantity(originalProductId, selectedVariant.id) > 0 ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 8, borderWidth: 1.5, borderColor: '#27ae60', height: 40, paddingHorizontal: 6, marginLeft: 8 }}>
                  <TouchableOpacity onPress={() => { const id = `${originalProductId}-${selectedVariant.id}`; updateQuantity(id, Math.max(0, getCartQuantity(originalProductId, selectedVariant.id) - 1), productDetails.category || 'grocery'); }} style={{ width: 36, height: 36, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ color: '#27ae60', fontWeight: 'bold', fontSize: 20 }}>-</Text>
                  </TouchableOpacity>
                  <Text style={{ width: 28, textAlign: 'center', color: '#27ae60', fontWeight: 'bold', fontSize: 18 }}>{getCartQuantity(originalProductId, selectedVariant.id)}</Text>
                  <TouchableOpacity onPress={() => {
                    const id = `${originalProductId}-${selectedVariant.id}`;
                    const cat = productDetails.category || 'grocery';
                    const items = cat === 'pharma' ? pharmacyItems : groceryItems;
                    const ex = items.find(item => item.id === id);
                    if (ex) updateQuantity(id, ex.quantity + 1, cat);
                    else addToCorrectCart({ id, name: productDetails.name, price: selectedVariant.price, image: productDetails.image || 'https://i.ibb.co/vCkbyTDX/Whats-App-Image-2026-01-24-at-11-14-54-PM.jpg', variant: { name: selectedVariant.name, unit: selectedVariant.name.split(' ')[1]?.replace(/[()]/g, '') || '' }, productId: productDetails.productId || originalProductId, originalPrice: productDetails.originalPrice });
                  }} style={{ width: 36, height: 36, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ color: '#27ae60', fontWeight: 'bold', fontSize: 20 }}>+</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={{ backgroundColor: canAddToCart() ? theme.colors.primary : '#dc3545', borderRadius: 8, paddingHorizontal: 20, paddingVertical: 10, marginLeft: 8 }} onPress={() => { if (!canAddToCart()) return; addToCorrectCart({ id: `${originalProductId}-${selectedVariant.id}`, name: productDetails.name, price: selectedVariant.price, image: productDetails.image || 'https://i.ibb.co/vCkbyTDX/Whats-App-Image-2026-01-24-at-11-14-54-PM.jpg', variant: { name: selectedVariant.name, unit: selectedVariant.name.split(' ')[1]?.replace(/[()]/g, '') || '' }, productId: productDetails.productId || originalProductId, originalPrice: productDetails.originalPrice }); }} disabled={!canAddToCart()}>
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>{canAddToCart() ? 'ADD' : 'Out of Stock'}</Text>
                </TouchableOpacity>
              )
            ) : variants.length === 0 ? (
              getCurrentCartQuantity() > 0 ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 8, borderWidth: 1.5, borderColor: '#27ae60', height: 40, paddingHorizontal: 6, marginLeft: 8 }}>
                  <TouchableOpacity onPress={() => updateQuantity(originalProductId, Math.max(0, getCurrentCartQuantity() - 1), productDetails.category || 'grocery')} style={{ width: 36, height: 36, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ color: '#27ae60', fontWeight: 'bold', fontSize: 20 }}>-</Text>
                  </TouchableOpacity>
                  <Text style={{ width: 28, textAlign: 'center', color: '#27ae60', fontWeight: 'bold', fontSize: 18 }}>{getCurrentCartQuantity()}</Text>
                  <TouchableOpacity onPress={() => { if (!canAddToCart()) return; const cat = productDetails.category || 'grocery'; const items = cat === 'pharma' ? pharmacyItems : groceryItems; const ex = items.find(item => item.id === originalProductId); if (ex) updateQuantity(originalProductId, ex.quantity + 1, cat); else addToCorrectCart({ id: originalProductId, name: productDetails.name, price: getValidPrice(), image: productDetails.image || 'https://i.ibb.co/vCkbyTDX/Whats-App-Image-2026-01-24-at-11-14-54-PM.jpg', productId: productDetails.productId || originalProductId, originalPrice: productDetails.originalPrice }); }} style={{ width: 36, height: 36, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ color: '#27ae60', fontWeight: 'bold', fontSize: 20 }}>+</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={{ backgroundColor: canAddToCart() ? theme.colors.primary : '#dc3545', borderRadius: 8, paddingHorizontal: 20, paddingVertical: 10, marginLeft: 8 }} onPress={() => { if (!canAddToCart()) return; handleAddToCart(); }} disabled={!canAddToCart()}>
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>{canAddToCart() ? 'ADD' : 'Out of Stock'}</Text>
                </TouchableOpacity>
              )
            ) : (
              <Text style={{ fontSize: 14, color: theme.colors.secondary }}>Select a variant</Text>
            )}
            </View>
          </View>
          {/* Available Quantity Section */}
          {getValidQuantity() > 0 && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, marginTop: 2, backgroundColor: '#F7F7F7', borderRadius: 8, padding: 8 }}>
              <MaterialIcons name="inventory" size={20} color={theme.colors.primary} style={{ marginRight: 8 }} />
              <Text style={{ fontSize: 15, color: theme.colors.text }}>
                Available: <Text style={{ fontWeight: 'bold', color: theme.colors.primary }}>{getValidQuantity()} units</Text>
              </Text>
            </View>
          )}
          {/* Brand Section - Only show if brand exists in API data */}
          {(productDetails.brand || productDetails.manufacturer) && (
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, marginTop: 2, backgroundColor: '#F7F7F7', borderRadius: 8, padding: 8 }} onPress={() => navigation.navigate('BrandDetail', { brand: productDetails.brand || productDetails.manufacturer || '' })}>
              <Image source={{ uri: 'https://seeklogo.com/images/A/amul-logo-7E6B2B7B2B-seeklogo.com.png' }} style={{ width: 32, height: 32, borderRadius: 16, marginRight: 10, backgroundColor: '#f0f0f0' }} />
              <View>
                <Text style={{ fontSize: 15, color: theme.colors.text, fontWeight: 'bold' }}>{productDetails.brand || productDetails.manufacturer}</Text>
                <Text style={{ fontSize: 13, color: theme.colors.primary }}>Explore all products</Text>
              </View>
            </TouchableOpacity>
          )}
          
          {/* View Product Details (Expandable) */}
          <TouchableOpacity onPress={() => setDetailsExpanded(e => !e)} style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, marginBottom: 2 }}>
            <Text style={{ fontSize: 16, color: theme.colors.primary, fontWeight: 'bold', marginRight: 6 }}>View product details</Text>
            <MaterialIcons name={detailsExpanded ? 'expand-less' : 'expand-more'} size={22} color={theme.colors.primary} />
          </TouchableOpacity>
          
          {detailsExpanded && (
            <View style={{ marginTop: 6 }}>
              {/* Product Description */}
              {(productDetails.productDescription || productDetails.description) && (
                <View style={{ marginBottom: 12 }}>
                  <Text style={{ fontSize: 14, fontWeight: 'bold', color: theme.colors.text, marginBottom: 4 }}>Description</Text>
                  <Text style={{ fontSize: 15, color: theme.colors.text, lineHeight: 22 }}>
                    {productDetails.productDescription || productDetails.description}
                  </Text>
                </View>
              )}
              
              {/* Serving Size / Usage Instructions */}
              {productDetails.servingSize && (
                <View style={{ marginBottom: 12 }}>
                  <Text style={{ fontSize: 14, fontWeight: 'bold', color: theme.colors.text, marginBottom: 4 }}>How to Use</Text>
                  <Text style={{ fontSize: 15, color: theme.colors.text, lineHeight: 22 }}>
                    {productDetails.servingSize}
                  </Text>
                </View>
              )}
              
              {!productDetails.productDescription && !productDetails.description && !productDetails.servingSize && (
                <Text style={{ fontSize: 15, color: theme.colors.text, fontStyle: 'italic' }}>
                  No additional details available for this product.
                </Text>
              )}
            </View>
          )}
        </View>
        {/* Available Variants - Only show if variants exist */}
        {variants.length > 0 && (
          <View style={{ marginBottom: 18, backgroundColor: '#fff', borderRadius: 14, padding: 14, marginHorizontal: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, zIndex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.colors.text, marginBottom: 10 }}>Available Variants</Text>
            {variants.map((variant, idx) => {
              const variantCanAdd = isValidPrice(variant.price) && isValidQuantity(variant.stock);
              return (
                <TouchableOpacity
                  key={variant.id}
                  activeOpacity={0.85}
                  onPress={() => setSelectedVariant(variant)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: selectedVariant?.id === variant.id ? '#E6FFF2' : (idx === 0 ? '#F7FFF7' : '#F7F7F7'),
                    borderRadius: 10,
                    padding: 12,
                    marginBottom: idx === variants.length - 1 ? 0 : 10,
                    borderWidth: selectedVariant?.id === variant.id ? 2 : (idx === 0 ? 1.5 : 1),
                    borderColor: selectedVariant?.id === variant.id ? theme.colors.primary : (idx === 0 ? '#27ae60' : '#eee'),
                    shadowColor: selectedVariant?.id === variant.id ? theme.colors.primary : (idx === 0 ? '#27ae60' : '#000'),
                    shadowOpacity: selectedVariant?.id === variant.id ? 0.12 : (idx === 0 ? 0.08 : 0.03),
                    shadowRadius: 4,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                      <Text style={{ fontSize: 15, fontWeight: 'bold', color: theme.colors.text }}>{variant.name}</Text>
                      {idx === 0 && (
                        <View style={{ backgroundColor: '#27ae60', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, marginLeft: 8 }}>
                          <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>Best Seller</Text>
                        </View>
                      )}
                    </View>
                    <Text style={{ fontSize: 15, color: theme.colors.primary, fontWeight: 'bold' }}>
                      {isValidPrice(variant.price) ? `₹${variant.price.toFixed(2)}` : 'Price not available'}
                    </Text>
                  </View>
                  {variantCanAdd ? (
                    getCartQuantity(originalProductId, variant.id) > 0 ? (
                      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 8, borderWidth: 1.5, borderColor: '#27ae60', height: 34, minWidth: 80, paddingHorizontal: 6, margin: 0, shadowColor: '#27ae60', shadowOpacity: 0.08, shadowRadius: 4 }}>
                        <TouchableOpacity onPress={() => {
                          const currentQty = getCartQuantity(originalProductId, variant.id);
                          const newQty = Math.max(0, currentQty - 1);
                          const itemId = `${originalProductId}-${variant.id}`;
                          const category = productDetails.category || 'grocery';
                          console.log('🛒 Variant decrement:', { itemId, currentQty, newQty, category });
                          updateQuantity(itemId, newQty, category);
                        }} style={{ width: 32, height: 32, justifyContent: 'center', alignItems: 'center' }}>
                          <Text style={{ color: '#27ae60', fontWeight: 'bold', fontSize: 22 }}>-</Text>
                        </TouchableOpacity>
                        <Text style={{ width: 28, textAlign: 'center', color: '#27ae60', fontWeight: 'bold', fontSize: 18 }}>{getCartQuantity(originalProductId, variant.id)}</Text>
                        <TouchableOpacity onPress={() => {
                          const itemId = `${originalProductId}-${variant.id}`;
                          const category = productDetails.category || 'grocery';
                          const items = category === 'pharma' ? pharmacyItems : groceryItems;
                          const existing = items.find(item => item.id === itemId);

                          if (existing) {
                            updateQuantity(itemId, existing.quantity + 1, category);
                          } else {
                            addToCorrectCart({
                              id: itemId,
                              name: productDetails.name,
                              price: variant.price,
                              image: productDetails.image || 'https://i.ibb.co/vCkbyTDX/Whats-App-Image-2026-01-24-at-11-14-54-PM.jpg',
                              variant: { name: variant.name, unit: variant.name.split(' ')[1]?.replace(/[()]/g, '') || '' },
                              productId: productDetails.productId || originalProductId,
                              originalPrice: productDetails.originalPrice
                            });
                          }
                        }} style={{ width: 32, height: 32, justifyContent: 'center', alignItems: 'center' }}>
                          <Text style={{ color: '#27ae60', fontWeight: 'bold', fontSize: 22 }}>+</Text>
                        </TouchableOpacity>
                      </View>
                    ) : null
                  ) : (
                    <View style={{ paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#fee', borderRadius: 6 }}>
                      <Text style={{ fontSize: 12, color: '#dc3545', fontStyle: 'italic', fontWeight: '500' }}>Out of stock</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Add a tag to mention if the product requires prescription if yes then show a red colored tag stating prescription required */}
        {productDetails.prescriptionRequired && (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 12, marginBottom: 18, padding: 10, backgroundColor: '#ffe6e6', borderRadius: 8 }}>
            <PrescriptionRequiredTag style={{ marginRight: 8 }} />
            <Text style={{ color: '#dc3545', fontWeight: 'bold', fontSize: 15 }}>Prescription Required</Text>
          </View>
        )}

        {/* Similar Products Section */}
        {/* <View style={{ marginTop: 8, marginBottom: 24 }}> */}
        {/* <Text style={{ fontSize: 18, fontWeight: 'bold', marginLeft: 16, marginBottom: 8, color: theme.colors.text }}>Similar Products</Text> */}
        {/* <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 16, paddingRight: 16, paddingVertical: 4 }}> */}
        {/* Fetch similar products from API or show placeholder
            {[1, 2, 3, 4, 5].map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={{
                  width: 135,
                  height: 260,
                  marginRight: 18,
                  backgroundColor: '#fff',
                  borderRadius: 18,
                  padding: 14,
                  borderWidth: 1,
                  borderColor: '#f0f0f0',
                  elevation: 3,
                  shadowColor: '#000',
                  shadowOpacity: 0.10,
                  shadowRadius: 8,
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  marginBottom: 10,
                }}
                onPress={() => {
                  // Navigate to similar product if available
                  // For now, just navigate to same product
                  navigation.push('ProductDetail', { product: productDetails });
                }}
                activeOpacity={0.88}
              >
                {/* <View style={{ width: 95, height: 110, borderRadius: 12, marginBottom: 12, backgroundColor: '#f7f7f7', justifyContent: 'center', alignItems: 'center' }}>
                  <MaterialIcons name="image" size={40} color="#ccc" />
                </View> */}
        {/* <Text style={{ fontSize: 15, fontWeight: '700', color: theme.colors.text, marginBottom: 6, textAlign: 'center', lineHeight: 18 }} numberOfLines={2}>
                  Similar Product {idx + 1}
                </Text> */}
        {/* <Text style={{ fontSize: 16, color: theme.colors.primary, fontWeight: 'bold', textAlign: 'center', marginBottom: 4 }}>₹{getValidPrice().toFixed(2)}</Text> */}
        {/* </TouchableOpacity> */}
        {/* ))} */}
        {/* </ScrollView> */}
        {/* </View> */}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProductDetailScreen;