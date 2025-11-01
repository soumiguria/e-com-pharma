import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ProductCard from '../../components/product/ProductCard';
import SearchBar from '../../components/ui/SearchBar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppContext } from '../../contexts/AppContext';
import storeService from '../../services/api/storeService';

type SearchScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SearchScreen'>;

interface SearchResult {
  categories: any[];
  subcategories: any[];
  products: any[];
}

const SearchScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<SearchScreenNavigationProp>();
  const { selectedStore } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Load search history from local storage
  useEffect(() => {
    const loadSearchHistory = async () => {
      try {
        const savedSearches = await AsyncStorage.getItem('searchHistory');
        if (savedSearches) {
          setRecentSearches(JSON.parse(savedSearches));
        }
      } catch (error) {
        console.error('Error loading search history:', error);
      }
    };
    loadSearchHistory();
  }, []);

  // Save search history to local storage
  const saveSearchHistory = async (searches: string[]) => {
    try {
      await AsyncStorage.setItem('searchHistory', JSON.stringify(searches));
    } catch (error) {
      console.error('Error saving search history:', error);
    }
  };

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (!query.trim() || !selectedStore?.id) {
        setSearchResults(null);
        setSearchError(null);
        return;
      }

      try {
        setIsSearching(true);
        setSearchError(null);
        console.log('🔍 Searching for:', query, 'in store:', selectedStore.id);
        
        const response = await storeService.searchStoreProducts(selectedStore.id, query);
        
        console.log('🔍 Full API response:', JSON.stringify(response, null, 2));
        
        if (response.success && response.data) {
          console.log('🔍 Search results data:', JSON.stringify(response.data, null, 2));
          // Support both shapes: { data: {...} } and { data: { data: {...} } }
          const searchData = (response as any)?.data?.data ?? response.data;
          console.log('🔍 Processed search data:', JSON.stringify(searchData, null, 2));
          
          // Log detailed breakdown
          console.log('📊 === SEARCH RESULTS BREAKDOWN ===');
          console.log('📊 Categories:', searchData.categories?.length || 0);
          if (searchData.categories?.length > 0) {
            console.log('📊 Category names:', searchData.categories.map((c: any) => c.name));
          }
          console.log('📊 Subcategories:', searchData.subcategories?.length || 0);
          if (searchData.subcategories?.length > 0) {
            console.log('📊 Subcategory names:', searchData.subcategories.map((s: any) => s.name));
          }
          console.log('📊 Products:', searchData.products?.length || 0);
          if (searchData.products?.length > 0) {
            console.log('📊 Product names:', searchData.products.map((p: any) => p.name));
          }
          console.log('📊 === END BREAKDOWN ===');
          
          setSearchResults(searchData);
        } else {
          console.error('❌ Search failed:', response.error);
          setSearchError(response.error || 'Search failed');
          setSearchResults(null);
        }
      } catch (error) {
        console.error('❌ Search error:', error);
        setSearchError('Failed to search products');
        setSearchResults(null);
      } finally {
        setIsSearching(false);
      }
    }, 500),
    [selectedStore?.id]
  );

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    // Only trigger search, don't add to history yet
    debouncedSearch(query);
  };

  const handleSearchSubmit = (query: string) => {
    console.log('🔍 Search submitted:', query);
    
    if (query.trim()) {
      const trimmedQuery = query.trim().toLowerCase();
      // Add to recent searches if not already present
      if (!recentSearches.includes(trimmedQuery)) {
        const newSearches = [trimmedQuery, ...recentSearches.slice(0, 4)];
        setRecentSearches(newSearches);
        saveSearchHistory(newSearches);
        console.log('🔍 Added to search history:', trimmedQuery);
      }
    }
    
    // Trigger search
    debouncedSearch(query);
  };

  const handleSearchResultTap = (searchTerm: string) => {
    console.log('🔍 Search result tapped:', searchTerm);
    
    // Add to search history when user taps on a result
    if (searchTerm.trim()) {
      const trimmedQuery = searchTerm.trim().toLowerCase();
      if (!recentSearches.includes(trimmedQuery)) {
        const newSearches = [trimmedQuery, ...recentSearches.slice(0, 4)];
        setRecentSearches(newSearches);
        saveSearchHistory(newSearches);
        console.log('🔍 Added to search history from result tap:', trimmedQuery);
      }
    }
  };

  // Debounce utility function
  function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  const clearRecentSearches = async () => {
    setRecentSearches([]);
    await saveSearchHistory([]);
  };

  const removeRecentSearch = async (search: string) => {
    const newSearches = recentSearches.filter(s => s !== search);
    setRecentSearches(newSearches);
    await saveSearchHistory(newSearches);
  };

  const handleProductPress = (product: any) => {
    console.log('🔍 Navigating to product:', product.name, 'ID:', product._id || product.productId);
    console.log('🔍 Product details for navigation:', {
      productId: product.productId,
      productMasterId: product.productMasterId,
      _id: product._id,
      name: product.name
    });
    
    // Add current search query to history since user tapped on a result
    handleSearchResultTap(searchQuery);
    
    // Use the actual productId from API response for navigation
    // The API expects the productId field, not _id or productMasterId
    const actualProductId = product.productId;
    
    if (!actualProductId) {
      console.error('❌ No productId found in search result:', product);
      return;
    }
    
    console.log('🔍 Product ID mapping:', {
      fromSearch: product.productId,
      _id: product._id,
      productMasterId: product.productMasterId,
      finalId: actualProductId,
      productName: product.name
    });
    
    // Transform API product to expected format for ProductDetailScreen
    const transformedProduct = {
      id: actualProductId, // Use the actual productId from API
      name: product.name,
      price: parseFloat(product.sp || product.mrp || '0'),
      image: product.image || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=200&fit=crop&crop=center',
      category: selectedStore?.type || 'grocery',
      description: product.description || '',
      productId: actualProductId, // Use the same ID for consistency
      // Add additional product details
      brand: product.brand || '',
      availableQty: product.quantity || 0,
      variants: product.variants || [],
      images: product.images || [product.image || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=200&fit=crop&crop=center'],
      originalPrice: parseFloat(product.mrp || '0'),
      // API specific fields
      _id: product._id,
      productMasterId: product.productMasterId,
      storeId: product.storeId,
      status: product.status,
    };
    console.log('🔍 Transformed product for navigation:', transformedProduct);
    navigation.navigate('ProductDetail', { product: transformedProduct });
  };

  const handleCategoryPress = async (category: any) => {
    console.log('🔍 Navigating to category:', category.name, 'ID:', category.categoryId);
    
    // Add current search query to history since user tapped on a result
    handleSearchResultTap(searchQuery);
    
      // Fetch subcategories and products for this category
      try {
        console.log('🔍 Fetching category details for:', category.categoryId);
        const categoryResponse = await storeService.getCategoryDetails(selectedStore?.id || '', category.categoryId);
        console.log('🔍 Category details API response:', JSON.stringify(categoryResponse, null, 2));
        
        if (categoryResponse.success && categoryResponse.data) {
          // Support both shapes
          const categoryData = (categoryResponse as any)?.data?.data ?? categoryResponse.data;
          console.log('🔍 Category details fetched:', JSON.stringify(categoryData, null, 2));
        
        navigation.navigate('CategoryDetail', { 
          category: {
            id: category.categoryId,
            name: category.name,
            description: category.description,
            image: category.image,
            _id: category._id,
            categoryERPId: category.categoryERPId,
            status: category.status,
            createdAt: category.createdAt,
            updatedAt: category.updatedAt,
            subCategories: categoryData.subcategories || [],
            products: categoryData.products || []
          }
        });
      } else {
        // Fallback if API fails - navigate with empty subcategories
        console.log('⚠️ Category details API failed, navigating with empty subcategories...');
        navigation.navigate('CategoryDetail', { 
          category: {
            id: category.categoryId,
            name: category.name,
            description: category.description,
            image: category.image,
            _id: category._id,
            categoryERPId: category.categoryERPId,
            status: category.status,
            createdAt: category.createdAt,
            updatedAt: category.updatedAt,
            subCategories: [], // Empty - CategoryDetailScreen will fetch only this category's subcategories
            products: [] // Empty - CategoryDetailScreen will fetch only this category's products
          }
        });
      }
    } catch (error) {
      console.error('🔍 Error fetching category details:', error);
      // Fallback navigation
      navigation.navigate('CategoryDetail', { 
        category: {
          id: category.categoryId,
          name: category.name,
          description: category.description,
          image: category.image,
          _id: category._id,
          categoryERPId: category.categoryERPId,
          status: category.status,
          createdAt: category.createdAt,
          updatedAt: category.updatedAt,
          subCategories: [],
          products: []
        }
      });
    }
  };

  const handleSubcategoryPress = async (subcategory: any) => {
    console.log('🔍 Navigating to subcategory:', subcategory.name, 'ID:', subcategory.subcategoryId);
    console.log('🔍 Parent category ID:', subcategory.categoryId);
    
    // Add current search query to history since user tapped on a result
    handleSearchResultTap(searchQuery);
    
    // Navigate directly to category page with only this specific subcategory
    // The CategoryDetailScreen will handle fetching products for this subcategory
    navigation.navigate('CategoryDetail', { 
      category: {
        id: subcategory.categoryId, // Parent category ID
        name: subcategory.categoryName || subcategory.category?.name || 'Products',
        description: subcategory.description || subcategory.category?.description,
        image: subcategory.image || subcategory.category?.image,
        _id: subcategory._id,
        categoryERPId: subcategory.categoryERPId,
        status: subcategory.status,
        createdAt: subcategory.createdAt,
        updatedAt: subcategory.updatedAt,
        subCategories: [], // Empty - CategoryDetailScreen will fetch subcategories
        products: [], // Empty - CategoryDetailScreen will fetch products for this subcategory
        selectedSubcategoryId: subcategory.subcategoryId // Pre-select this specific subcategory
      }
    });
  };

  const handleRecentSearchPress = (searchTerm: string) => {
    setSearchQuery(searchTerm);
    debouncedSearch(searchTerm);
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
      paddingTop: 30,
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
      minHeight: 220,
      backgroundColor: '#fff',
      borderRadius: 18,
      padding: 14,
      borderWidth: 1,
      borderColor: '#f0f0f0',
      elevation: 2,
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowRadius: 6,
      alignItems: 'center',
      justifyContent: 'flex-start',
      marginBottom: 16,
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
    searchResultsContainer: {
      flex: 1,
    },
    resultsCount: {
      fontSize: 14,
      color: theme.colors.secondary,
      marginBottom: 16,
      fontWeight: '500',
    },
    // Keep a single definition of sectionTitle
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 12,
      marginTop: 16,
    },
    categoryItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      backgroundColor: theme.colors.surface,
      borderRadius: 8,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    categoryImage: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#f0f0f0',
      marginRight: 12,
    },
    categoryText: {
      flex: 1,
      fontSize: 16,
      color: theme.colors.text,
      fontWeight: '500',
    },
    // Remove duplicate keys below; keep a single productsGrid/productCard definition
    loadingContainer: {
      padding: 20,
      alignItems: 'center',
    },
    loadingText: {
      fontSize: 14,
      color: theme.colors.secondary,
      marginTop: 8,
    },
    errorContainer: {
      padding: 20,
      alignItems: 'center',
    },
    errorText: {
      fontSize: 14,
      color: theme.colors.error,
      textAlign: 'center',
      marginTop: 8,
    },
    noResultsContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 40,
    },
    noResultsText: {
      fontSize: 16,
      color: theme.colors.secondary,
      textAlign: 'center',
      marginTop: 16,
    },
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* Header with Search */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <MaterialIcons name="arrow-back" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <SearchBar 
                onSearch={handleSearch}
                onSubmit={handleSearchSubmit}
                placeholder="Search for products, brands..."
                value={searchQuery}
              />
            </View>
          </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Show search results if searching or has results */}
          {searchQuery.trim() ? (
            <View style={styles.searchResultsContainer}>
              {/* Loading State */}
              {isSearching && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={theme.colors.primary} />
                  <Text style={styles.loadingText}>Searching for "{searchQuery}"...</Text>
                </View>
              )}

              {/* Error State */}
              {searchError && !isSearching && (
                <View style={styles.errorContainer}>
                  <MaterialIcons name="error-outline" size={48} color={theme.colors.error} />
                  <Text style={styles.errorText}>{searchError}</Text>
                </View>
              )}

              {/* Search Results */}
              {searchResults && !isSearching && (
                <>
                  {(() => {
                    console.log('🔍 Rendering search results:', JSON.stringify(searchResults, null, 2));
                    const totalResults = (searchResults.categories?.length || 0) + 
                                        (searchResults.subcategories?.length || 0) + 
                                        (searchResults.products?.length || 0);
                    
                    console.log('🔍 Total results count:', totalResults);
                    console.log('🔍 Categories count:', searchResults.categories?.length || 0);
                    console.log('🔍 Subcategories count:', searchResults.subcategories?.length || 0);
                    console.log('🔍 Products count:', searchResults.products?.length || 0);
                    
                    if (totalResults === 0) {
                      return (
                        <View style={styles.noResultsContainer}>
                          <MaterialIcons name="search-off" size={64} color={theme.colors.secondary} />
                          <Text style={styles.noResultsText}>No results found for "{searchQuery}"</Text>
                        </View>
                      );
                    }

                    return (
                      <>
                        <Text style={styles.resultsCount}>
                          {totalResults} results for "{searchQuery}"
                        </Text>
                        
                        {/* Categories */}
                        {searchResults.categories && searchResults.categories.length > 0 && (
                          <>
                            <Text style={styles.sectionTitle}>Categories</Text>
                            {searchResults.categories.map((category: any, index: number) => {
                              console.log(`🔍 Rendering category ${index}:`, JSON.stringify(category, null, 2));
                              const categoryImage = category.signedImage || category.image || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=200&fit=crop&crop=center';
                              
                              return (
                                <TouchableOpacity
                                  key={category._id || index}
                                  style={styles.categoryItem}
                                  onPress={() => handleCategoryPress(category)}
                                >
                                  <Image 
                                    source={{ uri: categoryImage }} 
                                    style={styles.categoryImage}
                                    resizeMode="cover"
                                  />
                                  <Text style={styles.categoryText}>{category.name}</Text>
                                  <MaterialIcons name="chevron-right" size={24} color={theme.colors.secondary} />
                                </TouchableOpacity>
                              );
                            })}
                          </>
                        )}

                        {/* Subcategories */}
                        {searchResults.subcategories && searchResults.subcategories.length > 0 && (
                          <>
                            <Text style={styles.sectionTitle}>Subcategories</Text>
                            {searchResults.subcategories.map((subcategory: any, index: number) => {
                              console.log(`🔍 Rendering subcategory ${index}:`, JSON.stringify(subcategory, null, 2));
                              const subcategoryImage = subcategory.signedImage || subcategory.image || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=200&fit=crop&crop=center';
                              
                              return (
                                <TouchableOpacity
                                  key={subcategory._id || index}
                                  style={styles.categoryItem}
                                  onPress={() => handleSubcategoryPress(subcategory)}
                                >
                                  <Image 
                                    source={{ uri: subcategoryImage }} 
                                    style={styles.categoryImage}
                                    resizeMode="cover"
                                  />
                                  <Text style={styles.categoryText}>{subcategory.name}</Text>
                                  <MaterialIcons name="chevron-right" size={24} color={theme.colors.secondary} />
                                </TouchableOpacity>
                              );
                            })}
                          </>
                        )}

                        {/* Products */}
                        {searchResults.products && searchResults.products.length > 0 && (
                          <>
                            <Text style={styles.sectionTitle}>Products</Text>
                            <View style={styles.productsGrid}>
                              {searchResults.products.map((product: any, index: number) => {
                                console.log(`🔍 Rendering product ${index}:`, JSON.stringify(product, null, 2));
                                const productImage = product.signedImage || product.image || 
                                  (Array.isArray(product.signedImages) && product.signedImages.length > 0 ? product.signedImages[0] : undefined) ||
                                  (Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : undefined) ||
                                  'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=200&fit=crop&crop=center';
                                
                                return (
                                  <TouchableOpacity
                                    key={product._id || product.productId || index}
                                    style={styles.productCard}
                                    onPress={() => handleProductPress(product)}
                                    activeOpacity={0.88}
                                  >
                                    <Image 
                                      source={{ uri: productImage }} 
                                      style={{ width: 90, height: 90, borderRadius: 12, marginBottom: 10, backgroundColor: '#f7f7f7' }} 
                                    />
                                    <Text style={{ fontSize: 15, fontWeight: '700', color: theme.colors.text, marginBottom: 6, textAlign: 'center', lineHeight: 18 }} numberOfLines={2}>
                                      {product.name}
                                    </Text>
                                    <Text style={{ fontSize: 12, color: theme.colors.secondary, textAlign: 'center', marginBottom: 4 }}>
                                      {product.manufacturer || 'Generic'}
                                    </Text>
                                    <Text style={{ fontSize: 14, color: theme.colors.primary, fontWeight: 'bold', textAlign: 'center' }}>
                                      ₹{parseFloat(product.sp || product.mrp || '0').toFixed(2)}
                                    </Text>
                                  </TouchableOpacity>
                                );
                              })}
                            </View>
                          </>
                        )}
                      </>
                    );
                  })()}
                </>
              )}
            </View>
          ) : (
            /* Show recent searches when not searching */
            <>
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
                        onPress={() => handleRecentSearchPress(search)}
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
            </>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default SearchScreen; 