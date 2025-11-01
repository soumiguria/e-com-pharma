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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useTheme } from '../../contexts/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ThemedButton from '../../components/ui/ThemedButton';
import { useCart } from '../../contexts/CartContext';
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
  image: string;
  description?: string;
  brand?: string;
  variants?: { id: string; name: string; price: number; stock: number }[];
  availableQty?: number;
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
  const { theme } = useTheme();
  const { addToGroceryCart, addToPharmacyCart, removeFromCart } = useCart();
  const { selectedStore } = useAppContext();
  const { category } = route.params;
  
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
  const [favProducts, setFavProducts] = useState<string[]>([]);
  const [selectedVariants, setSelectedVariants] = useState<{ [productId: string]: { id: string; name: string; price: number; stock: number } | undefined }>({});

  // Fetch subcategories when component mounts
  useEffect(() => {
    const fetchCategoryData = async () => {
      if (!selectedStore?.id || !category.id) return;
      
      setLoading(true);
      try {
        console.log('🔍 CategoryDetailScreen: Fetching subcategories for category:', category.id);
        
        // Fetch subcategories for this specific category only
        const subcategoriesResponse = await storeService.getCategorySubcategories(category.id, 'pharma');
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
  }, [selectedStore?.id, category.id]);

  // Fetch products for the selected subcategory and apply brand filters
  useEffect(() => {
    const fetchSubcategoryProducts = async () => {
      if (!selectedStore?.id || !selectedSubCategoryId) return;
      
      setLoading(true);
      try {
        console.log('🔍 CategoryDetailScreen: Fetching products for subcategory:', selectedSubCategoryId);
        
        // Determine if this is pharma or grocery based on category type
        const isPharma = category.type === 'pharma' || category.name?.toLowerCase().includes('medicine') || category.name?.toLowerCase().includes('pharma');
        
        let response;
        if (selectedBrands.length > 0) {
          // Apply brand filter using the new API
          const filters = { brand: selectedBrands[0] }; // Use first selected brand
          if (isPharma) {
            response = await storeProductService.getFilteredPharmaProducts(selectedStore.id, filters);
          } else {
            response = await storeProductService.getFilteredGroceryProducts(selectedStore.id, filters);
          }
        } else {
          // Fetch all products for subcategory
          if (isPharma) {
            response = await storeProductService.getPharmaProductsBySubcategory(selectedStore.id, selectedSubCategoryId);
          } else {
            response = await storeProductService.getGroceryProductsBySubcategory(selectedStore.id, selectedSubCategoryId);
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
  }, [selectedStore?.id, selectedSubCategoryId, selectedBrands, category.type, category.name]);
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

  // Add state for product quantities
  const [productQuantities, setProductQuantities] = useState<{ [productId: string]: number }>({});

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

  const handleAddToCart = (product: Product, variant?: { id: string; name: string; price: number; stock: number }) => {
    addToGroceryCart({
      id: variant ? `${product.id}-${variant.id}` : product.id,
      name: product.name,
      price: variant ? variant.price : product.price,
      image: product.image,
      variant: variant ? { name: variant.name, unit: 'unit' } : undefined,
    });
  };
  const handleFavToggle = (productId: string) => {
    setFavProducts(favs => favs.includes(productId) ? favs.filter(id => id !== productId) : [...favs, productId]);
  };

  // Add a placeholder image for subcategories if not present
  const SUBCATEGORY_PLACEHOLDER_IMAGE = 'https://cdn-icons-png.flaticon.com/512/3081/3081559.png';

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
        </View>
        {/* Right: Products List */}
        <View style={styles.rightSection}>
          <FlatList
            data={products}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={styles.productList}
            ListEmptyComponent={<Text style={[styles.noProducts, { color: theme.colors.secondary }]}>No products available</Text>}
            renderItem={({ item: product }) => {
              const selectedVariant = selectedVariants[product.id] ?? (product.variants ? product.variants[0] : undefined);
              const isFav = favProducts.includes(product.id);
              return (
                <TouchableOpacity style={[styles.productCardList, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, shadowColor: theme.colors.text }]} onPress={() => navigation.navigate('ProductDetail', { product })} activeOpacity={0.85}>
                  <Image source={{ uri: product.image }} style={styles.productImageList} />
                  <View style={styles.productInfoList}>
                    <Text style={[styles.productName, { color: theme.colors.text }]}>{product.name}</Text>
                    {product.brand && <Text style={[styles.productBrand, { color: theme.colors.secondary }]}>{product.brand}</Text>}
                    <Text style={[styles.productPrice, { color: theme.colors.primary }]}>{selectedVariant ? selectedVariant.price.toFixed(2) : product.price.toFixed(2)}</Text>
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
                    <Text style={[styles.qtyText, { color: theme.colors.secondary }]}>
                      {product.availableQty ? `In stock: ${product.availableQty}` : 'Available'}
                    </Text>
                    <View style={styles.addRowList}>
                      {productQuantities[product.id] > 0 ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 6, borderWidth: 1.5, borderColor: '#27ae60', height: 28, minWidth: 70, paddingHorizontal: 4, margin: 0 }}>
                          <TouchableOpacity onPress={() => {
                            setProductQuantities(q => {
                              const newQty = Math.max(0, (q[product.id] || 1) - 1);
                              if (newQty === 0) {
                                removeFromCart(product.id, 'grocery');
                                // Remove the product from state
                                const { [product.id]: _, ...rest } = q;
                                return rest;
                              }
                              return { ...q, [product.id]: newQty };
                            });
                          }} style={{ width: 28, height: 28, justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ color: '#27ae60', fontWeight: 'bold', fontSize: 18 }}>-</Text>
                          </TouchableOpacity>
                          <Text style={{ width: 24, textAlign: 'center', color: '#27ae60', fontWeight: 'bold', fontSize: 16 }}>{productQuantities[product.id]}</Text>
                          <TouchableOpacity onPress={() => {
                            setProductQuantities(q => {
                              const newQty = (q[product.id] || 0) + 1;
                              addToGroceryCart({ id: product.id, name: product.name, price: product.price, image: product.image });
                              return { ...q, [product.id]: newQty };
                            });
                          }} style={{ width: 28, height: 28, justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ color: '#27ae60', fontWeight: 'bold', fontSize: 18 }}>+</Text>
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={[styles.addBtn, { backgroundColor: theme.colors.primary, shadowColor: theme.colors.primary }]}
                          onPress={() => {
                            setProductQuantities(q => ({ ...q, [product.id]: 1 }));
                            addToGroceryCart({ id: product.id, name: product.name, price: product.price, image: product.image });
                          }}
                        >
                          <Text style={styles.addBtnText}>Add</Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        style={styles.favBtn}
                        onPress={() => handleFavToggle(product.id)}
                      >
                        <MaterialCommunityIcons
                          name={isFav ? 'heart' : 'heart-outline'}
                          size={22}
                          color={isFav ? theme.colors.primary : theme.colors.secondary}
                        />
                      </TouchableOpacity>
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
          <View style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#eee', padding: 12, backgroundColor: '#fff' }}>
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
        <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: theme.colors.surface, borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: 24, minHeight: 220 }}>
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
  },
  productImageList: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 12,
    backgroundColor: '#f0f0f0',
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
  favBtn: {
    marginLeft: 8,
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
    gap: 10,
  },
  addBtn: {
    flex: 1,
    backgroundColor: '#00b14f',
    borderRadius: 8,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    shadowColor: '#00b14f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  addBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    letterSpacing: 0.5,
  },
});

export default CategoryDetailScreen; 