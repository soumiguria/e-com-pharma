import React, { useState } from 'react';
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
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useTheme } from '../../contexts/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ThemedButton from '../../components/ui/ThemedButton';
import { useCart } from '../../contexts/CartContext';

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

// Dummy data for multiple categories
const DUMMY_CATEGORY_DATA: Record<string, SubCategory[]> = {
  '1': [ // Fruits
    {
      id: 'sub1',
      name: 'Citrus',
      products: [
        {
          id: 'prod1',
          name: 'Orange',
          price: 60,
          image: 'https://images.pexels.com/photos/42059/orange-fruit-vitamins-healthy-eating-42059.jpeg',
          brand: 'Fresh Farms',
          availableQty: 30,
        },
        {
          id: 'prod2',
          name: 'Lemon',
          price: 40,
          image: 'https://images.pexels.com/photos/162806/lemon-yellow-citrus-fruit-162806.jpeg',
          brand: 'Fresh Farms',
          availableQty: 20,
        },
      ],
    },
    {
      id: 'sub2',
      name: 'Berries',
      products: [
        {
          id: 'prod3',
          name: 'Strawberry',
          price: 120,
          image: 'https://images.pexels.com/photos/461382/pexels-photo-461382.jpeg',
          brand: 'Berry Good',
          availableQty: 10,
        },
      ],
    },
  ],
  '2': [ // Vegetables
    {
      id: 'sub1',
      name: 'Leafy',
      products: [
        {
          id: 'prod1',
          name: 'Spinach',
          price: 30,
          image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
          brand: 'Green Leaf',
          availableQty: 25,
        },
      ],
    },
    {
      id: 'sub2',
      name: 'Root',
      products: [
        {
          id: 'prod2',
          name: 'Carrot',
          price: 40,
          image: 'https://images.pexels.com/photos/65174/pexels-photo-65174.jpeg',
          brand: 'Rooty',
          availableQty: 18,
        },
      ],
    },
  ],
  '3': [ // Dairy
    {
      id: 'sub1',
      name: 'Milk',
      products: [
        {
          id: 'prod1',
          name: 'Amul Milk 1L',
          price: 65,
          image: 'https://blinkit.com/images/products/400/amul-taaza-homogenised-toned-milk.jpg',
          brand: 'Amul',
          availableQty: 20,
          variants: [
            { id: 'v1', name: '1L', price: 65, stock: 20 },
            { id: 'v2', name: '500ml', price: 35, stock: 10 },
          ],
        },
      ],
    },
    {
      id: 'sub2',
      name: 'Paneer',
      products: [
        {
          id: 'prod2',
          name: 'Amul Paneer 200g',
          price: 85,
          image: 'https://blinkit.com/images/products/400/amul-paneer.jpg',
          brand: 'Amul',
          availableQty: 8,
        },
      ],
    },
  ],
  '4': [ // Meat
    {
      id: 'sub1',
      name: 'Chicken',
      products: [
        {
          id: 'prod1',
          name: 'Chicken Breast',
          price: 220,
          image: 'https://images.pexels.com/photos/65175/pexels-photo-65175.jpeg',
          brand: 'Meaty',
          availableQty: 12,
        },
      ],
    },
    {
      id: 'sub2',
      name: 'Fish',
      products: [
        {
          id: 'prod2',
          name: 'Rohu Fish',
          price: 350,
          image: 'https://images.pexels.com/photos/128388/pexels-photo-128388.jpeg',
          brand: 'Fishy',
          availableQty: 6,
        },
      ],
    },
  ],
  // ...add more for other ids if desired
};

const DUMMY_SUBCATEGORIES: SubCategory[] = [
  {
    id: 'sub1',
    name: 'Popular',
    products: [
      {
        id: 'prod1',
        name: 'Amul Milk 1L',
        price: 65,
        image: 'https://blinkit.com/images/products/400/amul-taaza-homogenised-toned-milk.jpg',
        brand: 'Amul',
        availableQty: 20,
        variants: [
          { id: 'v1', name: '1L', price: 65, stock: 20 },
          { id: 'v2', name: '500ml', price: 35, stock: 10 },
        ],
      },
      {
        id: 'prod2',
        name: 'Mother Dairy Curd',
        price: 30,
        image: 'https://blinkit.com/images/products/400/mother-dairy-dahi.jpg',
        brand: 'Mother Dairy',
        availableQty: 15,
      },
    ],
  },
  {
    id: 'sub2',
    name: 'Paneer',
    products: [
      {
        id: 'prod3',
        name: 'Amul Paneer 200g',
        price: 85,
        image: 'https://blinkit.com/images/products/400/amul-paneer.jpg',
        brand: 'Amul',
        availableQty: 8,
      },
    ],
  },
  {
    id: 'sub3',
    name: 'Butter & Cheese',
    products: [
      {
        id: 'prod4',
        name: 'Britannia Cheese Slices',
        price: 120,
        image: 'https://blinkit.com/images/products/400/britannia-cheese-slices.jpg',
        brand: 'Britannia',
        availableQty: 12,
      },
    ],
  },
  {
    id: 'sub4',
    name: 'Yogurt',
    products: [],
  },
];

