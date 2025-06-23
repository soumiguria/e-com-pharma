import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  StatusBar,
  TextInput,
  Platform,
  FlatList,
  Text,
  ScrollView,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import Drawer from '../components/ProfileDrawer';
import ThemeToggle from '../components/ThemeToggle';
import ProductCard from '../components/ProductCard';
import GrocerySection from '../components/GrocerySection';
import PharmacySection from '../components/PharmacySection';
import { useCart } from '../contexts/CartContext';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, HomeStackParamList } from '../navigation/types';
import BannerSlider from '../components/BannerSlider';
import { useAppContext } from '../contexts/AppContext';
import CategoryGrid from '../components/CategoriesGrid';
import BrandsGrid from '../components/BrandsGrid';
import HorizontallyScrollableSection from '../components/HorizontallyScrollableSection';

const Tab = createBottomTabNavigator();

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type HomeRouteProp = RouteProp<HomeStackParamList, 'HomeRoot'>;

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: 'grocery' | 'pharmacy';
}

interface SubCategory {
  id: string;
  name: string;
  products: Product[];
}

interface Category {
  id: string;
  name: string;
  subCategories: SubCategory[];
}

// Mock data structure that matches your GrocerySection and PharmacySection
const groceryData: Category[] = [
  {
    id: '1',
    name: 'Fresh Produce',
    subCategories: [
      {
        id: '1-1',
        name: 'Fruits',
        products: [
          { id: '1-1-1', name: 'Organic Apples', price: 2.99, image: 'https://cdn.pixabay.com/photo/2016/01/05/13/58/apple-1122537_1280.jpg', category: 'grocery' },
          { id: '1-1-2', name: 'Bananas', price: 1.99, image: 'https://cdn.pixabay.com/photo/2017/06/27/22/21/banana-2449019_1280.jpg', category: 'grocery' },
        ],
      },
      {
        id: '1-2',
        name: 'Vegetables',
        products: [
          { id: '1-2-1', name: 'Carrots', price: 1.49, image: 'https://cdn.pixabay.com/photo/2014/12/21/23/39/carrots-575773_1280.jpg', category: 'grocery' },
          { id: '1-2-2', name: 'Organic Broccoli', price: 2.49, image: 'https://cdn.pixabay.com/photo/2016/03/05/19/02/broccoli-1238250_1280.jpg', category: 'grocery' },
        ],
      },
    ],
  },
  // Add more grocery categories as needed
];

const pharmacyData: Category[] = [
  {
    id: '1',
    name: 'Medicines',
    subCategories: [
      {
        id: '1-1',
        name: 'Pain Relief',
        products: [
          { id: '1-1-1', name: 'Ibuprofen', price: 5.99, image: 'https://cdn.pixabay.com/photo/2017/02/28/14/37/pills-2106003_1280.jpg', category: 'pharmacy' },
          { id: '1-1-2', name: 'Aspirin', price: 3.99, image: 'https://cdn.pixabay.com/photo/2017/02/28/14/37/pills-2106003_1280.jpg', category: 'pharmacy' },
        ],
      },
      {
        id: '1-2',
        name: 'Cold & Flu',
        products: [
          { id: '1-2-1', name: 'Cold Syrup', price: 7.49, image: 'https://cdn.pixabay.com/photo/2017/02/28/14/37/pills-2106003_1280.jpg', category: 'pharmacy' },
          { id: '1-2-2', name: 'Nasal Spray', price: 6.99, image: 'https://cdn.pixabay.com/photo/2017/02/28/14/37/pills-2106003_1280.jpg', category: 'pharmacy' },
        ],
      },
    ],
  },
  // Add more pharmacy categories as needed
];

