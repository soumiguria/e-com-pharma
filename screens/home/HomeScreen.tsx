import React, { useState, useEffect, useMemo } from 'react';
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
  BackHandler,
  Image as RNImage,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, HomeStackParamList } from '../../navigation/types';
import { useTheme } from '../../contexts/ThemeContext';
import { useCart } from '../../contexts/CartContext';
import { useAppContext } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import Drawer from '../../components/profile/ProfileDrawer';
import ProductCard from '../../components/product/ProductCard'
import BannerSlider from '../../components/common/BannerSlider';
import CategoryGrid from '../../components/common/CategoriesGrid';
import BrandsGrid from '../../components/common/BrandsGrid';
import HorizontallyScrollableSection from '../../components/layout/HorizontallyScrollableSection';
import SearchBar from '../../components/ui/SearchBar';

const Tab = createBottomTabNavigator();

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type HomeRouteProp = RouteProp<HomeStackParamList, 'HomeRoot'>;

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: 'grocery' | 'pharma';
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
          { id: '1-1-1', name: 'Ibuprofen', price: 5.99, image: 'https://cdn.pixabay.com/photo/2017/02/28/14/37/pills-2106003_1280.jpg', category: 'pharma' },
          { id: '1-1-2', name: 'Aspirin', price: 3.99, image: 'https://cdn.pixabay.com/photo/2017/02/28/14/37/pills-2106003_1280.jpg', category: 'pharma' },
        ],
      },
      {
        id: '1-2',
        name: 'Cold & Flu',
        products: [
          { id: '1-2-1', name: 'Cold Syrup', price: 7.49, image: 'https://cdn.pixabay.com/photo/2017/02/28/14/37/pills-2106003_1280.jpg', category: 'pharma' },
          { id: '1-2-2', name: 'Nasal Spray', price: 6.99, image: 'https://cdn.pixabay.com/photo/2017/02/28/14/37/pills-2106003_1280.jpg', category: 'pharma' },
        ],
      },
    ],
  },
  // Add more pharmacy categories as needed
];

