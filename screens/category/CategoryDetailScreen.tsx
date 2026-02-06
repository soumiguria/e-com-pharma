// import React, { useState, useMemo, useEffect } from 'react';
// import { 
//   View, 
//   Text, 
//   StyleSheet, 
//   TouchableOpacity, 
//   Image,
//   FlatList,
//   ScrollView,
//   Dimensions,
//   Platform,
//   Modal,
//   Pressable,
//   Animated,
//   TextInput,
//   ActivityIndicator,
// } from 'react-native';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import { RootStackParamList } from '../../navigation/types';
// import { useTheme } from '../../contexts/ThemeContext';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import ThemedButton from '../../components/ui/ThemedButton';
// import PrescriptionRequiredTag from '../../components/ui/PrescriptionRequiredTag';
// import { useCart } from '../../contexts/CartContext';
// import { useWishlist } from '../../contexts/WishlistContext';
// import { useAppContext } from '../../contexts/AppContext';
// import { storeService } from '../../services/api/storeService';
// import { storeProductService } from '../../services/api/storeProductService';

// const { width, height } = Dimensions.get('window');
// const LEFT_COLUMN_WIDTH = 90;

// // Types

// type CategoryDetailRouteProp = RouteProp<RootStackParamList, 'CategoryDetail'>;
// type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// interface Product {
//   id: string;
//   name: string;
//   price: number;
//   originalPrice?: number;
//   image: string;
//   description?: string;
//   brand?: string;
//   variants?: { id: string; name: string; price: number; stock: number }[];
//   availableQty?: number;
//   prescriptionRequired?: boolean;
// }

// interface SubCategory {
//   id: string;
//   name: string;
//   products: Product[];
//   brands?: string[];
// }

// interface Category {
//   id: string;
//   name: string;
//   image: string;
//   subCategories: SubCategory[];
// }

// // Dummy data removed

// const priceOptions = [
//   { key: 'below_50', label: 'Below ₹50', min: 0, max: 50 },
//   { key: '50_100', label: '₹50 - ₹100', min: 50, max: 100 },
//   { key: '100_200', label: '₹100 - ₹200', min: 100, max: 200 },
//   { key: 'above_200', label: 'Above ₹200', min: 200, max: Infinity },
// ];

// const packSizeOptions = [
//   { key: 'small', label: 'Small Pack' },
//   { key: 'medium', label: 'Medium Pack' },
//   { key: 'large', label: 'Large Pack' },
// ];

// const discountOptions = [
//   { key: '10', label: '10% or more', min: 10 },
//   { key: '20', label: '20% or more', min: 20 },
//   { key: '30', label: '30% or more', min: 30 },
//   { key: '50', label: '50% or more', min: 50 },
// ];

// const CategoryDetailScreen = () => {
//   const route = useRoute<RouteProp<RootStackParamList, 'CategoryDetail'>>();
//   const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
//   const { theme, section } = useTheme();
//   const insets = useSafeAreaInsets();
//   const { addToGroceryCart, addToPharmacyCart, removeFromCart, updateQuantity, groceryItems, pharmacyItems } = useCart();
//   const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
//   const { selectedStore, lastVisitedStore, lastVisitedGroceryStore, lastVisitedPharmacyStore } = useAppContext();
//   const { category } = route.params;
  
//   // Determine if this is pharma or grocery based on current section
//   const isPharma = section === 'pharma';

//   // Get the effective store to use (selectedStore or fallback to last visited stores)
//   const effectiveStore = selectedStore || lastVisitedStore || lastVisitedGroceryStore || lastVisitedPharmacyStore;
  
//   // State for API data
//   const [apiSubCategories, setApiSubCategories] = useState<any[]>([]);
//   const [apiProducts, setApiProducts] = useState<any[]>([]);
//   const [loading, setLoading] = useState(false);
  
//   const subCategories = apiSubCategories;
  
//   // Use pre-selected subcategory if provided, otherwise set from API when loaded
//   const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<string | undefined>(category.selectedSubcategoryId);
//   const [sortBy, setSortBy] = useState<'relevance' | 'price_low_high' | 'price_high_low' | 'a_z' | 'z_a'>('relevance');

//   // Filter states
//   const [filter, setFilter] = useState<string | null>(null);
//   const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
//   const [selectedPrice, setSelectedPrice] = useState<string | null>(null);
//   const [selectedPackSizes, setSelectedPackSizes] = useState<string[]>([]);
//   const [selectedDiscount, setSelectedDiscount] = useState<string | null>(null);
//   const [selectedVariants, setSelectedVariants] = useState<{ [productId: string]: { id: string; name: string; price: number; stock: number } | undefined }>({});

//   // Fetch subcategories when component mounts
//   useEffect(() => {
//     const fetchCategoryData = async () => {
//       if (!effectiveStore?.id || !category.id) return;
      
//       setLoading(true);
//       try {
//         console.log('🔍 CategoryDetailScreen: Fetching subcategories for category:', category.id, 'section:', section);
        
//         // Fetch subcategories for this specific category only - use current section (pharma or grocery)
//         // NOTE: Backend expects categoryId in filters[categoryId] query param; pass storeId as well.
//         const subcategoriesResponse = await storeService.getCategorySubcategories(
//           category.id,
//           section as 'pharma' | 'grocery',
//           effectiveStore.id,
//         );
//         console.log('🔍 CategoryDetailScreen: Subcategories response for category', category.id, ':', JSON.stringify(subcategoriesResponse, null, 2));
        
//         if (subcategoriesResponse.success && subcategoriesResponse.data) {
//           const payload: any = subcategoriesResponse.data;
//           const subcategoriesData: any[] = Array.isArray(payload) ? payload : (Array.isArray(payload?.data) ? payload.data : []);
//           // Filter subcategories to only include those belonging to this specific category
//           const filteredSubcategories = Array.isArray(subcategoriesData) 
//             ? subcategoriesData
//                 .filter((sc: any) => sc.categoryId === category.id) // Only include subcategories for this category
//                 .map((sc: any) => ({
//                   id: sc.subcategoryId,
//                   name: sc.name,
//                   image: sc.signedImage || sc.image || undefined,
//                   products: [], // Will be fetched separately for each subcategory
//                   brands: []
//                 }))
//             : [];
          
//           setApiSubCategories(filteredSubcategories);
//           console.log('🔍 CategoryDetailScreen: Filtered subcategories for category', category.id, ':', filteredSubcategories.length);
//           if (!category.selectedSubcategoryId && !selectedSubCategoryId && filteredSubcategories.length > 0) {
//             setSelectedSubCategoryId(filteredSubcategories[0].id);
//           }
//         }
//       } catch (error) {
//         console.error('🔍 CategoryDetailScreen: Error fetching subcategories:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchCategoryData();
//   }, [effectiveStore?.id, category.id, section]);

//   // Fetch products for the selected subcategory and apply brand filters
//   useEffect(() => {
//     const fetchSubcategoryProducts = async () => {
//       if (!effectiveStore?.id || !selectedSubCategoryId) return;
      
//       setLoading(true);
//       try {
//         console.log('🔍 CategoryDetailScreen: Fetching products for subcategory:', selectedSubCategoryId, 'section:', section);
        
//         // Use section from ThemeContext to determine pharma or grocery (more reliable than category.type)
//         // Fallback to category.type or name check if section is not available
//         const isPharmaCategory = isPharma || category.type === 'pharma' || category.name?.toLowerCase().includes('medicine') || category.name?.toLowerCase().includes('pharma');
        
//         let response;
//         if (selectedBrands.length > 0) {
//           // Apply brand filter using the new API
//           const filters = { brand: selectedBrands[0] }; // Use first selected brand
//           if (isPharmaCategory) {
//             response = await storeProductService.getFilteredPharmaProducts(effectiveStore.id, filters);
//           } else {
//             response = await storeProductService.getFilteredGroceryProducts(effectiveStore.id, filters);
//           }
//         } else {
//           // Fetch all products for subcategory
//           if (isPharmaCategory) {
//             response = await storeProductService.getPharmaProductsBySubcategory(effectiveStore.id, selectedSubCategoryId);
//           } else {
//             response = await storeProductService.getGroceryProductsBySubcategory(effectiveStore.id, selectedSubCategoryId);
//           }
//         }
        
