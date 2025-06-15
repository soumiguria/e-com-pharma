import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image,
  Platform,
  FlatList,
  Dimensions,
  Animated,
  StatusBar
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../contexts/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type CategoryDetailRouteProp = RouteProp<RootStackParamList, 'CategoryDetail'>;
type CategoryDetailNavigationProp = StackNavigationProp<RootStackParamList, 'CategoryDetail'>;

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  brand: string;
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

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;
const HEADER_HEIGHT = 250;

const CategoryDetailScreen = () => {
  const route = useRoute<CategoryDetailRouteProp>();
  const navigation = useNavigation<CategoryDetailNavigationProp>();
  const { theme } = useTheme();
  const { category } = route.params;
  const [activeTab, setActiveTab] = useState<'subcategories' | 'brands' | 'products'>('subcategories');
  const scrollY = new Animated.Value(0);

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT / 2, HEADER_HEIGHT],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp',
  });

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT],
    outputRange: [0, -HEADER_HEIGHT / 2],
    extrapolate: 'clamp',
  });

  const handleProductPress = (product: Product) => {
    navigation.navigate('ProductDetail', { product });
  };

  const handleSubCategoryPress = (subCategory: SubCategory) => {
    navigation.navigate('AllProducts', {
      title: subCategory.name,
      products: subCategory.products,
    });
  };

  const getAllProducts = () => {
    return category.subCategories.flatMap(subCategory => subCategory.products);
  };

  const getAllBrands = () => {
    const brands = new Set<string>();
    category.subCategories.forEach(subCategory => {
      subCategory.brands?.forEach(brand => brands.add(brand));
    });
    return Array.from(brands);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      height: HEADER_HEIGHT,
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1,
    },
    headerImage: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    headerOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.4)',
    },
    headerContent: {
      position: 'absolute',
      bottom: 20,
      left: 20,
      right: 20,
    },
    title: {
      fontSize: 32,
      fontWeight: '800',
      color: '#fff',
      marginBottom: 8,
      textShadowColor: 'rgba(0,0,0,0.3)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 4,
    },
    subTitle: {
      fontSize: 18,
      color: '#fff',
      opacity: 0.9,
      textShadowColor: 'rgba(0,0,0,0.3)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    content: {
      flex: 1,
      marginTop: HEADER_HEIGHT,
    },
    tabContainer: {
      flexDirection: 'row',
      margin: 16,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: 4,
      ...Platform.select({
        ios: {
          shadowColor: theme.colors.text,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
        },
        android: {
          elevation: 8,
        },
      }),
    },
    tab: {
      flex: 1,
      paddingVertical: 12,
      alignItems: 'center',
      borderRadius: theme.borderRadius.lg,
    },
    activeTab: {
      backgroundColor: theme.colors.primary,
    },
    tabText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
    },
    activeTabText: {
      color: theme.colors.surface,
    },
    section: {
      flex: 1,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
      paddingHorizontal: 16,
    },
    sectionTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.colors.text,
    },
    countText: {
      fontSize: 16,
      color: theme.colors.secondary,
    },
    filterButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      ...Platform.select({
        ios: {
          shadowColor: theme.colors.text,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        android: {
          elevation: 4,
        },
      }),
    },
    filterText: {
      marginLeft: 8,
      fontSize: 14,
      color: theme.colors.text,
    },
    subCategoryCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      marginHorizontal: 16,
      marginBottom: 12,
      overflow: 'hidden',
      ...Platform.select({
        ios: {
          shadowColor: theme.colors.text,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
        },
        android: {
          elevation: 8,
        },
      }),
    },
    subCategoryContent: {
      padding: 16,
    },
    subCategoryName: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 8,
    },
    subCategoryInfo: {
      fontSize: 14,
      color: theme.colors.secondary,
    },
    brandContainer: {
      padding: 16,
    },
    brandCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: 16,
      marginBottom: 12,
      ...Platform.select({
        ios: {
          shadowColor: theme.colors.text,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
        },
        android: {
          elevation: 8,
        },
      }),
    },
    brandName: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 8,
    },
    brandInfo: {
      fontSize: 14,
      color: theme.colors.secondary,
    },
    productCard: {
      width: CARD_WIDTH,
      margin: 8,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      overflow: 'hidden',
      ...Platform.select({
        ios: {
          shadowColor: theme.colors.text,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
        },
        android: {
          elevation: 8,
        },
      }),
    },
    productImage: {
      width: '100%',
      height: CARD_WIDTH,
      resizeMode: 'cover',
    },
    productInfo: {
      padding: 12,
    },
    productName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 4,
    },
    productBrand: {
      fontSize: 14,
      color: theme.colors.secondary,
      marginBottom: 8,
    },
    productPrice: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.primary,
    },
    productBadge: {
      position: 'absolute',
      top: 8,
      right: 8,
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    badgeText: {
      color: theme.colors.surface,
      fontSize: 12,
      fontWeight: '600',
    },
  });

  const renderSubCategories = () => (
    <FlatList
      data={category.subCategories}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.subCategoryCard}
          onPress={() => handleSubCategoryPress(item)}
        >
          <View style={styles.subCategoryContent}>
            <Text style={styles.subCategoryName}>{item.name}</Text>
            <Text style={styles.subCategoryInfo}>
              {item.products.length} products
            </Text>
          </View>
        </TouchableOpacity>
      )}
      keyExtractor={item => item.id}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 16 }}
    />
  );

  const renderBrands = () => (
    <FlatList
      data={getAllBrands()}
      renderItem={({ item: brand }) => (
        <View style={styles.brandCard}>
          <Text style={styles.brandName}>{brand}</Text>
          <Text style={styles.brandInfo}>
            {getAllProducts().filter(p => p.brand === brand).length} products
          </Text>
        </View>
      )}
      keyExtractor={(item, index) => `${item}-${index}`}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.brandContainer}
    />
  );

  const renderProductCard = ({ item }: { item: Product }) => {
    const scale = scrollY.interpolate({
      inputRange: [-1, 0, 100, 101],
      outputRange: [1, 1, 0.95, 0.95],
    });

    return (
      <Animated.View style={[styles.productCard, { transform: [{ scale }] }]}>
        <TouchableOpacity onPress={() => handleProductPress(item)}>
          <Image source={{ uri: item.image }} style={styles.productImage} />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.productBadge}>
            <Text style={styles.badgeText}>New</Text>
          </View>
          <View style={styles.productInfo}>
            <Text style={styles.productName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.productBrand} numberOfLines={1}>
              {item.brand}
            </Text>
            <Text style={styles.productPrice}>
              ${item.price.toFixed(2)}
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderProducts = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>All Products</Text>
          <Text style={styles.countText}>
            {getAllProducts().length} products available
          </Text>
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <MaterialCommunityIcons name="filter-variant" size={20} color={theme.colors.text} />
          <Text style={styles.filterText}>Filter</Text>
        </TouchableOpacity>
      </View>
      <Animated.FlatList
        data={getAllProducts()}
        renderItem={renderProductCard}
        keyExtractor={item => item.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 16 }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Animated.View style={[styles.header, { opacity: headerOpacity, transform: [{ translateY: headerTranslateY }] }]}>
        <Image source={{ uri: category.image }} style={styles.headerImage} />
        <View style={styles.headerOverlay} />
        <View style={styles.headerContent}>
          <Text style={styles.title}>{category.name}</Text>
          <Text style={styles.subTitle}>
            {category.subCategories.length} subcategories
          </Text>
        </View>
      </Animated.View>

      <View style={styles.content}>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'subcategories' && styles.activeTab]}
            onPress={() => setActiveTab('subcategories')}
          >
            <Text style={[styles.tabText, activeTab === 'subcategories' && styles.activeTabText]}>
              Subcategories
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'brands' && styles.activeTab]}
            onPress={() => setActiveTab('brands')}
          >
            <Text style={[styles.tabText, activeTab === 'brands' && styles.activeTabText]}>
              Brands
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'products' && styles.activeTab]}
            onPress={() => setActiveTab('products')}
          >
            <Text style={[styles.tabText, activeTab === 'products' && styles.activeTabText]}>
              Products
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'subcategories' && renderSubCategories()}
        {activeTab === 'brands' && renderBrands()}
        {activeTab === 'products' && renderProducts()}
      </View>
    </View>
  );
};

export default CategoryDetailScreen; 