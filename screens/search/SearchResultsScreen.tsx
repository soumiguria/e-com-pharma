import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ProductCard from '../../components/product/ProductCard';

type SearchResultsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SearchResults'>;

// Mock search results data
const mockSearchResults = [
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
];

const SearchResultsScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<SearchResultsScreenNavigationProp>();
  const route = useRoute();
  const { query } = route.params as { query: string };

  // Filter results based on query
  const filteredResults = mockSearchResults.filter(product =>
    product.name.toLowerCase().includes(query.toLowerCase())
  );

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
    resultsCount: {
      fontSize: 14,
      color: theme.colors.secondary,
      marginBottom: 16,
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
    noResultsContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    noResultsText: {
      fontSize: 16,
      color: theme.colors.secondary,
      textAlign: 'center',
      marginTop: 16,
    },
    addButton: {
      position: 'absolute',
      bottom: 8,
      right: 8,
      minWidth: 54,
      height: 28,
      borderRadius: 6,
      borderWidth: 1.5,
      borderColor: '#27ae60',
      backgroundColor: '#fff',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 12,
      shadowColor: 'rgba(39, 174, 96, 0.08)',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 2,
      elevation: 1,
    },
    addButtonText: {
      color: '#27ae60',
      fontWeight: 'bold',
      fontSize: 14,
      letterSpacing: 0.5,
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
          <Text style={styles.headerTitle}>Search Results</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.resultsCount}>
            {filteredResults.length} results for "{query}"
          </Text>
          
          {filteredResults.length === 0 ? (
            <View style={styles.noResultsContainer}>
              <MaterialIcons name="search-off" size={64} color={theme.colors.secondary} />
              <Text style={styles.noResultsText}>No products found for "{query}"</Text>
            </View>
          ) : (
            <View style={styles.productsGrid}>
              {filteredResults.map((product) => (
                <TouchableOpacity
                  key={product.id}
                  style={{
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
                  }}
                  onPress={() => handleProductPress(product)}
                  activeOpacity={0.88}
                >
                  <Image source={{ uri: product.image }} style={{ width: 90, height: 90, borderRadius: 12, marginBottom: 10, backgroundColor: '#f7f7f7' }} />
                  <Text style={{ fontSize: 15, fontWeight: '700', color: theme.colors.text, marginBottom: 6, textAlign: 'center', lineHeight: 18 }} numberOfLines={2}>{product.name}</Text>
                  <Text style={{ fontSize: 16, color: theme.colors.primary, fontWeight: 'bold', textAlign: 'center', marginBottom: 4 }}>₹{product.price.toFixed(2)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default SearchResultsScreen; 