//         if (response.success && response.data) {
//           setApiProducts(response.data);
//           console.log('🔍 CategoryDetailScreen: Products fetched:', response.data.length);
//         } else {
//           setApiProducts([]);
//         }
//       } catch (error) {
//         console.error('🔍 CategoryDetailScreen: Error fetching products:', error);
//         setApiProducts([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchSubcategoryProducts();
//   }, [effectiveStore?.id, selectedSubCategoryId, selectedBrands, isPharma, section, category.type, category.name]);
//   const [showFilterModal, setShowFilterModal] = useState(false);
//   const [showSortModal, setShowSortModal] = useState(false);
//   // 1. Add state for selected filter tab and search
//   const [selectedFilterTab, setSelectedFilterTab] = useState('Brand');
//   const [brandSearch, setBrandSearch] = useState('');
//   const filterTabs = [
//     { key: 'Brand', label: 'Brand' },
//     // { key: 'Type', label: 'Type' },
//     // { key: 'Quantity', label: 'Quantity' },
//     // { key: 'DietPref', label: 'Diet Prefe..' },
//   ];

//   // Get cart quantity for a product
//   const getCartQuantity = (productId: string): number => {
//     const cartItems = isPharma ? pharmacyItems : groceryItems;
//     const existing = cartItems.find(item => item.id === productId);
//     return existing?.quantity || 0;
//   };

//   const selectedSubCategory = Array.isArray(subCategories) 
//     ? subCategories.find((sc: SubCategory) => sc.id === selectedSubCategoryId)
//     : undefined;
//   // Use only API products
//   let products: Product[] = apiProducts;
//   if (sortBy === 'price_low_high') {
//     products = [...products].sort((a: Product, b: Product) => a.price - b.price);
//   } else if (sortBy === 'price_high_low') {
//     products = [...products].sort((a: Product, b: Product) => b.price - a.price);
//   } else if (sortBy === 'a_z') {
//     products = [...products].sort((a: Product, b: Product) => a.name.localeCompare(b.name));
//   } else if (sortBy === 'z_a') {
//     products = [...products].sort((a: Product, b: Product) => b.name.localeCompare(a.name));
//   }
//   if (selectedBrands.length > 0) {
//     products = products.filter((p: Product) => p.brand && selectedBrands.includes(p.brand));
//   }
//   if (selectedPrice) {
//     const priceObj = priceOptions.find(opt => opt.key === selectedPrice);
//     if (priceObj) {
//       products = products.filter((p: Product) => p.price >= priceObj.min && p.price < priceObj.max);
//     }
//   }
//   if (selectedPackSizes.length > 0) {
//     // For demo, filter by product name containing pack size label (mock logic)
//     products = products.filter((p: Product) => selectedPackSizes.some(size => p.name.toLowerCase().includes(size)));
//   }
//   if (selectedDiscount) {
//     const discountObj = discountOptions.find(opt => opt.key === selectedDiscount);
//     if (discountObj) {
//       // For demo, assume all products have 20% discount (mock logic)
//       products = products.filter(() => 20 >= discountObj.min);
//     }
//   }

//   // Collect all brands from products in the selected subcategory
//   const allBrands = useMemo(() => {
//     const brandsSet = new Set<string>();
//     if (Array.isArray(subCategories)) {
//       subCategories.forEach((sc: SubCategory) => {
//         if (sc.products && Array.isArray(sc.products)) {
//           sc.products.forEach((p: Product) => p.brand && brandsSet.add(p.brand));
//         }
//       });
//     }
//     return Array.from(brandsSet);
//   }, [subCategories]);

//   // Sort options
//   const sortOptions = [
//     { key: 'relevance', label: 'Relevance' },
//     { key: 'price_low_high', label: 'Price: Low to High' },
//     { key: 'price_high_low', label: 'Price: High to Low' },
//     { key: 'a_z', label: 'A-Z' },
//     { key: 'z_a', label: 'Z-A' },
//   ];

//   // Clear all filters
//   const clearAllFilters = () => {
//     setSelectedBrands([]);
//     setSelectedPrice(null);
//     setSelectedPackSizes([]);
//     setSelectedDiscount(null);
//   };

//   // Helper function to validate quantity (similar to ProductCard)
//   const isValidQuantity = (value: any): boolean => {
//     if (value === null || value === undefined || value === '') return false;
//     if (typeof value === 'number') {
//       return Number.isInteger(value) && value > 0 && isFinite(value);
//     }
//     if (typeof value === 'string') {
//       const trimmed = value.trim();
//       const num = parseInt(trimmed, 10);
//       return !isNaN(num) && num > 0 && String(num) === trimmed;
//     }
//     return false;
//   };

//   // Get valid quantity for a product
//   const getValidQuantity = (product: Product): number => {
//     const qty = product.availableQty || (product as any).quantity || (product as any).stock || 0;
//     if (isValidQuantity(qty)) {
//       if (typeof qty === 'number') {
//         return qty;
//       }
//       if (typeof qty === 'string') {
//         return parseInt(qty.trim(), 10);
//       }
//     }
//     return 0;
//   };

//   // Check if product can be added to cart
//   const canAddToCart = (product: Product): boolean => {
//     const price = product.price || 0;
//     const qty = getValidQuantity(product);
//     return price > 0 && qty > 0;
//   };

//   const handleAddToCart = (product: Product, variant?: { id: string; name: string; price: number; stock: number }) => {
//     addToGroceryCart({
//       id: variant ? `${product.id}-${variant.id}` : product.id,
//       name: product.name,
//       price: variant ? variant.price : product.price,
//       image: product.image,
//       variant: variant ? { name: variant.name, unit: 'unit' } : undefined,
//       prescriptionRequired: product.prescriptionRequired || false,
//     });
//   };
//   const handleFavToggle = (product: Product) => (e: any) => {
//     e?.stopPropagation?.();
//     if (isInWishlist(product.id)) removeFromWishlist(product.id);
//     else addToWishlist({ id: product.id, name: product.name, price: product.price, image: product.image, brand: product.brand });
//   };

//   // No placeholder image - use empty string if image not present
//   const SUBCATEGORY_PLACEHOLDER_IMAGE = 'https://i.ibb.co/vCkbyTDX/Whats-App-Image-2026-01-24-at-11-14-54-PM.jpg';

