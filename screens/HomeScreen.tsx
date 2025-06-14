import React, { useState, useEffect, useRef } from 'react';
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
  Dimensions,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import Drawer from '../components/ProfileDrawer';
import ThemeToggle from '../components/ThemeToggle';
import ProductCard from '../components/ProductCard';
import GrocerySection from '../components/GrocerySection';
import PharmacySection from '../components/PharmacySection';
import FeaturedBanners from '../components/FeaturedBanners';

const Tab = createBottomTabNavigator();
const { width: screenWidth } = Dimensions.get('window');

type HomeRouteProp = RouteProp<RootStackParamList, 'Home'>;
type HomeNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
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

const mockBanners = [
  {
    id: '1',
    imageUrl: 'https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885_1280.jpg',
    link: '/promotion1',
  },
      {
    id: '2',
    imageUrl: 'https://cdn.pixabay.com/photo/2015/12/01/20/28/road-1072823_1280.jpg',
    link: '/promotion2',
      },
];

const Header = ({ 
  storeName, 
  searchQuery, 
  setSearchQuery,
  onClear 
}: { 
  storeName: string;
  searchQuery: string;
  setSearchQuery: (text: string) => void;
  onClear: () => void;
}) => {
  const { theme } = useTheme();
  const navigation = useNavigation<HomeNavigationProp>();
  const route = useRoute<HomeRouteProp>();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View 
      style={[
        styles.header, 
        { 
          backgroundColor: theme.colors.background,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <View style={styles.headerTop}>
        <TouchableOpacity 
          onPress={() => navigation.navigate('Profile')} 
          style={styles.menuButton}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="account" size={28} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.storeInfo}>
          <Text style={[styles.storeName, { color: theme.colors.text }]} numberOfLines={1}>
            {storeName}
          </Text>
          <View style={styles.locationContainer}>
            <MaterialCommunityIcons name="map-marker" size={16} color={theme.colors.primary} />
            <Text style={[styles.locationText, { color: theme.colors.text }]}>
              {route.params.pincode}
            </Text>
          </View>
        </View>
        <View style={styles.rightIcons}>
          <ThemeToggle />
          <TouchableOpacity 
            style={styles.cartButton}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="cart-outline" size={28} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
      </View>
      <Animated.View 
        style={[
          styles.searchContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <View style={[styles.searchBar, { backgroundColor: theme.colors.surface }]}>
          <MaterialCommunityIcons 
            name="magnify" 
            size={24} 
            color={theme.colors.text} 
        style={styles.searchIcon} 
      />
      <TextInput
            placeholder="Search products..."
            placeholderTextColor={theme.colors.secondary}
        style={[styles.searchInput, { color: theme.colors.text }]}
        value={searchQuery}
        onChangeText={setSearchQuery}
        returnKeyType="search"
      />
      {searchQuery.length > 0 && (
            <TouchableOpacity 
              onPress={onClear}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons 
            name="close-circle" 
            size={20} 
            color={theme.colors.text + '80'} 
          />
        </TouchableOpacity>
      )}
    </View>
      </Animated.View>
      {isDrawerOpen && <Drawer onClose={() => setIsDrawerOpen(false)} />}
    </Animated.View>
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
        <ProductCard 
          product={item} 
          onPress={() => onProductPress(item)}
          style={styles.searchResultCard}
        />
      )}
      contentContainerStyle={styles.searchResultsContainer}
    />
  );
};

const HomeScreen = () => {
  const route = useRoute<HomeRouteProp>();
  const { theme, setSection } = useTheme();
  const [scrollY] = useState(new Animated.Value(0));
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(route.params.storeType);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [storeName, setStoreName] = useState('');

  const getAllProducts = (): Product[] => {
    // Replace with your actual data fetching logic
    return [];
  };

  useEffect(() => {
    setActiveTab(route.params.storeType);
    setSection(route.params.storeType);
    setStoreName(route.params.storeType === 'grocery' ? 'Fresh Grocery Store' : 'Quick Pharmacy');
  }, [route.params.storeType]);

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
    console.log('Product pressed:', product);
  };

  const handleBannerPress = (link: string) => {
    console.log('Banner pressed:', link);
  };

  const renderSection = (): JSX.Element => {
    switch (activeTab) {
      case 'grocery':
        return <GrocerySection scrollY={scrollY} storeId={route.params.storeId} />;
      case 'pharmacy':
        return <PharmacySection scrollY={scrollY} storeId={route.params.storeId} />;
      default:
        return <GrocerySection scrollY={scrollY} storeId={route.params.storeId} />;
    }
  };

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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <StatusBar barStyle={theme.dark ? 'light-content' : 'dark-content'} />
      <Header 
        storeName={storeName}
        searchQuery={searchQuery} 
        setSearchQuery={handleSearch}
        onClear={clearSearch}
      />

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
          initialRouteName={route.params.storeType === 'grocery' ? 'Grocery' : 'Pharmacy'}
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
            {renderSection}
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
            {renderSection}
          </Tab.Screen>
        </Tab.Navigator>
      )}

      {drawerVisible && <Drawer onClose={() => setDrawerVisible(false)} />}
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
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  menuButton: {
    padding: 4,
  },
  storeInfo: {
    flex: 1,
    marginHorizontal: 12,
  },
  storeName: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  locationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  locationText: {
    fontSize: 14,
    marginLeft: 4,
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartButton: {
    padding: 4,
    marginLeft: 12,
  },
  searchContainer: {
    marginHorizontal: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
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
  },
});

export default HomeScreen;