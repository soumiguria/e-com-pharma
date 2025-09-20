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
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import ThemedButton from '../../components/ui/ThemedButton';
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
  brand?: string;
  images?: string[];
  availableQty?: number;
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
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const fadeAnim = new Animated.Value(0);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const [productDetails, setProductDetails] = useState<any>(extendedProduct);
  
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
    ? productDetails.images
    : productDetails.image ? [productDetails.image] : [];
  // If only one image, add dummy images for demo
  if (images.length <= 1) {
    images = [
      images[0] || 'https://images.pexels.com/photos/461382/pexels-photo-461382.jpeg',
      'https://images.pexels.com/photos/42059/orange-fruit-vitamins-healthy-eating-42059.jpeg',
      'https://images.pexels.com/photos/162806/lemon-yellow-citrus-fruit-162806.jpeg',
    ];
  }

  // Mock variants data - replace with actual data from your API
  const variants: ProductVariant[] = [
    { id: '1', name: 'Small (250g)', price: productDetails.price, stock: 10 },
    { id: '2', name: 'Medium (500g)', price: productDetails.price * 1.8, stock: 15 },
    { id: '3', name: 'Large (1kg)', price: productDetails.price * 3.2, stock: 8 },
  ];

  // Set first variant as default when component loads
  useEffect(() => {
    if (variants.length > 0 && !selectedVariant) {
      setSelectedVariant(variants[0]);
    }
  }, [variants, selectedVariant]);

  // 1. Add state for similar products (mock data for now)
  const similarProducts = [
    { id: '101', name: 'Amul Milk 1L', price: 65, originalPrice: 80, image: 'https://blinkit.com/images/products/400/amul-taaza-homogenised-toned-milk.jpg' },
    { id: '102', name: 'Britannia Cheese Slices', price: 120, originalPrice: 150, image: 'https://blinkit.com/images/products/400/britannia-cheese-slices.jpg' },
    { id: '103', name: 'Mother Dairy Curd', price: 30, originalPrice: 40, image: 'https://blinkit.com/images/products/400/mother-dairy-dahi.jpg' },
    { id: '104', name: 'Tropicana Juice', price: 90, originalPrice: 100, image: 'https://blinkit.com/images/products/400/tropicana-orange-delight.jpg' },
    { id: '105', name: 'Cadbury Dairy Milk', price: 45, originalPrice: 50, image: 'https://blinkit.com/images/products/400/cadbury-dairy-milk-chocolate.jpg' },
  ];

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
    const cartItems = productDetails.category === 'pharma' ? pharmacyItems : groceryItems;
    const cartItem = cartItems.find(item => item.id === itemId);
    const quantity = cartItem ? cartItem.quantity : 0;
    console.log('🔍 getCartQuantity:', { 
      productId, 
      variantId, 
      itemId, 
      category: productDetails.category, 
      quantity, 
      cartItems: cartItems.length,
      allCartItemIds: cartItems.map(item => item.id),
      foundItem: cartItem
    });
    return quantity;
  };

  const handleAddToCart = () => {
    const itemToAdd = {
      id: selectedVariant ? `${originalProductId}-${selectedVariant.id}` : originalProductId,
      name: productDetails.name,
      price: selectedVariant ? selectedVariant.price : productDetails.price,
      image: productDetails.image || '',
      quantity,
      variant: selectedVariant ? {
        name: selectedVariant.name,
        unit: selectedVariant.name.split(' ')[1].replace(/[()]/g, '')
      } : undefined,
      // Store the actual product ID that the API expects
      // Use the productId from API response if available, otherwise use originalProductId
      productId: productDetails.productId || originalProductId
    };
    
    addToCorrectCart(itemToAdd);
  };

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
        {/* Large Product Image */}
        <View style={{ width: '100%', height: width * 0.7, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginBottom: 24, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, borderBottomLeftRadius: 18, borderBottomRightRadius: 18, overflow: 'hidden' }}>
          <FlatList
            data={images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, idx) => idx.toString()}
            renderItem={({ item }) => (
              <View style={{ width, height: width * 0.7, alignItems: 'center', justifyContent: 'center' }}>
                <Image source={{ uri: item }} style={{ width: width * 0.8, height: width * 0.6, resizeMode: 'contain', borderRadius: 16, backgroundColor: '#f7f7f7' }} />
              </View>
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
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.colors.text, marginBottom: 2 }}>{extendedProduct.name}</Text>
          {/* Show selected variant name dynamically */}
          <Text style={{ fontSize: 15, color: theme.colors.secondary, marginBottom: 8 }}>{selectedVariant ? selectedVariant.name : (variants[0]?.name || '5 kg')}</Text>
          {/* Price Block */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, backgroundColor: '#F7F7F7', borderRadius: 8, padding: 8, alignSelf: 'flex-start' }}>
            <Text style={{ fontSize: 22, fontWeight: 'bold', color: theme.colors.primary }}>₹{(selectedVariant ? selectedVariant.price : extendedProduct.price).toFixed(2)}</Text>
            <Text style={{ fontSize: 15, color: '#888', textDecorationLine: 'line-through', marginLeft: 10 }}>₹{((selectedVariant ? selectedVariant.price : extendedProduct.price) * 1.15).toFixed(2)}</Text>
            <Text style={{ fontSize: 14, color: '#27ae60', fontWeight: 'bold', marginLeft: 10 }}>15% OFF</Text>
          </View>
          {/* Brand Section */}
          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, marginTop: 2, backgroundColor: '#F7F7F7', borderRadius: 8, padding: 8 }} onPress={() => navigation.navigate('BrandDetail', { brand: extendedProduct.brand || 'Aashirvaad' })}>
            <Image source={{ uri: 'https://seeklogo.com/images/A/amul-logo-7E6B2B7B2B-seeklogo.com.png' }} style={{ width: 32, height: 32, borderRadius: 16, marginRight: 10, backgroundColor: '#f0f0f0' }} />
            <View>
              <Text style={{ fontSize: 15, color: theme.colors.text, fontWeight: 'bold' }}>{extendedProduct.brand || 'Aashirvaad'}</Text>
              <Text style={{ fontSize: 13, color: theme.colors.primary }}>Explore all products</Text>
            </View>
          </TouchableOpacity>
          <View style={{ height: 1, backgroundColor: '#eee', marginVertical: 10 }} />
          {/* View Product Details (Expandable) */}
          <TouchableOpacity onPress={() => setDetailsExpanded(e => !e)} style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, marginBottom: 2 }}>
            <Text style={{ fontSize: 16, color: theme.colors.primary, fontWeight: 'bold', marginRight: 6 }}>View product details</Text>
            <MaterialIcons name={detailsExpanded ? 'expand-less' : 'expand-more'} size={22} color={theme.colors.primary} />
          </TouchableOpacity>
          {detailsExpanded && (
            <View style={{ marginTop: 6 }}>
              <Text style={{ fontSize: 15, color: theme.colors.text, marginBottom: 8 }}>{extendedProduct.description || 'No description available for this product.'}</Text>
            </View>
          )}
        </View>
        {/* Available Variants */}
        <View style={{ marginBottom: 18, backgroundColor: '#fff', borderRadius: 14, padding: 14, marginHorizontal: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, zIndex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.colors.text, marginBottom: 10 }}>Available Variants</Text>
          {variants.map((variant, idx) => (
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
                <Text style={{ fontSize: 15, color: theme.colors.primary, fontWeight: 'bold' }}>₹{variant.price.toFixed(2)}</Text>
              </View>
              {getCartQuantity(originalProductId, variant.id) > 0 ? (
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
                    addToCorrectCart({ id: `${originalProductId}-${variant.id}`, name: productDetails.name, price: variant.price, image: productDetails.image || '', variant: { name: variant.name, unit: variant.name.split(' ')[1].replace(/[()]/g, '') } });
                  }} style={{ width: 32, height: 32, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ color: '#27ae60', fontWeight: 'bold', fontSize: 22 }}>+</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                // Remove the 'Add' button from here (should only be in the fixed bottom bar)
                null
              )}
            </TouchableOpacity>
          ))}
        </View>
        {/* Similar Products Section */}
        <View style={{ marginTop: 8, marginBottom: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginLeft: 16, marginBottom: 8 }}>Similar Products</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 16, paddingRight: 16, paddingVertical: 4 }}>
            {similarProducts.map(product => (
              <TouchableOpacity
                key={product.id}
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
                onPress={() => navigation.push('ProductDetail', { product })}
                activeOpacity={0.88}
              >
                <Image source={{ uri: product.image }} style={{ width: 95, height: 110, borderRadius: 12, marginBottom: 12, backgroundColor: '#f7f7f7' }} />
                <Text style={{ fontSize: 15, fontWeight: '700', color: theme.colors.text, marginBottom: 6, textAlign: 'center', lineHeight: 18 }} numberOfLines={2}>{product.name}</Text>
                <Text style={{ fontSize: 16, color: theme.colors.primary, fontWeight: 'bold', textAlign: 'center', marginBottom: 4 }}>₹{product.price.toFixed(2)}</Text>
                {product.originalPrice && product.originalPrice > product.price && (
                  <Text style={{ fontSize: 13, color: theme.colors.secondary, textDecorationLine: 'line-through', textAlign: 'center', marginBottom: 3 }}>₹{product.originalPrice.toFixed(2)}</Text>
                )}
                {product.originalPrice && product.originalPrice > product.price && (
                  <Text style={{ fontSize: 12, color: '#FF9800', textAlign: 'center', fontWeight: 'bold' }}>{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% off</Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
      {/* Fixed Bottom Bar with Add to Cart +1/-1 counter for selected variant */}
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#fff', borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', elevation: 12, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12 }}>
        {selectedVariant ? (
          getCartQuantity(originalProductId, selectedVariant.id) > 0 ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 6, borderWidth: 1.5, borderColor: '#27ae60', height: 40, minWidth: 100, paddingHorizontal: 8 }}>
              <TouchableOpacity onPress={() => {
                if (!selectedVariant) return;
                const currentQty = getCartQuantity(originalProductId, selectedVariant.id);
                const newQty = Math.max(0, currentQty - 1);
                const itemId = `${originalProductId}-${selectedVariant.id}`;
                const category = productDetails.category || 'grocery';
                console.log('🛒 Bottom bar decrement:', { itemId, currentQty, newQty, category });
                updateQuantity(itemId, newQty, category);
              }} style={{ width: 40, height: 40, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: '#27ae60', fontWeight: 'bold', fontSize: 22 }}>-</Text>
              </TouchableOpacity>
              <Text style={{ width: 32, textAlign: 'center', color: '#27ae60', fontWeight: 'bold', fontSize: 20 }}>{getCartQuantity(originalProductId, selectedVariant.id)}</Text>
              <TouchableOpacity onPress={() => {
                if (!selectedVariant) return;
                addToCorrectCart({ id: `${originalProductId}-${selectedVariant.id}`, name: productDetails.name, price: selectedVariant.price, image: productDetails.image || '', variant: { name: selectedVariant.name, unit: selectedVariant.name.split(' ')[1].replace(/[()]/g, '') } });
              }} style={{ width: 40, height: 40, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: '#27ae60', fontWeight: 'bold', fontSize: 22 }}>+</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={{ backgroundColor: theme.colors.primary, borderRadius: 8, paddingHorizontal: 40, paddingVertical: 12, alignSelf: 'center' }}
              onPress={() => {
                if (!selectedVariant) return;
                addToCorrectCart({ id: `${originalProductId}-${selectedVariant.id}`, name: productDetails.name, price: selectedVariant.price, image: productDetails.image || '', variant: { name: selectedVariant.name, unit: selectedVariant.name.split(' ')[1].replace(/[()]/g, '') } });
              }}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>Add</Text>
            </TouchableOpacity>
          )
        ) : (
          <TouchableOpacity
            style={{ backgroundColor: '#ccc', borderRadius: 8, paddingHorizontal: 40, paddingVertical: 12, alignSelf: 'center', opacity: 0.7 }}
            disabled={true}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>Select a variant to add</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

export default ProductDetailScreen;