//   // --- UI ---
//   return (
//     <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
//       {/* Top Bar */}
//       <View style={[styles.topBar, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}> 
//         <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
//           <MaterialCommunityIcons name="arrow-left" size={26} color={theme.colors.text} />
//         </TouchableOpacity>
//         <Text style={[styles.categoryTitle, { color: theme.colors.text }]}>{category.name || 'Category'}</Text>
//       </View>
//       {/* Horizontal Scrollable Filter/Sort Bar */}
//       <View style={{ backgroundColor: theme.colors.background, borderBottomWidth: 1, borderBottomColor: theme.colors.border }}>
//         <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 10, paddingHorizontal: 8, alignItems: 'center' }}>
//           <TouchableOpacity
//             style={[styles.filterSortBtn, { backgroundColor: showFilterModal ? theme.colors.primary : theme.colors.surface, borderColor: theme.colors.border }]}
//             onPress={() => setShowFilterModal(true)}
//           >
//             <MaterialCommunityIcons name="filter-variant" size={18} color={showFilterModal ? '#fff' : theme.colors.text} />
//             <Text style={[styles.filterSortText, { color: showFilterModal ? '#fff' : theme.colors.text }]}>Filter</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={[styles.filterSortBtn, { backgroundColor: showSortModal ? theme.colors.primary : theme.colors.surface, borderColor: theme.colors.border }]}
//             onPress={() => setShowSortModal(true)}
//           >
//             <MaterialCommunityIcons name="sort" size={18} color={showSortModal ? '#fff' : theme.colors.text} />
//             <Text style={[styles.filterSortText, { color: showSortModal ? '#fff' : theme.colors.text }]}>Sort By</Text>
//           </TouchableOpacity>
//           {allBrands.map((brand) => (
//             <TouchableOpacity
//               key={brand}
//               style={[styles.filterSortBtn, {
//                 backgroundColor: selectedBrands.includes(brand) ? theme.colors.primary : theme.colors.surface,
//                 borderColor: selectedBrands.includes(brand) ? theme.colors.primary : theme.colors.border
//               }]}
//               onPress={() => setSelectedBrands((prev) =>
//                 prev.includes(brand)
//                   ? prev.filter((b) => b !== brand)
//                   : [...prev, brand]
//               )}
//             >
//               <Text style={[styles.filterSortText, { color: selectedBrands.includes(brand) ? '#fff' : theme.colors.text }]}>{brand}</Text>
//             </TouchableOpacity>
//           ))}
//         </ScrollView>
//       </View>
//       <View style={[styles.innerRow, { backgroundColor: theme.colors.background }]}> 
//         {/* Left: Subcategories */}
//         <View style={[styles.leftColumn, { backgroundColor: theme.colors.surface, borderRightColor: theme.colors.border }]}> 
//           <FlatList
//             data={subCategories}
//             keyExtractor={item => item.id}
//             showsVerticalScrollIndicator={false}
//             renderItem={({ item }) => (
//               <TouchableOpacity
//                 style={[
//                   styles.subCategoryButton,
//                   selectedSubCategoryId === item.id && { backgroundColor: theme.colors.primary + '11', borderLeftColor: theme.colors.primary },
//                 ]}
//                 onPress={() => setSelectedSubCategoryId(item.id)}
//               >
//                 <Image
//                   source={{ uri: item.image || (item.products[0]?.image) || SUBCATEGORY_PLACEHOLDER_IMAGE }}
//                   style={styles.subCategoryImage}
//                 />
//                 <Text style={[styles.subCategoryText, { color: theme.colors.text }]}>{item.name}</Text>
//               </TouchableOpacity>
//             )}
//           />
//                     {/* Add some space at the bottom of the subcategory ending scrolllist */}
//           <View style={{ height: 40 }} />
//         </View>
//         {/* Right: Products List */}
//         {/* Here we need to show a tag on the product that require prescription should be shown on the product card as well */}
//         <View style={styles.rightSection}>
//           <FlatList
//             data={products}
//             keyExtractor={item => item.id}
//             showsVerticalScrollIndicator={true}
//             contentContainerStyle={styles.productList}
//             ListEmptyComponent={
//               loading ? (
//                 <View style={{ paddingVertical: 40, alignItems: 'center' }}>
//                   <ActivityIndicator size="large" color={theme.colors.primary} />
//                   <Text style={[styles.noProducts, { color: theme.colors.secondary, marginTop: 12 }]}>Loading...</Text>
//                 </View>
//               ) : (
//                 <Text style={[styles.noProducts, { color: theme.colors.secondary }]}>No products available</Text>
//               )
//             }
//             renderItem={({ item: product }) => {
//               const selectedVariant = selectedVariants[product.id] ?? (product.variants ? product.variants[0] : undefined);
//               const isFav = isInWishlist(product.id);
//               return (
//                 <TouchableOpacity style={[styles.productCardList, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, shadowColor: theme.colors.text }]} onPress={() => navigation.navigate('ProductDetail', { product })} activeOpacity={0.85}>
//                   <View style={styles.productImageColumn}>
//                     <Image source={{ uri: product.image }} style={styles.productImageList} />
//                     {/* <TouchableOpacity style={styles.favBtnBelowImage} onPress={handleFavToggle(product)}>
//                       <MaterialCommunityIcons name={isFav ? 'heart' : 'heart-outline'} size={22} color={isFav ? theme.colors.primary : theme.colors.secondary} />
//                     </TouchableOpacity> */}
//                   </View>
//                   <View style={styles.productInfoList}>
//                     <Text style={[styles.productName, { color: theme.colors.text }]}>{product.name}</Text>
//                     {product.brand && <Text style={[styles.productBrand, { color: theme.colors.secondary }]}>{product.brand}</Text>}
//                     <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginBottom: 4 }}>
//                       <Text style={[styles.productPrice, { color: theme.colors.primary }]}>₹{selectedVariant ? selectedVariant.price.toFixed(2) : Number(product.price || product.price || 0).toFixed(2)}</Text>
//                       {(() => {
//                         // I want to get the price of the product sp and mrp
//                         const sp = selectedVariant ? selectedVariant.price : Number(product.price || product.price || 0);
//                         const mrp = Number(product.originalPrice || 0);
                        
