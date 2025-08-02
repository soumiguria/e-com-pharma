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
  category?: 'grocery' | 'pharmacy';
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
  type: 'pharmacy';
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type PharmacyHomeRouteProp = RouteProp<RootStackParamList, 'PharmacyHome'>;

// Mock pharmacy data
const pharmacyProducts: Record<string, Product[]> = {
  'pharmacy-1': [
    { 
      id: 'p101', 
      name: 'Paracetamol 500mg', 
      price: 5.99,
      category: 'pharmacy',
      productCategory: 'Pain Relief',
      description: 'Effective pain relief and fever reduction',
      manufacturer: 'ABC Pharma',
      prescription: false
    },
    { 
      id: 'p102', 
      name: 'Vitamin C 1000mg', 
      price: 12.50,
      category: 'pharmacy',
      productCategory: 'Vitamins',
      description: 'Immune system support',
      manufacturer: 'Health Plus',
      prescription: false
    },
    { 
      id: 'p103', 
      name: 'Omeprazole 20mg', 
      price: 25.99,
      category: 'pharmacy',
      productCategory: 'Digestive Health',
      description: 'Acid reflux medication',
      manufacturer: 'MediCare',
      prescription: true
    },
  ],
  'pharmacy-2': [
    { 
      id: 'p201', 
      name: 'Cetirizine 10mg', 
      price: 8.99,
      category: 'pharmacy',
      productCategory: 'Allergy',
      description: 'Allergy relief tablets',
      manufacturer: 'AllerCare',
      prescription: false
    },
    { 
      id: 'p202', 
      name: 'Calcium + Vitamin D', 
      price: 15.50,
      category: 'pharmacy',
      productCategory: 'Supplements',
      description: 'Bone health supplement',
      manufacturer: 'BoneHealth',
      prescription: false
    },
  ],
  'pharmacy-4': [
    { 
      id: 'p401', 
      name: 'Ibuprofen 400mg', 
      price: 7.99,
      category: 'pharmacy',
      productCategory: 'Pain Relief',
      description: 'Anti-inflammatory pain relief',
      manufacturer: 'City Pharma',
      prescription: false
    },
    { 
      id: 'p402', 
      name: 'Multivitamin Tablets', 
      price: 18.99,
      category: 'pharmacy',
      productCategory: 'Vitamins',
      description: 'Complete daily multivitamin',
      manufacturer: 'VitaCare',
      prescription: false
    },
  ],
  'pharmacy-5': [
    { 
      id: 'p501', 
      name: 'Aspirin 100mg', 
      price: 6.50,
      category: 'pharmacy',
      productCategory: 'Pain Relief',
      description: 'Blood thinner and pain relief',
      manufacturer: 'Health First',
      prescription: false
    },
    { 
      id: 'p502', 
      name: 'Vitamin B12', 
      price: 22.99,
      category: 'pharmacy',
      productCategory: 'Vitamins',
      description: 'Energy and nerve health',
      manufacturer: 'Health First',
      prescription: false
    },
    { 
      id: 'p503', 
      name: 'Metformin 500mg', 
      price: 35.99,
      category: 'pharmacy',
      productCategory: 'Diabetes Care',
      description: 'Diabetes medication',
      manufacturer: 'Health First',
      prescription: true
    },
  ],
  'pharmacy-6': [
    { 
      id: 'p601', 
      name: 'Loratadine 10mg', 
      price: 9.99,
      category: 'pharmacy',
      productCategory: 'Allergy',
      description: 'Non-drowsy allergy relief',
      manufacturer: 'MediCare',
      prescription: false
    },
    { 
      id: 'p602', 
      name: 'Iron Supplements', 
      price: 16.50,
      category: 'pharmacy',
      productCategory: 'Supplements',
      description: 'Iron deficiency treatment',
      manufacturer: 'MediCare',
      prescription: false
    },
  ],
  'pharmacy-8': [
    { 
      id: 'p801', 
      name: 'Melatonin 3mg', 
      price: 14.99,
      category: 'pharmacy',
      productCategory: 'Sleep & Relaxation',
      description: 'Natural sleep aid',
      manufacturer: 'Wellness',
      prescription: false
    },
    { 
      id: 'p802', 
      name: 'Omega-3 Fish Oil', 
      price: 28.99,
      category: 'pharmacy',
      productCategory: 'Supplements',
      description: 'Heart and brain health',
      manufacturer: 'Wellness',
      prescription: false
    },
  ],
};

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
      type: 'pharmacy'
    });
    setProducts(pharmacyProducts[storeId] || []);
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
    <SafeAreaView style={styles.container}>
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