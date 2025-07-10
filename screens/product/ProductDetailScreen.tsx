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
  const { addToGroceryCart, removeFromCart } = useCart();
  const { showToast } = useToast();
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const fadeAnim = new Animated.Value(0);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  // Add state for variant quantities
  const [variantQuantities, setVariantQuantities] = useState<{ [variantId: string]: number }>({});

  // Use images array if present, else fallback to single image
  let images = extendedProduct.images && extendedProduct.images.length > 0
    ? extendedProduct.images
    : extendedProduct.image ? [extendedProduct.image] : [];
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
        <View style={{ width: '100%', height: width * 0.7, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginBottom: 8, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, borderBottomLeftRadius: 18, borderBottomRightRadius: 18 }}>
          <FlatList
            data={images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, idx) => idx.toString()}
            renderItem={({ item }) => (
              <Image source={{ uri: item }} style={{ width, height: width * 0.7, resizeMode: 'contain' }} />
            )}
            onScroll={e => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setCurrentImageIndex(index);
            }}
            scrollEventThrottle={16}
          />
          {/* Pagination Dots */}
          <View style={{ flexDirection: 'row', position: 'absolute', bottom: 12, alignSelf: 'center' }}>
            {images.map((_, idx) => (
              <View
                key={idx}
                style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: idx === currentImageIndex ? theme.colors.primary : '#ddd', marginHorizontal: 4 }}
              />
            ))}
          </View>
        </View>
        {/* Product Info Card */}
        <View style={{ backgroundColor: '#fff', borderRadius: 18, marginHorizontal: 12, marginTop: -24, padding: 18, elevation: 2, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.colors.text, marginBottom: 2 }}>{extendedProduct.name}</Text>
          <Text style={{ fontSize: 15, color: theme.colors.secondary, marginBottom: 8 }}>{selectedVariant ? selectedVariant.name : '5 kg'}</Text>
          {/* Price Block */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, backgroundColor: '#F7F7F7', borderRadius: 8, padding: 8, alignSelf: 'flex-start' }}>
            <Text style={{ fontSize: 22, fontWeight: 'bold', color: theme.colors.primary }}>₹{selectedVariant ? selectedVariant.price : extendedProduct.price}</Text>
            <Text style={{ fontSize: 15, color: '#888', textDecorationLine: 'line-through', marginLeft: 10 }}>₹{(selectedVariant ? selectedVariant.price * 1.15 : extendedProduct.price * 1.15).toFixed(0)}</Text>
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
          {/* Add to Cart Button (with +1/-1 counter for selected variant) */}
          {selectedVariant ? (
            variantQuantities[selectedVariant.id] > 0 ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'center', backgroundColor: '#fff', borderRadius: 8, borderWidth: 1.5, borderColor: '#27ae60', height: 40, minWidth: 100, paddingHorizontal: 8, marginBottom: 16 }}>
                <TouchableOpacity onPress={() => {
                  setVariantQuantities(q => {
                    if (!selectedVariant) return q;
                    const newQty = Math.max(0, (q[selectedVariant.id] || 1) - 1);
                    if (newQty === 0) {
                      removeFromCart(`${extendedProduct.id}-${selectedVariant.id}`, 'grocery');
                      const { [selectedVariant.id]: _, ...rest } = q;
                      return rest;
                    }
                    removeFromCart(`${extendedProduct.id}-${selectedVariant.id}`, 'grocery');
                    return { ...q, [selectedVariant.id]: newQty };
                  });
                }} style={{ width: 40, height: 40, justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ color: '#27ae60', fontWeight: 'bold', fontSize: 22 }}>-</Text>
                </TouchableOpacity>
                <Text style={{ width: 32, textAlign: 'center', color: '#27ae60', fontWeight: 'bold', fontSize: 20 }}>{variantQuantities[selectedVariant.id]}</Text>
                <TouchableOpacity onPress={() => {
                  setVariantQuantities(q => {
                    addToGroceryCart({ id: `${extendedProduct.id}-${selectedVariant.id}`, name: extendedProduct.name, price: selectedVariant.price, image: extendedProduct.image || '', variant: { name: selectedVariant.name, unit: selectedVariant.name.split(' ')[1].replace(/[()]/g, '') } });
                    return { ...q, [selectedVariant.id]: (q[selectedVariant.id] || 0) + 1 };
                  });
                }} style={{ width: 40, height: 40, justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ color: '#27ae60', fontWeight: 'bold', fontSize: 22 }}>+</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={{ backgroundColor: theme.colors.primary, borderRadius: 8, paddingHorizontal: 40, paddingVertical: 12, marginBottom: 16, alignSelf: 'center' }}
                onPress={() => setVariantQuantities(q => {
                  addToGroceryCart({ id: `${extendedProduct.id}-${selectedVariant.id}`, name: extendedProduct.name, price: selectedVariant.price, image: extendedProduct.image || '', variant: { name: selectedVariant.name, unit: selectedVariant.name.split(' ')[1].replace(/[()]/g, '') } });
                  return { ...q, [selectedVariant.id]: 1 };
                })}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>Add</Text>
              </TouchableOpacity>
            )
          ) : null}
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
        <View style={{ marginBottom: 18, backgroundColor: '#fff', borderRadius: 14, padding: 14, elevation: 2, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8 }}>
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
                <Text style={{ fontSize: 15, color: theme.colors.primary, fontWeight: 'bold' }}>₹{variant.price}</Text>
              </View>
              {variantQuantities[variant.id] > 0 ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 8, borderWidth: 1.5, borderColor: '#27ae60', height: 34, minWidth: 80, paddingHorizontal: 6, margin: 0, shadowColor: '#27ae60', shadowOpacity: 0.08, shadowRadius: 4 }}>
                  <TouchableOpacity onPress={() => {
                    setVariantQuantities(q => {
                      const newQty = Math.max(0, (q[variant.id] || 1) - 1);
                      if (newQty === 0) {
                        removeFromCart(`${extendedProduct.id}-${variant.id}`, 'grocery');
                        const { [variant.id]: _, ...rest } = q;
                        return rest;
                      }
                      removeFromCart(`${extendedProduct.id}-${variant.id}`, 'grocery');
                      return { ...q, [variant.id]: newQty };
                    });
                  }} style={{ width: 32, height: 32, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ color: '#27ae60', fontWeight: 'bold', fontSize: 22 }}>-</Text>
                  </TouchableOpacity>
                  <Text style={{ width: 28, textAlign: 'center', color: '#27ae60', fontWeight: 'bold', fontSize: 18 }}>{variantQuantities[variant.id]}</Text>
                  <TouchableOpacity onPress={() => {
                    setVariantQuantities(q => {
                      addToGroceryCart({ id: `${extendedProduct.id}-${variant.id}`, name: extendedProduct.name, price: variant.price, image: extendedProduct.image || '', variant: { name: variant.name, unit: variant.name.split(' ')[1].replace(/[()]/g, '') } });
                      return { ...q, [variant.id]: (q[variant.id] || 0) + 1 };
                    });
                  }} style={{ width: 32, height: 32, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ color: '#27ae60', fontWeight: 'bold', fontSize: 22 }}>+</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={{ backgroundColor: theme.colors.primary, borderRadius: 8, paddingHorizontal: 22, paddingVertical: 8, elevation: 2 }}
                  onPress={() => setVariantQuantities(q => {
                    addToGroceryCart({ id: `${extendedProduct.id}-${variant.id}`, name: extendedProduct.name, price: variant.price, image: extendedProduct.image || '', variant: { name: variant.name, unit: variant.name.split(' ')[1].replace(/[()]/g, '') } });
                    return { ...q, [variant.id]: 1 };
                  })}
                >
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Add</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      {/* Fixed Bottom Bar with Add to Cart +1/-1 counter for selected variant */}
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#fff', borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', elevation: 12, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12 }}>
        {selectedVariant && variantQuantities[selectedVariant.id] > 0 ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 6, borderWidth: 1.5, borderColor: '#27ae60', height: 40, minWidth: 100, paddingHorizontal: 8 }}>
            <TouchableOpacity onPress={() => {
              setVariantQuantities(q => {
                if (!selectedVariant) return q;
                const newQty = Math.max(0, (q[selectedVariant.id] || 1) - 1);
                if (newQty === 0) {
                  removeFromCart(`${extendedProduct.id}-${selectedVariant.id}`, 'grocery');
                  const { [selectedVariant.id]: _, ...rest } = q;
                  return rest;
                }
                removeFromCart(`${extendedProduct.id}-${selectedVariant.id}`, 'grocery');
                return { ...q, [selectedVariant.id]: newQty };
              });
            }} style={{ width: 40, height: 40, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: '#27ae60', fontWeight: 'bold', fontSize: 22 }}>-</Text>
            </TouchableOpacity>
            <Text style={{ width: 32, textAlign: 'center', color: '#27ae60', fontWeight: 'bold', fontSize: 20 }}>{variantQuantities[selectedVariant.id]}</Text>
            <TouchableOpacity onPress={() => {
              setVariantQuantities(q => {
                addToGroceryCart({ id: `${extendedProduct.id}-${selectedVariant.id}`, name: extendedProduct.name, price: selectedVariant.price, image: extendedProduct.image || '', variant: { name: selectedVariant.name, unit: selectedVariant.name.split(' ')[1].replace(/[()]/g, '') } });
                return { ...q, [selectedVariant.id]: (q[selectedVariant.id] || 0) + 1 };
              });
            }} style={{ width: 40, height: 40, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: '#27ae60', fontWeight: 'bold', fontSize: 22 }}>+</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
};

export default ProductDetailScreen;