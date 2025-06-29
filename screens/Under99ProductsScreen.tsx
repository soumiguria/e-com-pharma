import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ProductCard from '../components/ProductCard';

type Under99ProductsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Under99Products'>;

// Mock products under ₹99
const mockUnder99Products = [
  {
    id: '1',
    name: 'Bananas',
    price: 0.99,
    image: 'https://images.pexels.com/photos/47305/bananas-banana-bunch-yellow-47305.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'grocery' as const,
  },
  {
    id: '2',
    name: 'Onions',
    price: 0.79,
    image: 'https://images.pexels.com/photos/144206/pexels-photo-144206.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'grocery' as const,
  },
  {
    id: '3',
    name: 'Tomatoes',
    price: 0.89,
    image: 'https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'grocery' as const,
  },
  {
    id: '4',
    name: 'Potatoes',
    price: 0.69,
    image: 'https://images.pexels.com/photos/144206/pexels-photo-144206.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'grocery' as const,
  },
  {
    id: '5',
    name: 'Carrots',
    price: 0.59,
    image: 'https://images.pexels.com/photos/144206/pexels-photo-144206.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'grocery' as const,
  },
  {
    id: '6',
    name: 'Cucumber',
    price: 0.49,
    image: 'https://images.pexels.com/photos/144206/pexels-photo-144206.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'grocery' as const,
  },
  {
    id: '7',
    name: 'Lemon',
    price: 0.39,
    image: 'https://images.pexels.com/photos/144206/pexels-photo-144206.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'grocery' as const,
  },
  {
    id: '8',
    name: 'Garlic',
    price: 0.29,
    image: 'https://images.pexels.com/photos/144206/pexels-photo-144206.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'grocery' as const,
  },
];

const Under99ProductsScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<Under99ProductsScreenNavigationProp>();

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
          <Text style={styles.headerTitle}>Under ₹99</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.productsGrid}>
            {mockUnder99Products.map((product) => (
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
      </View>
    </SafeAreaView>
  );
};

export default Under99ProductsScreen; 