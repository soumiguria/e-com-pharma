// GrocerySection.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  ScrollView, 
  Animated,
  TouchableOpacity,
  Image
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import ProductCard from './ProductCard';
import CategoryCard from './CategoryCard';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
}

interface SubCategory {
  id: string;
  name: string;
  products: Product[];
}

interface Category {
  id: string;
  name: string;
  subCategories: SubCategory[];
}

const groceryData: Category[] = [
  {
    id: '1',
    name: 'Fresh Produce',
    subCategories: [
      {
        id: '1-1',
        name: 'Fruits',
        products: [
          { id: '1-1-1', name: 'Organic Apples', price: 2.99, image: 'https://cdn.pixabay.com/photo/2016/01/05/13/58/apple-1122537_1280.jpg' },
          { id: '1-1-2', name: 'Bananas', price: 1.99, image: 'https://cdn.pixabay.com/photo/2017/06/27/22/21/banana-2449019_1280.jpg' },
          { id: '1-1-3', name: 'Strawberries', price: 3.49, image: 'https://cdn.pixabay.com/photo/2018/04/29/11/54/strawberries-3359755_1280.jpg' },
          { id: '1-1-4', name: 'Grapes', price: 4.99, image: 'https://cdn.pixabay.com/photo/2016/07/22/09/59/grapes-1535080_1280.jpg' },
        ],
      },
      {
        id: '1-2',
        name: 'Vegetables',
        products: [
          { id: '1-2-1', name: 'Carrots', price: 1.49, image: 'https://cdn.pixabay.com/photo/2014/12/21/23/39/carrots-575773_1280.jpg' },
          { id: '1-2-2', name: 'Organic Broccoli', price: 2.49, image: 'https://cdn.pixabay.com/photo/2016/03/05/19/02/broccoli-1238250_1280.jpg' },
          { id: '1-2-3', name: 'Bell Peppers', price: 1.99, image: 'https://cdn.pixabay.com/photo/2016/08/11/08/43/bell-pepper-1585363_1280.jpg' },
          { id: '1-2-4', name: 'Tomatoes', price: 2.29, image: 'https://cdn.pixabay.com/photo/2011/03/16/15/45/tomatoes-5392_1280.jpg' },
        ],
      },
    ],
  },
  {
    id: '2',
    name: 'Dairy & Eggs',
    subCategories: [
      {
        id: '2-1',
        name: 'Milk & Cream',
        products: [
          { id: '2-1-1', name: 'Organic Whole Milk', price: 3.49, image: 'https://cdn.pixabay.com/photo/2017/07/05/15/41/milk-2474993_1280.jpg' },
          { id: '2-1-2', name: 'Almond Milk', price: 2.99, image: 'https://cdn.pixabay.com/photo/2017/06/27/08/24/almond-milk-2446393_1280.jpg' },
          { id: '2-1-3', name: 'Heavy Cream', price: 2.99, image: 'https://cdn.pixabay.com/photo/2017/06/27/08/24/almond-milk-2446393_1280.jpg' },
        ],
      },
      {
        id: '2-2',
        name: 'Cheese',
        products: [
          { id: '2-2-1', name: 'Cheddar Cheese', price: 4.99, image: 'https://cdn.pixabay.com/photo/2016/01/22/02/13/cheese-1155136_1280.jpg' },
          { id: '2-2-2', name: 'Mozzarella', price: 5.49, image: 'https://cdn.pixabay.com/photo/2017/05/23/17/54/cheese-2338650_1280.jpg' },
          { id: '2-2-3', name: 'Parmesan', price: 6.99, image: 'https://cdn.pixabay.com/photo/2015/09/05/23/18/cheese-926311_1280.jpg' },
        ],
      },
    ],
  },
  {
    id: '3',
    name: 'Bakery',
    subCategories: [
      {
        id: '3-1',
        name: 'Bread',
        products: [
          { id: '3-1-1', name: 'Sourdough', price: 4.49, image: 'https://cdn.pixabay.com/photo/2014/07/22/09/59/bread-399286_1280.jpg' },
          { id: '3-1-2', name: 'Whole Wheat', price: 3.99, image: 'https://cdn.pixabay.com/photo/2014/07/22/09/59/bread-399286_1280.jpg' },
        ],
      },
    ],
  },
];

const GrocerySection = ({ scrollY }: { scrollY: Animated.Value }) => {
  const { theme } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(groceryData[0]);

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
    subCategoryTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.text,
      marginHorizontal: 16,
      marginTop: 24,
      marginBottom: 12,
    },
    categoryContainer: {
      paddingLeft: 16,
      paddingBottom: 8,
    },
    
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      marginBottom: 12,
    },
    seeAll: {
      color: theme.colors.primary,
      fontSize: 14,
      fontWeight: '600',
    },
    featuredCard: {
      width: 280,
      height: 160,
      borderRadius: 12,
      margin: 8,
      overflow: 'hidden',
      position: 'relative',
    },
    featuredImage: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    featuredOverlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: 12,
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    featuredText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: '700',
    },
    featuredSubtext: {
      color: '#fff',
      fontSize: 14,
    },
    productContainer: {
      paddingLeft: 16,
      paddingRight: 16,
      paddingBottom: 24,
    },
    productCard: {
      width: 160,
      marginRight: 12, // Space between cards
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
      <Text style={styles.title}>Grocery</Text>
      
      {/* Featured Items */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.subCategoryTitle, { marginTop: 0 }]}>Featured</Text>
        <TouchableOpacity>
          <Text style={styles.seeAll}>See all</Text>
        </TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <TouchableOpacity style={styles.featuredCard}>
          <Image 
            source={{ uri: 'https://cdn.pixabay.com/photo/2017/06/02/18/24/fruit-2367029_1280.jpg' }} 
            style={styles.featuredImage}
          />
          <View style={styles.featuredOverlay}>
            <Text style={styles.featuredText}>Organic Fruits</Text>
            <Text style={styles.featuredSubtext}>Fresh from local farms</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.featuredCard}>
          <Image 
            source={{ uri: 'https://cdn.pixabay.com/photo/2017/10/09/19/29/eat-2834549_1280.jpg' }} 
            style={styles.featuredImage}
          />
          <View style={styles.featuredOverlay}>
            <Text style={styles.featuredText}>Dairy Specials</Text>
            <Text style={styles.featuredSubtext}>Up to 20% off</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* Categories */}
      <Text style={styles.subCategoryTitle}>Categories</Text>
      <FlatList
        data={groceryData}
        renderItem={({ item }) => (
          <CategoryCard
            category={item}
            isSelected={selectedCategory?.id === item.id}
            onPress={() => setSelectedCategory(item)}
          />
        )}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryContainer}
      />

      {/* Products */}
      {selectedCategory && (
        <View>
          {selectedCategory.subCategories.map((subCategory) => (
            <View key={subCategory.id}>
              <View style={styles.sectionHeader}>
                <Text style={styles.subCategoryTitle}>{subCategory.name}</Text>
                <TouchableOpacity>
                  <Text style={styles.seeAll}>See all</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={subCategory.products}
                renderItem={({ item }) => (
                  <ProductCard 
                    product={item} 
                    onPress={() => {}} 
                    style={styles.productCard}
                  />
                )}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.productContainer}
              />
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

export default GrocerySection;