//                         if (mrp > sp && sp > 0) {
//                           const pct = Math.round(((mrp - sp) / mrp) * 100);
//                           return (
//                             <>
//                               <Text style={[styles.productPrice, { color: theme.colors.secondary, textDecorationLine: 'line-through', marginLeft: 8, fontSize: 13 }]}>₹{mrp.toFixed(2)}</Text>
//                               <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#27ae60', marginLeft: 6 }}>{pct}% OFF</Text>
//                             </>
//                           );
//                         }
//                         return null;
//                       })()}
//                     </View>
//                     {product.variants && (
//                       <View style={styles.productVariants}>
//                         {product.variants.map((variant: { id: string; name: string; price: number; stock: number }) => (
//                           <TouchableOpacity
//                             key={variant.id}
//                             style={[
//                               styles.variantBtn,
//                               {
//                                 backgroundColor: selectedVariant?.id === variant.id ? theme.colors.primary : theme.colors.surface,
//                                 borderColor: selectedVariant?.id === variant.id ? theme.colors.primary : theme.colors.border,
//                               },
//                             ]}
//                             onPress={() => setSelectedVariants((prev) => ({ ...prev, [product.id]: variant }))}
//                           >
//                             <Text style={{ color: selectedVariant?.id === variant.id ? '#fff' : theme.colors.text, fontSize: 13 }}>{variant.name}</Text>
//                           </TouchableOpacity>
//                         ))}
//                       </View>
//                     )}
//                     <Text style={[styles.qtyText, { color: theme.colors.primary }]}>
//                       {product.availableQty ? `In stock: ${product.availableQty}` : 'Available'}
//                     </Text>
//                     {product.prescriptionRequired && (
//                       <View style={styles.prescriptionRequiredContainer}>
//                         <PrescriptionRequiredTag compact/>
//                         <Text style={styles.prescriptionRequiredText}>Prescription Required</Text>
//                       </View>
//                     )}
//                     <View style={styles.addRowList}>
//                       <View style={styles.addButtonWrapper}>
//                         {getCartQuantity(product.id) > 0 ? (
//                           <View style={styles.counterRow}>
//                             <TouchableOpacity onPress={() => {
//                               const currentQty = getCartQuantity(product.id);
//                               const newQty = Math.max(0, currentQty - 1);
//                               const category = isPharma ? 'pharma' : 'grocery';
//                               updateQuantity(product.id, newQty, category);
//                             }} style={styles.counterBtnSmall}>
//                               <Text style={styles.counterBtnTextSmall}>-</Text>
//                             </TouchableOpacity>
//                             <Text style={styles.counterValueSmall}>{getCartQuantity(product.id)}</Text>
//                             <TouchableOpacity 
//                               onPress={() => {
//                                 const currentQty = getCartQuantity(product.id);
//                                 const availableQty = getValidQuantity(product);
//                                 const category = isPharma ? 'pharma' : 'grocery';
//                                 if (currentQty < availableQty) {
//                                   const cartItems = isPharma ? pharmacyItems : groceryItems;
//                                   const existing = cartItems.find(item => item.id === product.id);
//                                   if (existing) updateQuantity(product.id, currentQty + 1, category);
//                                   else if (isPharma) addToPharmacyCart({ id: product.id, name: product.name, price: product.price, image: product.image, productId: (product as any).productId || product.id, prescriptionRequired: product.prescriptionRequired || false, });
//                                   else addToGroceryCart({ id: product.id, name: product.name, price: product.price, image: product.image, productId: (product as any).productId || product.id });
//                                 }
//                               }}
//                               style={[styles.counterBtnSmall, getCartQuantity(product.id) >= getValidQuantity(product) && { opacity: 0.5 }]}
//                               disabled={getCartQuantity(product.id) >= getValidQuantity(product)}
//                             >
//                               <Text style={styles.counterBtnTextSmall}>+</Text>
//                             </TouchableOpacity>
//                           </View>
//                         ) : (
//                           <TouchableOpacity
//                             style={[
//                               styles.addBtn, 
//                               { 
//                                 backgroundColor: canAddToCart(product) ? theme.colors.primary : '#dc3545',
//                                 shadowColor: canAddToCart(product) ? theme.colors.primary : '#dc3545',
//                                 opacity: canAddToCart(product) ? 1 : 0.7
//                               }
//                             ]}
//                             onPress={() => {
//                               if (!canAddToCart(product)) return;
//                               const category = isPharma ? 'pharma' : 'grocery';
//                               if (isPharma) addToPharmacyCart({ id: product.id, name: product.name, price: product.price, image: product.image, productId: (product as any).productId || product.id });
//                               else addToGroceryCart({ id: product.id, name: product.name, price: product.price, image: product.image, productId: (product as any).productId || product.id });
//                             }}
//                             disabled={!canAddToCart(product)}
//                           >
//                             <Text style={styles.addBtnText}>{canAddToCart(product) ? 'ADD' : 'OUT OF STOCK'}</Text>
//                           </TouchableOpacity>
//                         )}
//                       </View>
//                     </View>
//                   </View>
//                 </TouchableOpacity>
//               );
//             }}
//           />
//         </View>
//       </View>
//       {/* Filter Modal Sheet */}
//       <Modal
//         visible={showFilterModal}
//         transparent
//         animationType="slide"
//         onRequestClose={() => setShowFilterModal(false)}
//       >
//         <Pressable style={{ flex: 1, backgroundColor: theme.colors.text + '55' }} onPress={() => setShowFilterModal(false)} />
//         <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#fff', borderTopLeftRadius: 18, borderTopRightRadius: 18, minHeight: 480, maxHeight: height * 0.85 }}>
//           {/* Top Bar */}
//           <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' }}>
//             <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#222' }}>Filters</Text>
//             <TouchableOpacity onPress={() => setShowFilterModal(false)}>
//               <MaterialCommunityIcons name="close" size={24} color="#222" />
//             </TouchableOpacity>
//           </View>
//           <View style={{ flexDirection: 'row', flex: 1 }}>
//             {/* Left: Tabs */}
//             <View style={{ width: 110, backgroundColor: '#F8F8F8', borderRightWidth: 1, borderRightColor: '#eee', paddingVertical: 8 }}>
//               {filterTabs.map(tab => (
//                 <TouchableOpacity
//                   key={tab.key}
//                   style={{ paddingVertical: 14, paddingHorizontal: 10, backgroundColor: selectedFilterTab === tab.key ? '#fff' : 'transparent', borderLeftWidth: 3, borderLeftColor: selectedFilterTab === tab.key ? '#1A7B50' : 'transparent' }}
//                   onPress={() => setSelectedFilterTab(tab.key)}
//                 >
//                   <Text style={{ color: selectedFilterTab === tab.key ? '#1A7B50' : '#222', fontWeight: selectedFilterTab === tab.key ? 'bold' : 'normal', fontSize: 15 }}>{tab.label}</Text>
//                 </TouchableOpacity>
//               ))}
//             </View>
//             {/* Right: Filter Options */}
//             <View style={{ flex: 1, padding: 16 }}>
//               {selectedFilterTab === 'Brand' && (
//                 <>
//                   <View style={{ backgroundColor: '#F4F4F4', borderRadius: 8, flexDirection: 'row', alignItems: 'center', marginBottom: 12, paddingHorizontal: 12, width: '100%' }}>
//                     <MaterialCommunityIcons name="magnify" size={20} color="#888" />
//                     <TextInput
//                       style={{ flex: 1, height: 40, fontSize: 16, marginLeft: 8, paddingHorizontal: 4 }}
//                       placeholder="Search brands..."
//                       placeholderTextColor="#aaa"
//                       value={brandSearch}
//                       onChangeText={setBrandSearch}
//                     />
//                   </View>
//                   <ScrollView style={{ maxHeight: 260 }}>
//                     {allBrands.filter(b => b.toLowerCase().includes(brandSearch.toLowerCase())).map((brand) => (
//                       <TouchableOpacity
//                         key={brand}
//                         style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10 }}
//                         onPress={() => {
//                           setSelectedBrands((prev) =>
//                             prev.includes(brand)
//                               ? prev.filter((b) => b !== brand)
//                               : [...prev, brand]
//                           );
//                         }}
//                       >
//                         <MaterialCommunityIcons
//                           name={selectedBrands.includes(brand) ? 'checkbox-marked' : 'checkbox-blank-outline'}
//                           size={22}
//                           color={selectedBrands.includes(brand) ? '#1A7B50' : '#888'}
//                           style={{ marginRight: 12 }}
//                         />
//                         <Text style={{ color: '#222', fontSize: 15 }}>{brand}</Text>
//                       </TouchableOpacity>
//                     ))}
//                   </ScrollView>
//                 </>
//               )}
//               {/* Add similar blocks for other tabs (Type, AtteType, Quantity, DietPref) as needed */}
//             </View>
//           </View>
//           {/* Bottom Buttons */}
//           <View style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#eee', padding: 12, backgroundColor: '#fff', paddingBottom: 20 + insets.bottom, }}>
//             <TouchableOpacity style={{ flex: 1, backgroundColor: '#F4F4F4', borderRadius: 8, paddingVertical: 12, alignItems: 'center', marginRight: 8 }} onPress={clearAllFilters}>
//               <Text style={{ color: '#888', fontWeight: 'bold', fontSize: 15 }}>Clear filters</Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={{ flex: 1, backgroundColor: '#1A7B50', borderRadius: 8, paddingVertical: 12, alignItems: 'center' }} onPress={() => setShowFilterModal(false)}>
//               <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 15 }}>Apply</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>
//       {/* Sort Modal Sheet */}
//       <Modal
//         visible={showSortModal}
//         transparent
//         animationType="slide"
//         onRequestClose={() => setShowSortModal(false)}
//       >
//         <Pressable style={{ flex: 1, backgroundColor: theme.colors.text + '55' }} onPress={() => setShowSortModal(false)} />
//         <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: theme.colors.surface, borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: 24, minHeight: 220, paddingBottom: 20 + insets.bottom }}>
//           <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
//             <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.text }}>Sort By</Text>
//             <TouchableOpacity onPress={() => setShowSortModal(false)}>
//               <MaterialCommunityIcons name="close" size={26} color={theme.colors.text} />
//             </TouchableOpacity>
//           </View>
//           {sortOptions.map((option) => (
//             <TouchableOpacity
//               key={option.key}
//               style={{
//                 flexDirection: 'row',
//                 alignItems: 'center',
//                 paddingVertical: 14,
//                 borderBottomWidth: 1,
//                 borderBottomColor: theme.colors.border,
//               }}
//               onPress={() => {
//                 setSortBy(option.key as any);
//                 setShowSortModal(false);
//               }}
//             >
//               <MaterialCommunityIcons
//                 name={sortBy === option.key ? 'check-circle' : 'circle-outline'}
//                 size={22}
//                 color={sortBy === option.key ? theme.colors.primary : theme.colors.text}
//                 style={{ marginRight: 12 }}
//               />
//               <Text style={{ color: theme.colors.text, fontWeight: sortBy === option.key ? 'bold' : 'normal', fontSize: 16 }}>{option.label}</Text>
//             </TouchableOpacity>
//           ))}
//         </View>
//       </Modal>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   topBar: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     padding: 16,
//     backgroundColor: '#fff',
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//   },
//   categoryTitle: {
//     fontWeight: 'bold',
//     fontSize: 20,
//     color: '#222',
//     flex: 1,
//   },
//   filterSortRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 10,
//     marginLeft: 10,
//   },
//   filterSortBtn: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#f7f7f7',
//     borderRadius: 16,
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     marginRight: 8,
//     borderWidth: 1,
//     borderColor: '#eee',
//   },
//   filterSortText: {
//     marginLeft: 6,
//     fontSize: 14,
//     color: '#222',
//   },
//   backBtn: {
//     marginRight: 10,
//     padding: 4,
//   },
//   innerRow: {
//     flex: 1,
//     flexDirection: 'row',
//     backgroundColor: '#f7f7f7',
//   },
//   leftColumn: {
//     width: LEFT_COLUMN_WIDTH,
//     backgroundColor: '#fff',
//     borderRightWidth: 1,
//     borderRightColor: '#eee',
//     paddingTop: 8,
//     paddingBottom: 8,
//   },
//   subCategoryButton: {
//     width: '100%',
//     alignItems: 'center',
//     borderRadius: 12,
//     marginBottom: 8,
//     backgroundColor: 'transparent',
//     justifyContent: 'center',
//     borderLeftWidth: 4,
//     borderLeftColor: 'transparent',
//     paddingVertical: 10,
//   },
//   subCategoryButtonActive: {
//     backgroundColor: '#f0f6ff',
//     borderLeftColor: '#00b14f',
//   },
//   subCategoryImage: {
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     marginBottom: 4,
//     backgroundColor: '#f0f0f0',
//     borderWidth: 1,
//     borderColor: '#eee',
//     resizeMode: 'cover',
//   },
//   subCategoryText: {
//     fontSize: 12,
//     color: '#222',
//     textAlign: 'center',
//     fontWeight: '600',
//     maxWidth: 60,
//   },
//   rightSection: {
//     flex: 1,
//     padding: 10,
//   },
//   productList: {
//     paddingBottom: 30,
//   },
//   productCardList: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//     backgroundColor: '#fff',
//     borderRadius: 14,
//     marginVertical: 7,
//     marginHorizontal: 2,
//     padding: 12,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.07,
//     shadowRadius: 6,
//     elevation: 2,
//     borderWidth: 1,
//     borderColor: '#f2f2f2',
//     position: 'relative',
//     overflow: 'hidden',
//   },
//   productImageColumn: {
//     marginRight: 12,
//     alignItems: 'center',
//   },
//   productImageList: {
//     width: 80,
//     height: 80,
//     borderRadius: 10,
//     marginBottom: 6,
//     backgroundColor: '#f0f0f0',
//   },
//   favBtnBelowImage: {
//     width: 38,
//     height: 38,
//     borderRadius: 19,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0,0,0,0.04)',
//   },
//   productInfoList: {
//     flex: 1,
//     justifyContent: 'center',
//   },
//   productName: {
//     fontSize: 15,
//     fontWeight: '700',
//     color: '#222',
//     marginBottom: 2,
//   },
//   productBrand: {
//     fontSize: 12,
//     color: '#888',
//     marginBottom: 2,
//   },
//   productPrice: {
//     fontSize: 15,
//     fontWeight: 'bold',
//     color: '#00b14f',
//     marginBottom: 4,
//   },
//   productVariants: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     marginBottom: 4,
//     gap: 6,
//   },
//   variantBtn: {
//     borderWidth: 1,
//     borderColor: '#eee',
//     borderRadius: 8,
//     paddingHorizontal: 8,
//     paddingVertical: 2,
//     marginRight: 6,
//     marginBottom: 4,
//     backgroundColor: '#f7f7f7',
//   },
//   selectedVariantBtn: {
//     borderColor: '#00b14f',
//     backgroundColor: '#00b14f11',
//   },
//   qtyText: {
//     fontSize: 12,
//     color: '#888',
//     marginLeft: 8,
//     marginBottom: 8,
//   },
//   prescriptionRequiredContainer: {
//     backgroundColor: '#ffe5e5',
//     paddingVertical: 4,
//     paddingHorizontal: 6,
//     borderRadius: 6,
//     alignSelf: 'flex-start',
//     marginBottom: 6,
//   },
//   prescriptionRequiredText: {
//     color: '#d9534f',
//     fontSize: 12,
//     fontWeight: '600',
//   },
//   addButtonWrapper: {
//     flex: 1,
//     minWidth: 0,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   counterRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//     borderRadius: 10,
//     borderWidth: 1.5,
//     borderColor: '#27ae60',
//     height: 42,
//     minWidth: 88,
//     paddingHorizontal: 8,
//   },
//   counterBtnSmall: {
//     width: 34,
//     height: 34,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   counterBtnTextSmall: {
//     color: '#27ae60',
//     fontWeight: 'bold',
//     fontSize: 20,
//   },
//   counterValueSmall: {
//     width: 28,
//     textAlign: 'center',
//     color: '#27ae60',
//     fontWeight: 'bold',
//     fontSize: 17,
//   },
//   favBtn: {
//     marginLeft: 8,
//     width: 38,
//     height: 38,
//     borderRadius: 19,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0,0,0,0.04)',
//   },
//   noProducts: {
//     color: '#888',
//     textAlign: 'center',
//     marginTop: 40,
//     fontSize: 15,
//   },
//   addRowList: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 8,
//     gap: 8,
//     flexWrap: 'nowrap',
//   },
//   addBtn: {
//     flex: 1,
//     maxWidth: '100%',
//     backgroundColor: '#00b14f',
//     borderRadius: 10,
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     alignItems: 'center',
//     justifyContent: 'center',
//     minHeight: 44,
//     shadowColor: '#00b14f',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.08,
//     shadowRadius: 4,
//     elevation: 1,
//   },
//   addBtnText: {
//     color: '#fff',
//     fontWeight: 'bold',
//     fontSize: 13,
//     letterSpacing: 0.2,
//   },
// });

