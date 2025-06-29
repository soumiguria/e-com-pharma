import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ProductCard from '../../components/product/ProductCard';

type SavedProductsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SavedProducts'>;

// Mock saved products data
const mockSavedProducts = [
  {
    id: '1',
    name: 'Organic Apples',
    price: 2.99,
    image: 'https://images.pexels.com/photos/2093087/pexels-photo-2093087.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'grocery' as const,
  },
  {
    id: '2',
    name: 'Fresh Milk',
    price: 3.49,
    image: 'https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'grocery' as const,
  },
  {
    id: '3',
    name: 'Whole Grain Bread',
    price: 1.99,
    image: 'https://images.pexels.com/photos/1721934/pexels-photo-1721934.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'grocery' as const,
  },
  {
    id: '4',
    name: 'Fresh Vegetables',
    price: 4.99,
    image: 'https://images.pexels.com/photos/2518893/pexels-photo-2518893.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'grocery' as const,
  },
  {
    id: '5',
    name: 'Chicken Breast',
    price: 8.99,
    image: 'https://images.pexels.com/photos/3997388/pexels-photo-3997388.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'grocery' as const,
  },
  {
    id: '6',
    name: 'Rice 1kg',
    price: 3.99,
    image: 'https://images.pexels.com/photos/4110225/pexels-photo-4110225.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'grocery' as const,
  },
];

const SavedProductsScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<SavedProductsScreenNavigationProp>();

  const handleProductPress = (product: any) => {
    navigation.navigate('ProductDetail', { product });
  };

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    container: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    backButton: {
      padding: 8,
      marginRight: 12,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    content: {
      flex: 1,
      padding: 16,
    },
    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyText: {
      fontSize: 16,
      color: theme.colors.secondary,
      textAlign: 'center',
      marginTop: 16,
    },
    productsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    productCard: {
      width: '48%',
      marginBottom: 12,
    },
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <MaterialIcons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Your Saved Products</Text>
        </View>

        <View style={styles.content}>
          {mockSavedProducts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="favorite-border" size={64} color={theme.colors.secondary} />
              <Text style={styles.emptyText}>No saved products yet</Text>
            </View>
          ) : (
            <View style={styles.productsGrid}>
              {mockSavedProducts.map((product) => (
                <View key={product.id} style={styles.productCard}>
                  <ProductCard
                    product={product}
                    onPress={() => handleProductPress(product)}
                    compact={true}
                  />
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default SavedProductsScreen; 