const Header = ({ onProfilePress }: { onProfilePress: () => void }) => {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const { totalItems } = useCart();
  const { selectedStore } = useAppContext();

  return (
    <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
      <TouchableOpacity onPress={onProfilePress}>
        <MaterialCommunityIcons 
          name="account-circle" 
          size={28} 
          color={theme.colors.text} 
        />
      </TouchableOpacity>
      {selectedStore && <Text style={[styles.storeName, {color: theme.colors.text}]}>{selectedStore.name}</Text>}
      <View style={styles.headerRight}>
        <TouchableOpacity 
          style={styles.headerIcon}
          onPress={() => navigation.navigate('GreatOffersScreen')}
        >
          <MaterialCommunityIcons 
            name="tag-outline" 
            size={24} 
            color={theme.colors.text} 
          />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.headerIcon}
          onPress={() => navigation.navigate('Cart')}
        >
          <MaterialCommunityIcons 
            name="cart" 
            size={24} 
            color={theme.colors.text} 
          />
          {totalItems > 0 && (
            <View style={[styles.cartBadge, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.cartBadgeText}>{totalItems}</Text>
            </View>
          )}
        </TouchableOpacity>
        <ThemeToggle />
      </View>
    </View>
  );
};

const SearchBar = ({ 
  searchQuery, 
  setSearchQuery,
  onClear 
}: { 
  searchQuery: string, 
  setSearchQuery: (text: string) => void,
  onClear: () => void
}) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.searchContainer, { backgroundColor: theme.colors.surface }]}>
      <Ionicons 
        name="search" 
        size={20} 
        color={theme.colors.text + '80'} 
        style={styles.searchIcon} 
      />
      <TextInput
        style={[styles.searchInput, { color: theme.colors.text }]}
        placeholder="Search products..."
        placeholderTextColor={theme.colors.text + '80'}
        value={searchQuery}
        onChangeText={setSearchQuery}
        returnKeyType="search"
      />
      <View style={styles.searchRight}>
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={onClear}>
            <Ionicons 
              name="close-circle" 
              size={20} 
              color={theme.colors.text + '80'} 
              style={styles.searchActionIcon}
            />
          </TouchableOpacity>
        )}
        <TouchableOpacity>
            <MaterialCommunityIcons
                name="microphone"
                size={24}
                color={theme.colors.text + '80'}
            />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const SearchResults = ({ 
  results, 
  onProductPress,
  activeTab 
}: { 
  results: Product[], 
  onProductPress: (product: Product) => void,
  activeTab: string
}) => {
  const { theme } = useTheme();

  if (results.length === 0) {
    return (
      <View style={styles.noResultsContainer}>
        <Text style={[styles.noResultsText, { color: theme.colors.text }]}>
          No products found in {activeTab}
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={results}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.searchResultCard}>
          <ProductCard 
            product={{...item, category: activeTab as 'grocery' | 'pharmacy'}} 
            onPress={() => onProductPress(item)}
          />
        </View>
      )}
      contentContainerStyle={styles.searchResultsContainer}
    />
  );
};