// export default CategoryDetailScreen; 



import React, { useState, useMemo, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image,
  FlatList,
  ScrollView,
  Dimensions,
  Platform,
  Modal,
  Pressable,
  Animated,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useTheme } from '../../contexts/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ThemedButton from '../../components/ui/ThemedButton';
import PrescriptionRequiredTag from '../../components/ui/PrescriptionRequiredTag';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useAppContext } from '../../contexts/AppContext';
import { storeService } from '../../services/api/storeService';
import { storeProductService } from '../../services/api/storeProductService';

const { width, height } = Dimensions.get('window');
const LEFT_COLUMN_WIDTH = 90;

// Types

type CategoryDetailRouteProp = RouteProp<RootStackParamList, 'CategoryDetail'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  description?: string;
  brand?: string;
  variants?: { id: string; name: string; price: number; stock: number }[];
  availableQty?: number;
  prescriptionRequired?: boolean;
}

interface SubCategory {
  id: string;
  name: string;
  products: Product[];
  brands?: string[];
}

interface Category {
  id: string;
  name: string;
  image: string;
  subCategories: SubCategory[];
}

// Dummy data removed

const priceOptions = [
  { key: 'below_50', label: 'Below ₹50', min: 0, max: 50 },
  { key: '50_100', label: '₹50 - ₹100', min: 50, max: 100 },
  { key: '100_200', label: '₹100 - ₹200', min: 100, max: 200 },
  { key: 'above_200', label: 'Above ₹200', min: 200, max: Infinity },
];

const packSizeOptions = [
  { key: 'small', label: 'Small Pack' },
  { key: 'medium', label: 'Medium Pack' },
  { key: 'large', label: 'Large Pack' },
];

const discountOptions = [
  { key: '10', label: '10% or more', min: 10 },
  { key: '20', label: '20% or more', min: 20 },
  { key: '30', label: '30% or more', min: 30 },
  { key: '50', label: '50% or more', min: 50 },
];

