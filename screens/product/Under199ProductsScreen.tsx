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

type Under199ProductsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Under199Products'>;

// Mock products under ₹199
const mockUnder199Products = [
  {
    id: '1',
    name: 'Chicken Breast',
    price: 8.99,
    image: 'https://images.pexels.com/photos/3997388/pexels-photo-3997388.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'grocery' as const,
  },
  {
    id: '2',
    name: 'Rice 1kg',
    price: 3.99,
    image: 'https://images.pexels.com/photos/4110225/pexels-photo-4110225.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'grocery' as const,
  },
  {
    id: '3',
    name: 'Cooking Oil',
    price: 4.99,
    image: 'https://images.pexels.com/photos/4110225/pexels-photo-4110225.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'grocery' as const,
  },
  {
    id: '4',
    name: 'Organic Apples',
    price: 2.99,
    image: 'https://images.pexels.com/photos/2093087/pexels-photo-2093087.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'grocery' as const,
  },
  {
    id: '5',
    name: 'Fresh Milk',
    price: 3.49,
    image: 'https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'grocery' as const,
  },
  {
    id: '6',
    name: 'Whole Grain Bread',
    price: 1.99,
    image: 'https://images.pexels.com/photos/1721934/pexels-photo-1721934.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'grocery' as const,
  },
  {
    id: '7',
    name: 'Fresh Vegetables',
    price: 4.99,
    image: 'https://images.pexels.com/photos/2518893/pexels-photo-2518893.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'grocery' as const,
  },
  {
    id: '8',
    name: 'Pasta',
    price: 2.49,
    image: 'https://images.pexels.com/photos/4110225/pexels-photo-4110225.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'grocery' as const,
  },
  {
    id: '9',
    name: 'Cheese',
    price: 5.99,
    image: 'https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'grocery' as const,
  },
  {
    id: '10',
    name: 'Yogurt',
    price: 1.99,
    image: 'https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'grocery' as const,
  },
];

const Under199ProductsScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<Under199ProductsScreenNavigationProp>();

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
          <Text style={styles.headerTitle}>Under ₹199</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.productsGrid}>
            {mockUnder199Products.map((product) => (
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

export default Under199ProductsScreen; 