const CategoryDetailScreen = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'CategoryDetail'>>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { theme } = useTheme();
  const { addToGroceryCart } = useCart();
  const { category } = route.params;
  const subCategories = Array.isArray(category.subCategories) && category.subCategories.length > 0
    ? category.subCategories
    : DUMMY_CATEGORY_DATA[category.id] || DUMMY_SUBCATEGORIES;
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState(subCategories[0]?.id);
  const [sortBy, setSortBy] = useState<'relevance' | 'price_low_high' | 'price_high_low'>('relevance');
  const [filter, setFilter] = useState<string | null>(null);
  const [favProducts, setFavProducts] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState(true);
  const [selectedVariants, setSelectedVariants] = useState<{ [productId: string]: { id: string; name: string; price: number; stock: number } | undefined }>({});

  const selectedSubCategory = subCategories.find((sc: SubCategory) => sc.id === selectedSubCategoryId);
  let products = selectedSubCategory ? selectedSubCategory.products : [];
  if (sortBy === 'price_low_high') {
    products = [...products].sort((a: Product, b: Product) => a.price - b.price);
  } else if (sortBy === 'price_high_low') {
    products = [...products].sort((a: Product, b: Product) => b.price - a.price);
  }
  if (filter) {
    products = products.filter((p: Product) => p.brand === filter);
  }

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
    <Modal
      visible={modalVisible}
      animationType="slide"
      transparent
      onRequestClose={() => {
        setModalVisible(false);
        navigation.goBack();
      }}
    >
      <Pressable style={styles.modalBg} onPress={() => { setModalVisible(false); navigation.goBack(); }} />
      <View style={styles.modalContent}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backBtn} onPress={() => { setModalVisible(false); navigation.goBack(); }}>
            <MaterialCommunityIcons name="arrow-left" size={26} color="#222" />
          </TouchableOpacity>
          <Text style={styles.categoryTitle}>{category.name || 'Category'}</Text>
          <View style={styles.filterSortRow}>
            <TouchableOpacity style={styles.filterSortBtn} onPress={() => setFilter(null)}>
              <MaterialCommunityIcons name="filter-variant" size={18} color={'#222'} />
              <Text style={styles.filterSortText}>Filter</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterSortBtn} onPress={() => setSortBy('relevance')}>
              <MaterialCommunityIcons name="sort" size={18} color={'#222'} />
              <Text style={styles.filterSortText}>Sort By</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.closeBtn} onPress={() => { setModalVisible(false); navigation.goBack(); }}>
            <MaterialCommunityIcons name="close" size={26} color="#222" />
        </TouchableOpacity>
        </View>
        <View style={styles.innerRow}>
          {/* Left: Subcategories */}
          <View style={styles.leftColumn}>
            <FlatList
              data={subCategories}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.subCategoryButton,
                    selectedSubCategoryId === item.id && styles.subCategoryButtonActive,
                  ]}
                  onPress={() => setSelectedSubCategoryId(item.id)}
                >
                  <Image
                    source={{ uri: (item.products[0]?.image) || SUBCATEGORY_PLACEHOLDER_IMAGE }}
                    style={styles.subCategoryImage}
                  />
                  <Text style={styles.subCategoryText}>{item.name}</Text>
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
              ListEmptyComponent={<Text style={styles.noProducts}>No products available</Text>}
              renderItem={({ item: product }: { item: Product }) => {
                const selectedVariant = selectedVariants[product.id] ?? (product.variants ? product.variants[0] : undefined);
                const isFav = favProducts.includes(product.id);
  return (
                  <TouchableOpacity style={styles.productCardList} onPress={() => navigation.navigate('ProductDetail', { product })} activeOpacity={0.85}>
                    <Image source={{ uri: product.image }} style={styles.productImageList} />
                    <View style={styles.productInfoList}>
                      <Text style={styles.productName}>{product.name}</Text>
                      {product.brand && <Text style={styles.productBrand}>{product.brand}</Text>}
                      <Text style={styles.productPrice}>₹{selectedVariant ? selectedVariant.price : product.price}</Text>
                      {product.variants && (
                        <View style={styles.productVariants}>
                          {product.variants.map((variant: { id: string; name: string; price: number; stock: number }) => (
          <TouchableOpacity
                              key={variant.id}
                              style={[
                                styles.variantBtn,
                                selectedVariant?.id === variant.id && styles.selectedVariantBtn,
                              ]}
                              onPress={() => setSelectedVariants((prev) => ({ ...prev, [product.id]: variant }))}
                            >
                              <Text style={{ color: '#222', fontSize: 13 }}>{variant.name}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                      <Text style={styles.qtyText}>
                        {product.availableQty ? `In stock: ${product.availableQty}` : 'Available'}
            </Text>
                      <View style={styles.addRowList}>
          <TouchableOpacity
                          style={styles.addBtn}
                          onPress={() => handleAddToCart(product, selectedVariant)}
          >
                          <Text style={styles.addBtnText}>Add</Text>
          </TouchableOpacity>
          <TouchableOpacity
                          style={styles.favBtn}
                          onPress={() => handleFavToggle(product.id)}
                        >
                          <MaterialCommunityIcons
                            name={isFav ? 'heart' : 'heart-outline'}
                            size={22}
                            color={isFav ? theme.colors.primary : '#888'}
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
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    zIndex: 1,
  },
  modalContent: {
    position: 'absolute',
    top: height * 0.05,
    left: width * 0.01,
    right: width * 0.01,
    bottom: height * 0.01,
    backgroundColor: '#fff',
    borderRadius: 18,
    overflow: 'hidden',
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.13,
    shadowRadius: 16,
    elevation: 8,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    zIndex: 3,
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
  closeBtn: {
    marginLeft: 10,
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
  backBtn: {
    marginRight: 10,
    padding: 4,
  },
});

export default CategoryDetailScreen; 