const CategoryDetailScreen = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'CategoryDetail'>>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { theme, section } = useTheme();
  const insets = useSafeAreaInsets();
  const { addToGroceryCart, addToPharmacyCart, removeFromCart, updateQuantity, groceryItems, pharmacyItems } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { selectedStore, lastVisitedStore, lastVisitedGroceryStore, lastVisitedPharmacyStore } = useAppContext();
  const { category } = route.params;
  
  // Determine if this is pharma or grocery based on current section
  const isPharma = section === 'pharma';

  // Get the effective store to use (selectedStore or fallback to last visited stores)
  const effectiveStore = selectedStore || lastVisitedStore || lastVisitedGroceryStore || lastVisitedPharmacyStore;
  
  // State for API data
  const [apiSubCategories, setApiSubCategories] = useState<any[]>([]);
  const [apiProducts, setApiProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const subCategories = apiSubCategories;
  
  // Use pre-selected subcategory if provided, otherwise set from API when loaded
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<string | undefined>(category.selectedSubcategoryId);
  const [sortBy, setSortBy] = useState<'relevance' | 'price_low_high' | 'price_high_low' | 'a_z' | 'z_a'>('relevance');

  // Filter states
  const [filter, setFilter] = useState<string | null>(null);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedPrice, setSelectedPrice] = useState<string | null>(null);
  const [selectedPackSizes, setSelectedPackSizes] = useState<string[]>([]);
  const [selectedDiscount, setSelectedDiscount] = useState<string | null>(null);
  const [selectedVariants, setSelectedVariants] = useState<{ [productId: string]: { id: string; name: string; price: number; stock: number } | undefined }>({});

  // Fetch subcategories when component mounts
  useEffect(() => {
    const fetchCategoryData = async () => {
      if (!effectiveStore?.id || !category.id) return;
      
      setLoading(true);
      try {
        console.log('🔍 CategoryDetailScreen: Fetching subcategories for category:', category.id, 'section:', section);
        
        // Fetch subcategories for this specific category only - use current section (pharma or grocery)
        // NOTE: Backend expects categoryId in filters[categoryId] query param; pass storeId as well.
        const subcategoriesResponse = await storeService.getCategorySubcategories(
          category.id,
          section as 'pharma' | 'grocery',
          effectiveStore.id,
        );
        console.log('🔍 CategoryDetailScreen: Subcategories response for category', category.id, ':', JSON.stringify(subcategoriesResponse, null, 2));
        
        if (subcategoriesResponse.success && subcategoriesResponse.data) {
          const payload: any = subcategoriesResponse.data;
          const subcategoriesData: any[] = Array.isArray(payload) ? payload : (Array.isArray(payload?.data) ? payload.data : []);
          // Filter subcategories to only include those belonging to this specific category
          const filteredSubcategories = Array.isArray(subcategoriesData) 
            ? subcategoriesData
                .filter((sc: any) => sc.categoryId === category.id) // Only include subcategories for this category
                .map((sc: any) => ({
                  id: sc.subcategoryId,
                  name: sc.name,
                  image: sc.signedImage || sc.image || undefined,
                  products: [], // Will be fetched separately for each subcategory
                  brands: []
                }))
            : [];
          
          setApiSubCategories(filteredSubcategories);
          console.log('🔍 CategoryDetailScreen: Filtered subcategories for category', category.id, ':', filteredSubcategories.length);
          if (!category.selectedSubcategoryId && !selectedSubCategoryId && filteredSubcategories.length > 0) {
            setSelectedSubCategoryId(filteredSubcategories[0].id);
          }
        }
      } catch (error) {
        console.error('🔍 CategoryDetailScreen: Error fetching subcategories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryData();
  }, [effectiveStore?.id, category.id, section]);

  // Fetch products for the selected subcategory and apply brand filters
  useEffect(() => {
    const fetchSubcategoryProducts = async () => {
      if (!effectiveStore?.id || !selectedSubCategoryId) return;
      
      setLoading(true);
      try {
        console.log('🔍 CategoryDetailScreen: Fetching products for subcategory:', selectedSubCategoryId, 'section:', section);
        
        // Use section from ThemeContext to determine pharma or grocery (more reliable than category.type)
        // Fallback to category.type or name check if section is not available
        const isPharmaCategory = isPharma || category.type === 'pharma' || category.name?.toLowerCase().includes('medicine') || category.name?.toLowerCase().includes('pharma');
        
        let response;
        if (selectedBrands.length > 0) {
          // Apply brand filter using the new API
          const filters = { brand: selectedBrands[0] }; // Use first selected brand
          if (isPharmaCategory) {
            response = await storeProductService.getFilteredPharmaProducts(effectiveStore.id, filters);
          } else {
            response = await storeProductService.getFilteredGroceryProducts(effectiveStore.id, filters);
          }
        } else {
          // Fetch all products for subcategory
          if (isPharmaCategory) {
            response = await storeProductService.getPharmaProductsBySubcategory(effectiveStore.id, selectedSubCategoryId);
          } else {
            response = await storeProductService.getGroceryProductsBySubcategory(effectiveStore.id, selectedSubCategoryId);
          }
        }
        
        if (response.success && response.data) {
          setApiProducts(response.data);
          console.log('🔍 CategoryDetailScreen: Products fetched:', response.data.length);
        } else {
          setApiProducts([]);
        }
      } catch (error) {
        console.error('🔍 CategoryDetailScreen: Error fetching products:', error);
        setApiProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubcategoryProducts();
  }, [effectiveStore?.id, selectedSubCategoryId, selectedBrands, isPharma, section, category.type, category.name]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  // 1. Add state for selected filter tab and search
  const [selectedFilterTab, setSelectedFilterTab] = useState('Brand');
  const [brandSearch, setBrandSearch] = useState('');
  const filterTabs = [
    { key: 'Brand', label: 'Brand' },
    // { key: 'Type', label: 'Type' },
    // { key: 'Quantity', label: 'Quantity' },
    // { key: 'DietPref', label: 'Diet Prefe..' },
  ];

  // Get cart quantity for a product
  const getCartQuantity = (productId: string): number => {
    const cartItems = isPharma ? pharmacyItems : groceryItems;
    const existing = cartItems.find(item => item.id === productId);
    return existing?.quantity || 0;
  };

  const selectedSubCategory = Array.isArray(subCategories) 
    ? subCategories.find((sc: SubCategory) => sc.id === selectedSubCategoryId)
    : undefined;
  // Use only API products
  let products: Product[] = apiProducts;
  if (sortBy === 'price_low_high') {
    products = [...products].sort((a: Product, b: Product) => a.price - b.price);
  } else if (sortBy === 'price_high_low') {
    products = [...products].sort((a: Product, b: Product) => b.price - a.price);
  } else if (sortBy === 'a_z') {
    products = [...products].sort((a: Product, b: Product) => a.name.localeCompare(b.name));
  } else if (sortBy === 'z_a') {
    products = [...products].sort((a: Product, b: Product) => b.name.localeCompare(a.name));
  }
  if (selectedBrands.length > 0) {
    products = products.filter((p: Product) => p.brand && selectedBrands.includes(p.brand));
  }
  if (selectedPrice) {
    const priceObj = priceOptions.find(opt => opt.key === selectedPrice);
    if (priceObj) {
      products = products.filter((p: Product) => p.price >= priceObj.min && p.price < priceObj.max);
    }
  }
  if (selectedPackSizes.length > 0) {
    // For demo, filter by product name containing pack size label (mock logic)
    products = products.filter((p: Product) => selectedPackSizes.some(size => p.name.toLowerCase().includes(size)));
  }
  if (selectedDiscount) {
    const discountObj = discountOptions.find(opt => opt.key === selectedDiscount);
    if (discountObj) {
      // For demo, assume all products have 20% discount (mock logic)
      products = products.filter(() => 20 >= discountObj.min);
    }
  }

  // Collect all brands from products in the selected subcategory
  const allBrands = useMemo(() => {
    const brandsSet = new Set<string>();
    if (Array.isArray(subCategories)) {
      subCategories.forEach((sc: SubCategory) => {
        if (sc.products && Array.isArray(sc.products)) {
          sc.products.forEach((p: Product) => p.brand && brandsSet.add(p.brand));
        }
      });
    }
    return Array.from(brandsSet);
  }, [subCategories]);

  // Sort options
  const sortOptions = [
    { key: 'relevance', label: 'Relevance' },
    { key: 'price_low_high', label: 'Price: Low to High' },
    { key: 'price_high_low', label: 'Price: High to Low' },
    { key: 'a_z', label: 'A-Z' },
    { key: 'z_a', label: 'Z-A' },
  ];

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedBrands([]);
    setSelectedPrice(null);
    setSelectedPackSizes([]);
    setSelectedDiscount(null);
  };

  // Helper function to validate quantity (similar to ProductCard)
  const isValidQuantity = (value: any): boolean => {
    if (value === null || value === undefined || value === '') return false;
    if (typeof value === 'number') {
      return Number.isInteger(value) && value > 0 && isFinite(value);
    }
    if (typeof value === 'string') {
      const trimmed = value.trim();
      const num = parseInt(trimmed, 10);
      return !isNaN(num) && num > 0 && String(num) === trimmed;
    }
    return false;
  };

  // Get valid quantity for a product
  const getValidQuantity = (product: Product): number => {
    const qty = product.availableQty || (product as any).quantity || (product as any).stock || 0;
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
  const canAddToCart = (product: Product): boolean => {
    const price = product.price || 0;
    const qty = getValidQuantity(product);
    return price > 0 && qty > 0;
  };

  const handleAddToCart = (product: Product, variant?: { id: string; name: string; price: number; stock: number }) => {
    addToGroceryCart({
      id: variant ? `${product.id}-${variant.id}` : product.id,
      name: product.name,
      price: variant ? variant.price : product.price,
      image: product.image,
      variant: variant ? { name: variant.name, unit: 'unit' } : undefined,
      prescriptionRequired: product.prescriptionRequired || false,
    });
  };
  const handleFavToggle = (product: Product) => (e: any) => {
    e?.stopPropagation?.();
    if (isInWishlist(product.id)) removeFromWishlist(product.id);
    else addToWishlist({ id: product.id, name: product.name, price: product.price, image: product.image, brand: product.brand });
  };

  // No placeholder image - use empty string if image not present
  const SUBCATEGORY_PLACEHOLDER_IMAGE = 'https://i.ibb.co/vCkbyTDX/Whats-App-Image-2026-01-24-at-11-14-54-PM.jpg';

  // --- UI ---
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      {/* Top Bar */}
      <View style={[styles.topBar, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}> 
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={26} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.categoryTitle, { color: theme.colors.text }]}>{category.name || 'Category'}</Text>
      </View>
      {/* Horizontal Scrollable Filter/Sort Bar */}
      <View style={{ backgroundColor: theme.colors.background, borderBottomWidth: 1, borderBottomColor: theme.colors.border }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 10, paddingHorizontal: 8, alignItems: 'center' }}>
          <TouchableOpacity
            style={[styles.filterSortBtn, { backgroundColor: showFilterModal ? theme.colors.primary : theme.colors.surface, borderColor: theme.colors.border }]}
            onPress={() => setShowFilterModal(true)}
          >
            <MaterialCommunityIcons name="filter-variant" size={18} color={showFilterModal ? '#fff' : theme.colors.text} />
            <Text style={[styles.filterSortText, { color: showFilterModal ? '#fff' : theme.colors.text }]}>Filter</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterSortBtn, { backgroundColor: showSortModal ? theme.colors.primary : theme.colors.surface, borderColor: theme.colors.border }]}
            onPress={() => setShowSortModal(true)}
          >
            <MaterialCommunityIcons name="sort" size={18} color={showSortModal ? '#fff' : theme.colors.text} />
            <Text style={[styles.filterSortText, { color: showSortModal ? '#fff' : theme.colors.text }]}>Sort By</Text>
          </TouchableOpacity>
          {allBrands.map((brand) => (
            <TouchableOpacity
              key={brand}
              style={[styles.filterSortBtn, {
                backgroundColor: selectedBrands.includes(brand) ? theme.colors.primary : theme.colors.surface,
                borderColor: selectedBrands.includes(brand) ? theme.colors.primary : theme.colors.border
              }]}
              onPress={() => setSelectedBrands((prev) =>
                prev.includes(brand)
                  ? prev.filter((b) => b !== brand)
                  : [...prev, brand]
              )}
            >
              <Text style={[styles.filterSortText, { color: selectedBrands.includes(brand) ? '#fff' : theme.colors.text }]}>{brand}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <View style={[styles.innerRow, { backgroundColor: theme.colors.background }]}> 
        {/* Left: Subcategories */}
        <View style={[styles.leftColumn, { backgroundColor: theme.colors.surface, borderRightColor: theme.colors.border }]}> 
          <FlatList
            data={subCategories}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.subCategoryButton,
                  selectedSubCategoryId === item.id && { backgroundColor: theme.colors.primary + '11', borderLeftColor: theme.colors.primary },
                ]}
                onPress={() => setSelectedSubCategoryId(item.id)}
              >
                <Image
                  source={{ uri: item.image || (item.products[0]?.image) || SUBCATEGORY_PLACEHOLDER_IMAGE }}
                  style={styles.subCategoryImage}
                />
                <Text style={[styles.subCategoryText, { color: theme.colors.text }]}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
                    {/* Add some space at the bottom of the subcategory ending scrolllist */}
          <View style={{ height: 40 }} />
        </View>
        {/* Right: Products List */}
        {/* Here we need to show a tag on the product that require prescription should be shown on the product card as well */}
        <View style={styles.rightSection}>
          <FlatList
            data={products}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={styles.productList}
            ListEmptyComponent={
              loading ? (
                <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                  <ActivityIndicator size="large" color={theme.colors.primary} />
                  <Text style={[styles.noProducts, { color: theme.colors.secondary, marginTop: 12 }]}>Loading...</Text>
                </View>
              ) : (
                <Text style={[styles.noProducts, { color: theme.colors.secondary }]}>No products available</Text>
              )
            }
            renderItem={({ item: product }) => {
              const selectedVariant = selectedVariants[product.id] ?? (product.variants ? product.variants[0] : undefined);
              const isFav = isInWishlist(product.id);
              return (
                <TouchableOpacity style={[styles.productCardList, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, shadowColor: theme.colors.text }]} onPress={() => navigation.navigate('ProductDetail', { product })} activeOpacity={0.85}>
                  <View style={styles.productImageColumn}>
                    <Image source={{ uri: product.image }} style={styles.productImageList} />
                    {/* <TouchableOpacity style={styles.favBtnBelowImage} onPress={handleFavToggle(product)}>
                      <MaterialCommunityIcons name={isFav ? 'heart' : 'heart-outline'} size={22} color={isFav ? theme.colors.primary : theme.colors.secondary} />
                    </TouchableOpacity> */}
                  </View>
                  <View style={styles.productInfoList}>
                    <Text style={[styles.productName, { color: theme.colors.text }]}>{product.name}</Text>
                    {product.brand && <Text style={[styles.productBrand, { color: theme.colors.secondary }]}>{product.brand}</Text>}
                    <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginBottom: 4 }}>
                      <Text style={[styles.productPrice, { color: theme.colors.primary }]}>₹{selectedVariant ? selectedVariant.price.toFixed(2) : Number(product.price || product.price || 0).toFixed(2)}</Text>
                      {(() => {
                        // I want to get the price of the product sp and mrp
                        const sp = selectedVariant ? selectedVariant.price : Number(product.price || product.price || 0);
                        const mrp = Number(product.originalPrice || 0);
                        
                        if (mrp > sp && sp > 0) {
                          const pct = Math.round(((mrp - sp) / mrp) * 100);
                          return (
                            <>
                              <Text style={[styles.productPrice, { color: theme.colors.secondary, textDecorationLine: 'line-through', marginLeft: 8, fontSize: 13 }]}>₹{mrp.toFixed(2)}</Text>
                              <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#27ae60', marginLeft: 6 }}>{pct}% OFF</Text>
                            </>
                          );
                        }
                        return null;
                      })()}
                    </View>
                    {product.variants && (
                      <View style={styles.productVariants}>
                        {product.variants.map((variant: { id: string; name: string; price: number; stock: number }) => (
                          <TouchableOpacity
                            key={variant.id}
                            style={[
                              styles.variantBtn,
                              {
                                backgroundColor: selectedVariant?.id === variant.id ? theme.colors.primary : theme.colors.surface,
                                borderColor: selectedVariant?.id === variant.id ? theme.colors.primary : theme.colors.border,
                              },
                            ]}
                            onPress={() => setSelectedVariants((prev) => ({ ...prev, [product.id]: variant }))}
                          >
                            <Text style={{ color: selectedVariant?.id === variant.id ? '#fff' : theme.colors.text, fontSize: 13 }}>{variant.name}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                    <Text style={[styles.qtyText, { color: theme.colors.primary }]}>
                      {product.availableQty ? `In stock: ${product.availableQty}` : 'Available'}
                    </Text>
                    {product.prescriptionRequired && (
                      <View style={styles.prescriptionRequiredContainer}>
                        <PrescriptionRequiredTag compact/>
                        <Text style={styles.prescriptionRequiredText}>Prescription Required</Text>
                      </View>
                    )}
                    <View style={styles.addRowList}>
                      <View style={styles.addButtonWrapper}>
                        {getCartQuantity(product.id) > 0 ? (
                          <View style={styles.counterRow}>
                            <TouchableOpacity onPress={() => {
                              const currentQty = getCartQuantity(product.id);
                              const newQty = Math.max(0, currentQty - 1);
                              const category = isPharma ? 'pharma' : 'grocery';
                              updateQuantity(product.id, newQty, category);
                            }} style={styles.counterBtnSmall}>
                              <Text style={styles.counterBtnTextSmall}>-</Text>
                            </TouchableOpacity>
                            <Text style={styles.counterValueSmall}>{getCartQuantity(product.id)}</Text>
                            <TouchableOpacity 
                              onPress={() => {
                                const currentQty = getCartQuantity(product.id);
                                const availableQty = getValidQuantity(product);
                                const category = isPharma ? 'pharma' : 'grocery';
                                if (currentQty < availableQty) {
                                  const cartItems = isPharma ? pharmacyItems : groceryItems;
                                  const existing = cartItems.find(item => item.id === product.id);
                                  if (existing) updateQuantity(product.id, currentQty + 1, category);
                                  else if (isPharma) addToPharmacyCart({ id: product.id, name: product.name, price: product.price, image: product.image, productId: (product as any).productId || product.id, prescriptionRequired: product.prescriptionRequired || false, });
                                  else addToGroceryCart({ id: product.id, name: product.name, price: product.price, image: product.image, productId: (product as any).productId || product.id, prescriptionRequired: product.prescriptionRequired || false, });
                                }
                              }}
                              style={[styles.counterBtnSmall, getCartQuantity(product.id) >= getValidQuantity(product) && { opacity: 0.5 }]}
                              disabled={getCartQuantity(product.id) >= getValidQuantity(product)}
                            >
                              <Text style={styles.counterBtnTextSmall}>+</Text>
                            </TouchableOpacity>
                          </View>
                        ) : (
                          <TouchableOpacity
                            style={[
                              styles.addBtn, 
                              { 
                                backgroundColor: canAddToCart(product) ? theme.colors.primary : '#dc3545',
                                shadowColor: canAddToCart(product) ? theme.colors.primary : '#dc3545',
                                opacity: canAddToCart(product) ? 1 : 0.7
                              }
                            ]}
                            onPress={() => {
                              if (!canAddToCart(product)) return;
                              const category = isPharma ? 'pharma' : 'grocery';
                              if (isPharma) addToPharmacyCart({ id: product.id, name: product.name, price: product.price, image: product.image, productId: (product as any).productId || product.id, prescriptionRequired: product.prescriptionRequired || false, });
                              else addToGroceryCart({ id: product.id, name: product.name, price: product.price, image: product.image, productId: (product as any).productId || product.id, prescriptionRequired: product.prescriptionRequired || false, });
                            }}
                            disabled={!canAddToCart(product)}
                          >
                            <Text style={styles.addBtnText}>{canAddToCart(product) ? 'ADD' : 'OUT OF STOCK'}</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </View>
      {/* Filter Modal Sheet */}
      <Modal
        visible={showFilterModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <Pressable style={{ flex: 1, backgroundColor: theme.colors.text + '55' }} onPress={() => setShowFilterModal(false)} />
        <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#fff', borderTopLeftRadius: 18, borderTopRightRadius: 18, minHeight: 480, maxHeight: height * 0.85 }}>
          {/* Top Bar */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#222' }}>Filters</Text>
            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
              <MaterialCommunityIcons name="close" size={24} color="#222" />
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', flex: 1 }}>
            {/* Left: Tabs */}
            <View style={{ width: 110, backgroundColor: '#F8F8F8', borderRightWidth: 1, borderRightColor: '#eee', paddingVertical: 8 }}>
              {filterTabs.map(tab => (
                <TouchableOpacity
                  key={tab.key}
                  style={{ paddingVertical: 14, paddingHorizontal: 10, backgroundColor: selectedFilterTab === tab.key ? '#fff' : 'transparent', borderLeftWidth: 3, borderLeftColor: selectedFilterTab === tab.key ? '#1A7B50' : 'transparent' }}
                  onPress={() => setSelectedFilterTab(tab.key)}
                >
                  <Text style={{ color: selectedFilterTab === tab.key ? '#1A7B50' : '#222', fontWeight: selectedFilterTab === tab.key ? 'bold' : 'normal', fontSize: 15 }}>{tab.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {/* Right: Filter Options */}
            <View style={{ flex: 1, padding: 16 }}>
              {selectedFilterTab === 'Brand' && (
                <>
                  <View style={{ backgroundColor: '#F4F4F4', borderRadius: 8, flexDirection: 'row', alignItems: 'center', marginBottom: 12, paddingHorizontal: 12, width: '100%' }}>
                    <MaterialCommunityIcons name="magnify" size={20} color="#888" />
                    <TextInput
                      style={{ flex: 1, height: 40, fontSize: 16, marginLeft: 8, paddingHorizontal: 4 }}
                      placeholder="Search brands..."
                      placeholderTextColor="#aaa"
                      value={brandSearch}
                      onChangeText={setBrandSearch}
                    />
                  </View>
                  <ScrollView style={{ maxHeight: 260 }}>
                    {allBrands.filter(b => b.toLowerCase().includes(brandSearch.toLowerCase())).map((brand) => (
                      <TouchableOpacity
                        key={brand}
                        style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10 }}
                        onPress={() => {
                          setSelectedBrands((prev) =>
                            prev.includes(brand)
                              ? prev.filter((b) => b !== brand)
                              : [...prev, brand]
                          );
                        }}
                      >
                        <MaterialCommunityIcons
                          name={selectedBrands.includes(brand) ? 'checkbox-marked' : 'checkbox-blank-outline'}
                          size={22}
                          color={selectedBrands.includes(brand) ? '#1A7B50' : '#888'}
                          style={{ marginRight: 12 }}
                        />
                        <Text style={{ color: '#222', fontSize: 15 }}>{brand}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </>
              )}
              {/* Add similar blocks for other tabs (Type, AtteType, Quantity, DietPref) as needed */}
            </View>
          </View>
          {/* Bottom Buttons */}
          <View style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#eee', padding: 12, backgroundColor: '#fff', paddingBottom: 20 + insets.bottom, }}>
            <TouchableOpacity style={{ flex: 1, backgroundColor: '#F4F4F4', borderRadius: 8, paddingVertical: 12, alignItems: 'center', marginRight: 8 }} onPress={clearAllFilters}>
              <Text style={{ color: '#888', fontWeight: 'bold', fontSize: 15 }}>Clear filters</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ flex: 1, backgroundColor: '#1A7B50', borderRadius: 8, paddingVertical: 12, alignItems: 'center' }} onPress={() => setShowFilterModal(false)}>
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 15 }}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* Sort Modal Sheet */}
      <Modal
        visible={showSortModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSortModal(false)}
      >
        <Pressable style={{ flex: 1, backgroundColor: theme.colors.text + '55' }} onPress={() => setShowSortModal(false)} />
        <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: theme.colors.surface, borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: 24, minHeight: 220, paddingBottom: 20 + insets.bottom }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.text }}>Sort By</Text>
            <TouchableOpacity onPress={() => setShowSortModal(false)}>
              <MaterialCommunityIcons name="close" size={26} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          {sortOptions.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 14,
                borderBottomWidth: 1,
                borderBottomColor: theme.colors.border,
              }}
              onPress={() => {
                setSortBy(option.key as any);
                setShowSortModal(false);
              }}
            >
              <MaterialCommunityIcons
                name={sortBy === option.key ? 'check-circle' : 'circle-outline'}
                size={22}
                color={sortBy === option.key ? theme.colors.primary : theme.colors.text}
                style={{ marginRight: 12 }}
              />
              <Text style={{ color: theme.colors.text, fontWeight: sortBy === option.key ? 'bold' : 'normal', fontSize: 16 }}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  categoryTitle: {
    fontWeight: 'bold',
    fontSize: 20,
    color: '#222',
    flex: 1,
  },
  filterSortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginLeft: 10,
  },
  filterSortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7f7f7',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  filterSortText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#222',
  },
  backBtn: {
    marginRight: 10,
    padding: 4,
  },
  innerRow: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f7f7f7',
  },
  leftColumn: {
    width: LEFT_COLUMN_WIDTH,
    backgroundColor: '#fff',
    borderRightWidth: 1,
    borderRightColor: '#eee',
    paddingTop: 8,
    paddingBottom: 8,
  },
  subCategoryButton: {
    width: '100%',
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    borderLeftWidth: 4,
    borderLeftColor: 'transparent',
    paddingVertical: 10,
  },
  subCategoryButtonActive: {
    backgroundColor: '#f0f6ff',
    borderLeftColor: '#00b14f',
  },
  subCategoryImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginBottom: 4,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#eee',
    resizeMode: 'cover',
  },
  subCategoryText: {
    fontSize: 12,
    color: '#222',
    textAlign: 'center',
    fontWeight: '600',
    maxWidth: 60,
  },
  rightSection: {
    flex: 1,
    padding: 10,
  },
  productList: {
    paddingBottom: 30,
  },
  productCardList: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 14,
    marginVertical: 7,
    marginHorizontal: 2,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f2f2f2',
    position: 'relative',
    overflow: 'hidden',
  },
  productImageColumn: {
    marginRight: 12,
    alignItems: 'center',
  },
  productImageList: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginBottom: 6,
    backgroundColor: '#f0f0f0',
  },
  favBtnBelowImage: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  productInfoList: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#222',
    marginBottom: 2,
  },
  productBrand: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#00b14f',
    marginBottom: 4,
  },
  productVariants: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 4,
    gap: 6,
  },
  variantBtn: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 6,
    marginBottom: 4,
    backgroundColor: '#f7f7f7',
  },
  selectedVariantBtn: {
    borderColor: '#00b14f',
    backgroundColor: '#00b14f11',
  },
  qtyText: {
    fontSize: 12,
    color: '#888',
    marginLeft: 8,
    marginBottom: 8,
  },
  prescriptionRequiredContainer: {
    backgroundColor: '#ffe5e5',
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  prescriptionRequiredText: {
    color: '#d9534f',
    fontSize: 12,
    fontWeight: '600',
  },
  addButtonWrapper: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#27ae60',
    height: 42,
    minWidth: 88,
    paddingHorizontal: 8,
  },
  counterBtnSmall: {
    width: 34,
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterBtnTextSmall: {
    color: '#27ae60',
    fontWeight: 'bold',
    fontSize: 20,
  },
  counterValueSmall: {
    width: 28,
    textAlign: 'center',
    color: '#27ae60',
    fontWeight: 'bold',
    fontSize: 17,
  },
  favBtn: {
    marginLeft: 8,
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  noProducts: {
    color: '#888',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 15,
  },
  addRowList: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
    flexWrap: 'nowrap',
  },
  addBtn: {
    flex: 1,
    maxWidth: '100%',
    backgroundColor: '#00b14f',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    shadowColor: '#00b14f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  addBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
    letterSpacing: 0.2,
  },
});

export default CategoryDetailScreen; 