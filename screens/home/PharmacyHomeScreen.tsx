import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ProductCard from '../../components/product/ProductCard';
import StoreSection from '../../components/store/StoreSection';
import NearbyStores from '../../components/store/NearbyStores';
import { RootStackParamList } from '../../navigation/types';
import { useTheme } from '../../contexts/ThemeContext';

// Define types
type Product = {
  id: string;
  name: string;
  price: number;
  image?: string;
  category?: 'grocery' | 'pharma';
  description?: string;
  manufacturer?: string;
  prescription?: boolean;
  productCategory?: string; // For pharmacy-specific categories like 'Pain Relief', 'Vitamins', etc.
};

type Store = {
  id: string;
  name: string;
  distance: string;
  rating: number;
  type: 'pharma';
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type PharmacyHomeRouteProp = RouteProp<RootStackParamList, 'PharmacyHome'>;

const PharmacyHomeScreen = () => {
  const route = useRoute<PharmacyHomeRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [store, setStore] = useState<Store | null>(null);

  useEffect(() => {
    const storeId = route.params?.storeId || 'pharmacy-1';
    setStore({
      id: storeId,
      name: `Pharmacy Store ${storeId.split('-')[1]}`,
      distance: '0.8 km',
      rating: 4.7,
      type: 'pharma'
    });
    // Remove mock data - products will be fetched from API
    setProducts([]);
  }, [route.params]);

  const handleProductPress = (product: Product) => {
    navigation.navigate('ProductDetail', { product });
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      flex: 1,
      padding: theme.spacing.md,
    },
    scrollContent: {
      flexGrow: 1,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    section: {
      marginBottom: theme.spacing.lg,
    },
    productContainer: {
      marginBottom: theme.spacing.md,
    },
    productsList: {
      paddingBottom: theme.spacing.md,
    },
    categorySection: {
      marginBottom: theme.spacing.lg,
    },
    categoryTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    prescriptionBadge: {
      backgroundColor: theme.colors.error,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 4,
      marginLeft: 8,
    },
    prescriptionText: {
      color: theme.colors.surface,
      fontSize: 10,
      fontWeight: 'bold',
    },
  });

  const renderProductItem = ({ item }: { item: Product }) => (
    <View style={styles.productContainer}>
      <ProductCard 
        product={item} 
        onPress={() => handleProductPress(item)} 
      />
      {item.prescription && (
        <View style={styles.prescriptionBadge}>
          <Text style={styles.prescriptionText}>PRESCRIPTION REQUIRED</Text>
        </View>
      )}
    </View>
  );

  const renderCategorySection = (category: string) => {
    const categoryProducts = products.filter(product => product.productCategory === category);
    if (categoryProducts.length === 0) return null;

    return (
      <View key={category} style={styles.categorySection}>
        <Text style={styles.categoryTitle}>{category}</Text>
        <FlatList
          data={categoryProducts}
          scrollEnabled={false}
          keyExtractor={(item) => item.id}
          renderItem={renderProductItem}
          contentContainerStyle={styles.productsList}
        />
      </View>
    );
  };

  const categories = ['Pain Relief', 'Vitamins', 'Digestive Health', 'Allergy', 'Supplements'];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {store && <StoreSection store={store} />}
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.section}>
            <NearbyStores />
          </View>
          
          <View style={styles.section}>
            <Text style={styles.title}>Pharmacy Products</Text>
            {categories.map(category => renderCategorySection(category))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PharmacyHomeScreen; 