const HomeScreen = () => {
  const { theme, setSection } = useTheme();
  const [isDrawerVisible, setDrawerVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('grocery');
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const scrollY = new Animated.Value(0);

  useFocusEffect(
    React.useCallback(() => {
      setSection('grocery');
    }, [])
  );

  const route = useRoute<HomeRouteProp>();
  const navigation = useNavigation<NavigationProp>();

  const { pincode, storeId } = route.params;

  // Set initial tab based on navigation params
  useEffect(() => {
    // This logic is no longer needed with the new navigation structure
  }, [route.params]);

  // Flatten all products from all categories in the active section
  const getAllProducts = () => {
    const data = activeTab === 'grocery' ? groceryData : pharmacyData;
    return data.flatMap(category => 
      category.subCategories.flatMap(subCategory => subCategory.products)
    );
  };

  const toggleDrawer = () => setDrawerVisible(!isDrawerVisible);

  const tabBarStyle = {
    ...styles.tabBar,
    backgroundColor: theme.colors.surface,
    transform: [{
      translateY: scrollY.interpolate({
        inputRange: [0, 100],
        outputRange: [0, 100],
        extrapolate: 'clamp',
      }),
    }],
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text.length === 0) {
      setShowSearchResults(false);
      return;
    }

    const allProducts = getAllProducts();
    const filtered = allProducts.filter(product =>
      product.name.toLowerCase().includes(text.toLowerCase())
    );
    setSearchResults(filtered);
    setShowSearchResults(true);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setShowSearchResults(false);
  };

  const handleProductPress = (product: Product) => {
    navigation.navigate('ProductDetail', { product });
  };

  useEffect(() => {
    // Here you would typically fetch data from an API
    // For now, we'll just simulate a loading delay
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle={theme.dark ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.surface} />
      <Header onProfilePress={toggleDrawer} />
      <SearchBar 
        searchQuery={searchQuery} 
        setSearchQuery={handleSearch} 
        onClear={clearSearch} 
      />
      
      <View style={styles.contentContainer}>
        {searchQuery.length > 0 ? (
          <SearchResults 
            results={searchResults} 
            onProductPress={handleProductPress} 
            activeTab={activeTab}
          />
        ) : (
          <ScrollView>
            <BannerSlider />
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>Categories</Text>
              <CategoryGrid />
              <TouchableOpacity onPress={() => navigation.navigate({ name: 'CategoriesScreen', params: undefined })}>
                  <Text style={[styles.viewAll, {color: theme.colors.primary}]}>View All</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>Shop by Brands</Text>
              <BrandsGrid />
              <TouchableOpacity onPress={() => navigation.navigate({ name: 'BrandsScreen', params: undefined })}>
                  <Text style={[styles.viewAll, {color: theme.colors.primary}]}>View All</Text>
              </TouchableOpacity>
            </View>
            {/* Recently Bought Section */}
            <View style={[styles.section, styles.cardSection]}>
              <View style={styles.sectionHeaderRow}>
                <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>Recently Bought</Text>
                <TouchableOpacity onPress={() => navigation.navigate({ name: 'RecentlyBoughtScreen', params: undefined })}>
                  <Text style={[styles.viewAll, {color: theme.colors.primary}]}>View All</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.scrollableCardBg}>
                <HorizontallyScrollableSection title="Recently Bought" />
              </View>
            </View>
            {/* Great Offers Section */}
            <View style={[styles.section, styles.cardSection]}>
              <View style={styles.sectionHeaderRow}>
                <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>Great Offers</Text>
                <TouchableOpacity onPress={() => navigation.navigate({ name: 'GreatOffersScreen', params: undefined })}>
                  <Text style={[styles.viewAll, {color: theme.colors.primary}]}>View All</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.scrollableCardBg}>
                <HorizontallyScrollableSection title="Great Offers" />
              </View>
            </View>
          </ScrollView>
        )}
      </View>

      {isDrawerVisible && <Drawer onClose={toggleDrawer} />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    paddingBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  storeName: {
    marginLeft: 8,
    fontWeight: 'bold',
    fontSize: 16,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  headerIcon: {
    marginHorizontal: 8,
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    right: -8,
    top: -8,
    borderRadius: 12,
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: 40,
  },
  searchRight:{
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchActionIcon: {
    marginLeft: 10,
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  tabText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
  },
  searchResultsContainer: {
    flex: 1,
  },
  noResultsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noResultsText: {
    fontSize: 16,
    textAlign: 'center',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10,
  },
  gridContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
  },
  viewAll: {
      textAlign: 'center',
      marginTop: 10,
      fontWeight: 'bold',
  },
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    borderTopWidth: 0,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  searchResultCard: {
    width: '100%',
    marginBottom: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  cardSection: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginHorizontal: 10,
    marginBottom: 18,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  scrollableCardBg: {
    backgroundColor: '#f7f7f7',
    borderRadius: 10,
    paddingVertical: 6,
    paddingLeft: 2,
    paddingRight: 2,
  },
});

export default HomeScreen;