const Header = ({ onProfilePress, themedStyles }: { onProfilePress: () => void, themedStyles: any }) => {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const { selectedStore, lastVisitedStore, setSelectedStore } = useAppContext();
  const { groceryItems } = useCart();
  const { isAuthenticated } = useAuth();

  // Show last visited store name if user is logged in and no store is currently selected
  const displayStore = selectedStore || (isAuthenticated ? lastVisitedStore : null);

  return (
    <Animated.View style={[themedStyles.header]}>
      <TouchableOpacity onPress={onProfilePress} style={{ flexDirection: 'row', alignItems: 'center' }}>
        <MaterialCommunityIcons 
          name="account-circle" 
          size={28} 
          color={theme.colors.text} 
        />
        {displayStore && (
          <Text style={[themedStyles.storeName, {color: theme.colors.text, marginLeft: 10, fontWeight: 'bold', fontSize: 17}]} numberOfLines={1}>
            {displayStore.name}
          </Text>
        )}
      </TouchableOpacity>
      <View style={themedStyles.headerRight}>
        <TouchableOpacity 
          style={themedStyles.headerIcon}
          onPress={() => navigation.navigate('GreatOffersScreen')}
        >
          <RNImage
            source={require('../../assets/discount.png')}
            style={{ width: 26, height: 26, resizeMode: 'contain', marginTop: 1 }}
          />
        </TouchableOpacity>
        <TouchableOpacity 
          style={themedStyles.headerIcon}
          onPress={() => navigation.navigate('Cart')}
        >
          <MaterialCommunityIcons 
            name="cart" 
            size={24} 
            color={theme.colors.text} 
          />
          {groceryItems.length > 0 && (
            <View style={[themedStyles.cartBadge, { backgroundColor: theme.colors.primary }]}> 
              <Text style={themedStyles.cartBadgeText}>{groceryItems.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const SearchResults = ({ results, onProductPress, activeTab, themedStyles }: { results: Product[], onProductPress: (product: Product) => void, activeTab: string, themedStyles: any }) => {
  const { theme } = useTheme();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [results]);

  if (results.length === 0) {
    return (
      <View style={themedStyles.noResultsContainer}>
        <MaterialIcons name="search-off" size={64} color={theme.colors.secondary} style={{ marginBottom: 12 }} />
        <Text style={[themedStyles.noResultsText, { color: theme.colors.text }]}>No products found in {activeTab}</Text>
      </View>
    );
  }

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
      <Text style={themedStyles.searchResultsTitle}>Search Results</Text>
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={themedStyles.searchResultCard}>
            <ProductCard 
              product={{...item, category: activeTab as 'grocery' | 'pharma'}} 
              onPress={() => onProductPress(item)}
              compact={true}
              hideCartButton={true}
            />
          </View>
        )}
        contentContainerStyle={themedStyles.searchResultsContainer}
        showsVerticalScrollIndicator={false}
      />
    </Animated.View>
  );
};

const HomeScreen = () => {
  const { theme, setSection } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<HomeRouteProp>();
  const { addToGroceryCart } = useCart();
  const { selectedStore, setSelectedStore, saveLastVisitedStore } = useAppContext();
  const { isAuthenticated } = useAuth();
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const scrollY = new Animated.Value(0);

  // Determine if current store is pharmacy or grocery
  const isPharmacyStore = selectedStore?.type === 'pharma';
  const currentSection = isPharmacyStore ? 'pharma' : 'grocery';

  // Set section based on store type
  useEffect(() => {
    if (selectedStore) {
      setSection(currentSection);
    }
  }, [selectedStore, currentSection, setSection]);

  // Apply deep link params to select store on open
  useEffect(() => {
    const params = route.params as any;
    if (params && params.storeId) {
      const incomingStoreId = params.storeId as string;
      const incomingType = (params.type as 'grocery' | 'pharma' | undefined) ?? 'grocery';
      const incomingPincode = params.pincode as string | undefined;
      if (!selectedStore || selectedStore.id !== incomingStoreId) {
        const newStore = { id: incomingStoreId, name: 'Selected Store', address: '', type: incomingType, pincode: incomingPincode };
        setSelectedStore(newStore);
        // Save as last visited store if user is authenticated
        if (isAuthenticated) {
          saveLastVisitedStore(newStore);
        }
      }
    }
  }, [route.params, selectedStore, setSelectedStore, isAuthenticated, saveLastVisitedStore]);

  // Save store as last visited when selected
  useEffect(() => {
    if (selectedStore && isAuthenticated) {
      console.log('💾 Saving selected store as last visited:', selectedStore);
      saveLastVisitedStore(selectedStore);
    }
  }, [selectedStore, isAuthenticated, saveLastVisitedStore]);

  const themedStyles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 18,
      paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
      paddingBottom: 14,
      elevation: 2,
      shadowColor: theme.colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    storeName: {
      marginLeft: 10,
      fontWeight: 'bold',
      fontSize: 17,
      color: theme.colors.primary,
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
      backgroundColor: theme.colors.primary,
    },
    cartBadgeText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: 'bold',
    },
    searchBarWrapper: {
      paddingHorizontal: 18,
      paddingTop: 12,
      paddingBottom: 8,
      backgroundColor: theme.colors.background,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 15,
      paddingVertical: 8,
      borderRadius: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 6,
      elevation: 2,
      marginBottom: 8,
      borderBottomWidth: 0,
    },
    searchIcon: {
      marginRight: 10,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      height: 40,
      paddingHorizontal: 8,
    },
    searchRight:{
      flexDirection: 'row',
      alignItems: 'center',
    },
    searchButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      backgroundColor: theme.colors.primary,
      marginLeft: 8,
    },
    searchButtonText: {
      color: theme.colors.surface,
      fontSize: 14,
      fontWeight: '600',
    },
    contentContainer: {
      flex: 1,
    },
    section: {
      marginBottom: 24,
      paddingHorizontal: 16,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 16,
    },
    sectionHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    viewAll: {
      fontSize: 14,
      fontWeight: '600',
    },
    tabBar: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 60,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    tab: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 8,
    },
    activeTab: {
      borderBottomWidth: 2,
      borderBottomColor: theme.colors.primary,
    },
    tabIcon: {
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
      borderRadius: 14,
      backgroundColor: theme.colors.surface,
      shadowColor: theme.colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 4,
      elevation: 1,
    },
    searchResultsTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginTop: 8,
      marginBottom: 8,
      marginLeft: 16,
      color: theme.colors.text,
    },
    searchResultsContainerGrid: {
      paddingHorizontal: 8,
      paddingBottom: 24,
    },
    searchResultCardGrid: {
      flex: 1,
      margin: 8,
      minWidth: 160,
      maxWidth: '48%',
    },
    searchGridRow: {
      justifyContent: 'space-between',
    },
    drawerOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    searchPlaceholder: {
      flex: 1,
      fontSize: 16,
      paddingHorizontal: 8,
    },
  }), [theme]);

  useFocusEffect(
    React.useCallback(() => {
      // Don't set section here anymore, it's handled by the useEffect above
    }, [])
  );

  // Handle back button press
  useEffect(() => {
    const backAction = () => {
      if (isDrawerVisible) {
        setIsDrawerVisible(false);
        return true; // Prevent default back action
      }
      return false; // Allow default back action
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, [isDrawerVisible]);

  const getAllProducts = () => {
    const allProducts: Product[] = [];
    groceryData.forEach(category => {
      category.subCategories.forEach(subCategory => {
        allProducts.push(...subCategory.products);
      });
    });
    return allProducts;
  };

  const toggleDrawer = () => setIsDrawerVisible(!isDrawerVisible);

  const handleOverlayPress = () => {
    setIsDrawerVisible(false);
  };

  const tabBarStyle = {
    ...themedStyles.tabBar,
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
    <SafeAreaView style={themedStyles.container} edges={['top']}>
      <StatusBar barStyle={theme.dark ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.surface} />
      <Header onProfilePress={toggleDrawer} themedStyles={themedStyles} />
      <View>
        <SearchBar
          onSearch={() => {}}
          placeholder={isPharmacyStore ? "Search medicines..." : "Search products..."}
        />
        <TouchableOpacity
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('SearchScreen')}
        />
      </View>
      
      <View style={themedStyles.contentContainer}>
        {searchQuery.length > 0 ? (
          <SearchResults 
            results={searchResults} 
            onProductPress={handleProductPress} 
            activeTab={activeTab}
            themedStyles={themedStyles}
          />
        ) : (
          <ScrollView>
            <BannerSlider />
            <View style={themedStyles.section}>
              <Text style={[themedStyles.sectionTitle, {color: theme.colors.text}]}>
                {isPharmacyStore ? 'Medicine Categories' : 'Categories'}
              </Text>
              <CategoryGrid />
              <View style={{ alignItems: 'center', marginTop: 8 }}>
                <TouchableOpacity onPress={() => navigation.navigate('CategoriesScreen' as any)}>
                  <Text style={[themedStyles.viewAll, {color: theme.colors.primary}]}>View All</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={themedStyles.section}>
              <Text style={[themedStyles.sectionTitle, {color: theme.colors.text}]}>
                {isPharmacyStore ? 'Pharmacy Brands' : 'Shop by Brands'}
              </Text>
              <BrandsGrid />
              <View style={{ alignItems: 'center', marginTop: 8 }}>
                <TouchableOpacity onPress={() => navigation.navigate('BrandsScreen' as any)}>
                  <Text style={[themedStyles.viewAll, {color: theme.colors.primary}]}>View All</Text>
                </TouchableOpacity>
              </View>
            </View>
            {/* Recently Bought Section */}
            <View style={themedStyles.section}>
              <View style={themedStyles.sectionHeaderRow}>
                <Text style={[themedStyles.sectionTitle, {color: theme.colors.text}]}>
                  {isPharmacyStore ? 'Recently Bought Medicines' : 'Recently Bought'}
                </Text>
                <TouchableOpacity onPress={() => navigation.navigate('RecentlyBoughtScreen' as any)}>
                  <Text style={[themedStyles.viewAll, {color: theme.colors.primary}]}>View All</Text>
                </TouchableOpacity>
              </View>
              <HorizontallyScrollableSection title={isPharmacyStore ? "Recently Bought Medicines" : "Recently Bought"} />
            </View>
            {/* Great Offers Section */}
            <View style={themedStyles.section}>
              <View style={themedStyles.sectionHeaderRow}>
                <Text style={[themedStyles.sectionTitle, {color: theme.colors.text}]}>
                  {isPharmacyStore ? 'Medicine Offers' : 'Great Offers'}
                </Text>
                <TouchableOpacity onPress={() => navigation.navigate('GreatOffersScreen' as any)}>
                  <Text style={[themedStyles.viewAll, {color: theme.colors.primary}]}>View All</Text>
                </TouchableOpacity>
              </View>
              <HorizontallyScrollableSection title={isPharmacyStore ? "Medicine Offers" : "Great Offers"} />
            </View>
          </ScrollView>
        )}
      </View>

      {isDrawerVisible && (
        <TouchableOpacity style={themedStyles.drawerOverlay} onPress={handleOverlayPress} activeOpacity={1}>
          <View style={{ flex: 1 }} />
          <Drawer onClose={toggleDrawer} />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

export default HomeScreen;