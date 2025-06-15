import React from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  ScrollView, 
  Animated,
  TouchableOpacity,
  Image,
  Platform
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { StackNavigationProp } from '@react-navigation/stack';
import CategoryCard from './CategoryCard';

type GroceryNavigationProp = StackNavigationProp<RootStackParamList, 'AllProducts'>;

interface GrocerySectionProps {
  scrollY: Animated.Value;
  storeId?: string;
}

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
  subCategories: SubCategory[];
  image: string;
}

const groceryData: Category[] = [
  {
    id: '1',
    name: 'Fresh Produce',
    image: 'https://cdn.pixabay.com/photo/2017/10/09/19/29/eat-2834549_1280.jpg',
    subCategories: [
      {
        id: '1-1',
        name: 'Fruits',
        products: [
          { 
            id: '1-1-1', 
            name: 'Organic Apples', 
            price: 2.99, 
            image: 'https://cdn.pixabay.com/photo/2016/01/05/13/58/apple-1122537_1280.jpg',
            description: 'Fresh organic apples from local farms.',
            brand: 'Local Farms'
          },
          { 
            id: '1-1-2', 
            name: 'Bananas', 
            price: 1.99, 
            image: 'https://cdn.pixabay.com/photo/2017/06/27/22/21/banana-2449019_1280.jpg',
            description: 'Ripe bananas, great for smoothies.',
            brand: 'Dole'
          },
        ],
        brands: ['Local Farms', 'Dole', 'Chiquita']
      },
      {
        id: '1-2',
        name: 'Vegetables',
        products: [
          { 
            id: '1-2-1', 
            name: 'Carrots', 
            price: 1.49, 
            image: 'https://cdn.pixabay.com/photo/2014/12/21/23/39/carrots-575773_1280.jpg',
            description: 'Fresh crunchy carrots.',
            brand: 'Local Farms'
          },
          { 
            id: '1-2-2', 
            name: 'Organic Broccoli', 
            price: 2.49, 
            image: 'https://cdn.pixabay.com/photo/2016/03/05/19/02/broccoli-1238250_1280.jpg',
            description: 'Organic broccoli florets.',
            brand: 'Organic Valley'
          },
        ],
        brands: ['Local Farms', 'Organic Valley', 'Green Giant']
      },
    ],
  },
  {
    id: '2',
    name: 'Snacks & Beverages',
    image: 'https://cdn.pixabay.com/photo/2016/11/29/09/38/adult-1868750_1280.jpg',
    subCategories: [
      {
        id: '2-1',
        name: 'Chocolates & Sweets',
        products: [
          { 
            id: '2-1-1', 
            name: 'Dark Chocolate', 
            price: 3.99, 
            image: 'https://cdn.pixabay.com/photo/2017/01/11/11/33/cake-1971552_1280.jpg',
            description: 'Rich dark chocolate.',
            brand: 'Cadbury'
          },
          { 
            id: '2-1-2', 
            name: 'Sugar Free Sweets', 
            price: 4.99, 
            image: 'https://cdn.pixabay.com/photo/2017/01/11/11/33/cake-1971552_1280.jpg',
            description: 'Delicious sugar-free sweets.',
            brand: 'Sugar Free'
          },
        ],
        brands: ['Cadbury', 'Sugar Free', 'Hershey\'s', 'Nestle']
      },
      {
        id: '2-2',
        name: 'Beverages',
        products: [
          { 
            id: '2-2-1', 
            name: 'Green Tea', 
            price: 2.99, 
            image: 'https://cdn.pixabay.com/photo/2017/06/29/20/09/mint-2455930_1280.jpg',
            description: 'Refreshing green tea.',
            brand: 'Lipton'
          },
          { 
            id: '2-2-2', 
            name: 'Fruit Juice', 
            price: 3.49, 
            image: 'https://cdn.pixabay.com/photo/2017/06/29/20/09/mint-2455930_1280.jpg',
            description: 'Fresh fruit juice.',
            brand: 'Tropicana'
          },
        ],
        brands: ['Lipton', 'Tropicana', 'Coca-Cola', 'Pepsi']
      },
    ],
  },
  {
    id: '3',
    name: 'Dairy & Eggs',
    image: 'https://cdn.pixabay.com/photo/2017/07/05/15/41/milk-2474993_1280.jpg',
    subCategories: [
      {
        id: '3-1',
        name: 'Milk & Cream',
        products: [
          { 
            id: '3-1-1', 
            name: 'Organic Whole Milk', 
            price: 3.49, 
            image: 'https://cdn.pixabay.com/photo/2017/07/05/15/41/milk-2474993_1280.jpg',
            description: 'Creamy organic whole milk.',
            brand: 'Organic Valley'
          },
          { 
            id: '3-1-2', 
            name: 'Almond Milk', 
            price: 2.99, 
            image: 'https://cdn.pixabay.com/photo/2017/06/27/08/24/almond-milk-2446393_1280.jpg',
            description: 'Unsweetened almond milk.',
            brand: 'Silk'
          },
        ],
        brands: ['Organic Valley', 'Silk', 'Horizon']
      },
    ],
  },
];

const GrocerySection: React.FC<GrocerySectionProps> = ({ scrollY, storeId }) => {
  const { theme } = useTheme();
  const navigation = useNavigation<GroceryNavigationProp>();

  const handleCategoryPress = (category: Category) => {
    navigation.navigate('CategoryDetail', { 
      category
    });
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    title: {
      fontSize: 28,
      fontWeight: '800',
      color: theme.colors.text,
      margin: 16,
      marginBottom: 8,
    },
    categoryContainer: {
      padding: 16,
    },
    categoryCard: {
      marginBottom: 16,
      borderRadius: 12,
      overflow: 'hidden',
      backgroundColor: theme.colors.surface,
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
    categoryImage: {
      width: '100%',
      height: 150,
      resizeMode: 'cover',
    },
    categoryContent: {
      padding: 16,
    },
    categoryName: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 8,
    },
    subCategoryCount: {
      fontSize: 14,
      color: theme.colors.secondary,
    },
  });

  return (
    <ScrollView 
      style={styles.container}
      scrollEventThrottle={16}
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } }}],
        { useNativeDriver: false }
      )}
    >
      <Text style={styles.title}>Categories</Text>
      <View style={styles.categoryContainer}>
        {groceryData.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={styles.categoryCard}
            onPress={() => handleCategoryPress(category)}
          >
            <Image 
              source={{ uri: category.image }} 
              style={styles.categoryImage}
            />
            <View style={styles.categoryContent}>
              <Text style={styles.categoryName}>{category.name}</Text>
              <Text style={styles.subCategoryCount}>
                {category.subCategories.length} subcategories
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

export default GrocerySection;