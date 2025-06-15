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
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import BannerSlider from '../components/BannerSlider';

const Tab = createBottomTabNavigator();

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

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

  return (
    <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
      <TouchableOpacity onPress={onProfilePress}>
        <MaterialCommunityIcons 
          name="account-circle" 
          size={28} 
          color={theme.colors.text} 
        />
      </TouchableOpacity>
      <View style={styles.headerRight}>
        <TouchableOpacity 
          style={styles.cartButton}
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
      {searchQuery.length > 0 && (
        <TouchableOpacity onPress={onClear}>
          <Ionicons 
            name="close-circle" 
            size={20} 
            color={theme.colors.text + '80'} 
          />
        </TouchableOpacity>
      )}
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
  const [scrollY] = useState(new Animated.Value(0));
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('grocery');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Flatten all products from all categories in the active section
  const getAllProducts = () => {
    const data = activeTab === 'grocery' ? groceryData : pharmacyData;
    return data.flatMap(category => 
      category.subCategories.flatMap(subCategory => subCategory.products)
    );
  };

  const toggleDrawer = () => setDrawerVisible(!drawerVisible);

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
    // Navigate to product detail or perform other actions
    console.log('Product pressed:', product);
    // navigation.navigate('ProductDetail', { product });
  };

  // Render the normal section view when not searching
  const renderSection = () => {
    if (activeTab === 'grocery') {
      return <GrocerySection scrollY={scrollY} />;
    } else {
      return <PharmacySection scrollY={scrollY} />;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <StatusBar barStyle={theme.dark ? 'light-content' : 'dark-content'} />
      <Header onProfilePress={toggleDrawer} />
      <SearchBar 
        searchQuery={searchQuery} 
        setSearchQuery={handleSearch}
        onClear={clearSearch}
      />
      <BannerSlider />
      {showSearchResults ? (
        <SearchResults 
          results={searchResults} 
          onProductPress={handleProductPress}
          activeTab={activeTab}
        />
      ) : (
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarStyle,
            tabBarActiveTintColor: theme.colors.primary,
            tabBarInactiveTintColor: theme.colors.text + '80',
            tabBarShowLabel: true,
            tabBarLabelStyle: styles.tabLabel,
          }}
        >
          <Tab.Screen
            name="Grocery"
            listeners={{
              tabPress: () => {
                setActiveTab('grocery');
                setSection('grocery');
              },
            }}
            options={{
              tabBarIcon: ({ color, size }) => (
                <View style={styles.tabIconContainer}>
                  <MaterialCommunityIcons 
                    name="basket" 
                    size={size} 
                    color={color} 
                  />
                </View>
              ),
            }}
          >
            {() => renderSection()}
          </Tab.Screen>
          <Tab.Screen
            name="Pharmacy"
            listeners={{
              tabPress: () => {
                setActiveTab('pharmacy');
                setSection('pharmacy');
              },
            }}
            options={{
              tabBarIcon: ({ color, size }) => (
                <View style={styles.tabIconContainer}>
                  <MaterialCommunityIcons 
                    name="medical-bag" 
                    size={size} 
                    color={color} 
                  />
                </View>
              ),
            }}
          >
            {() => renderSection()}
          </Tab.Screen>
        </Tab.Navigator>
      )}

      {drawerVisible && <Drawer onClose={toggleDrawer} />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartButton: {
    marginRight: 16,
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    borderRadius: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: Platform.OS === 'ios' ? 4 : 0,
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
  searchResultsContainer: {
    padding: 16,
  },
  searchResultCard: {
    width: '100%',
    marginBottom: 12,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noResultsText: {
    fontSize: 16,
    textAlign: 'center',
  }
});

export default HomeScreen;