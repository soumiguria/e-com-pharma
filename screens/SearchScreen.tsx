import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  SafeAreaView,
  TextInput,
  ScrollView,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ProductCard from '../components/ProductCard';

type SearchScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SearchScreen'>;

// Mock data
const mockRecentSearches = [
  'apples',
  'milk',
  'bread',
  'chicken',
  'rice',
];

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
];

const mockUnder99Products = [
  {
    id: '4',
    name: 'Bananas',
    price: 0.99,
    image: 'https://images.pexels.com/photos/47305/bananas-banana-bunch-yellow-47305.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'grocery' as const,
  },
  {
    id: '5',
    name: 'Onions',
    price: 0.79,
    image: 'https://images.pexels.com/photos/144206/pexels-photo-144206.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'grocery' as const,
  },
  {
    id: '6',
    name: 'Tomatoes',
    price: 0.89,
    image: 'https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'grocery' as const,
  },
];

const mockUnder199Products = [
  {
    id: '7',
    name: 'Chicken Breast',
    price: 8.99,
    image: 'https://images.pexels.com/photos/3997388/pexels-photo-3997388.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'grocery' as const,
  },
  {
    id: '8',
    name: 'Rice 1kg',
    price: 3.99,
    image: 'https://images.pexels.com/photos/4110225/pexels-photo-4110225.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'grocery' as const,
  },
  {
    id: '9',
    name: 'Cooking Oil',
    price: 4.99,
    image: 'https://images.pexels.com/photos/4110225/pexels-photo-4110225.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'grocery' as const,
  },
];

const SearchScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<SearchScreenNavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState(mockRecentSearches);

  const handleSearch = (query: string) => {
    if (query.trim()) {
      // Add to recent searches if not already present
      if (!recentSearches.includes(query.toLowerCase())) {
        setRecentSearches([query.toLowerCase(), ...recentSearches.slice(0, 4)]);
      }
      // Navigate to search results
      navigation.navigate('SearchResults' as any, { query });
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
  };

  const removeRecentSearch = (search: string) => {
    setRecentSearches(recentSearches.filter(s => s !== search));
  };

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
    searchContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: 24,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: theme.colors.text,
      marginLeft: 8,
    },
    searchButton: {
      padding: 8,
      backgroundColor: theme.colors.primary,
      borderRadius: 20,
      marginLeft: 8,
    },
    content: {
      flex: 1,
      padding: 16,
    },
    section: {
      marginBottom: 24,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    clearButton: {
      padding: 4,
    },
    clearButtonText: {
      fontSize: 14,
      color: theme.colors.primary,
      fontWeight: '600',
    },
    recentSearchesGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    recentSearchChip: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 8,
      backgroundColor: theme.colors.surface,
      borderRadius: 8,
      marginBottom: 8,
    },
    recentSearchChipText: {
      fontSize: 16,
      color: theme.colors.text,
      marginLeft: 8,
    },
    removeButton: {
      padding: 4,
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
    viewAllButton: {
      alignItems: 'center',
      paddingVertical: 12,
      marginTop: 8,
    },
    viewAllText: {
      fontSize: 14,
      color: theme.colors.primary,
      fontWeight: '600',
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginVertical: 16,
    },
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header with Search */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <MaterialIcons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={theme.colors.text + '80'} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search products..."
              placeholderTextColor={theme.colors.text + '80'}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={() => handleSearch(searchQuery)}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                style={styles.searchButton}
              >
                <MaterialIcons name="search" size={16} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Searches</Text>
                <TouchableOpacity onPress={clearRecentSearches}>
                  <Text style={styles.clearButtonText}>Clear All</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.recentSearchesGrid}>
                {recentSearches.map((search, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.recentSearchChip}
                    onPress={() => handleSearch(search)}
                  >
                    <MaterialIcons name="history" size={16} color={theme.colors.secondary} />
                    <Text style={styles.recentSearchChipText}>{search}</Text>
                    <TouchableOpacity
                      onPress={() => removeRecentSearch(search)}
                      style={styles.removeButton}
                    >
                      <MaterialIcons name="close" size={16} color={theme.colors.secondary} />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <View style={styles.divider} />

          {/* Saved Products */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Saved Products</Text>
              <TouchableOpacity onPress={() => navigation.navigate('SavedProducts' as any)}>
                <Text style={styles.clearButtonText}>View All</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.productsGrid}>
              {mockSavedProducts.slice(0, 4).map((product) => (
                <View key={product.id} style={styles.productCard}>
                  <ProductCard
                    product={product}
                    onPress={() => handleProductPress(product)}
                    compact={true}
                  />
                </View>
              ))}
            </View>
          </View>

          <View style={styles.divider} />

          {/* Under ₹99 */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Under ₹99</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Under99Products' as any)}>
                <Text style={styles.clearButtonText}>View All</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.productsGrid}>
              {mockUnder99Products.slice(0, 4).map((product) => (
                <View key={product.id} style={styles.productCard}>
                  <ProductCard
                    product={product}
                    onPress={() => handleProductPress(product)}
                    compact={true}
                  />
                </View>
              ))}
            </View>
          </View>

          <View style={styles.divider} />

          {/* Under ₹199 */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Under ₹199</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Under199Products' as any)}>
                <Text style={styles.clearButtonText}>View All</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.productsGrid}>
              {mockUnder199Products.slice(0, 4).map((product) => (
                <View key={product.id} style={styles.productCard}>
                  <ProductCard
                    product={product}
                    onPress={() => handleProductPress(product)}
                    compact={true}
                  />
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default SearchScreen; 