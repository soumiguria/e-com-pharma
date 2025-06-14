import React, { useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  ScrollView, 
  Animated,
  TouchableOpacity,
  Image,
  Modal
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { StackNavigationProp } from '@react-navigation/stack';
import ProductCard from './ProductCard';
import CategoryCard from './CategoryCard';

type GroceryNavigationProp = StackNavigationProp<RootStackParamList, 'AllProducts'>;

interface GrocerySectionProps {
  scrollY: Animated.Value;
  storeId: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description?: string;
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
          { 
            id: '1-1-1', 
            name: 'Organic Apples', 
            price: 2.99, 
            image: 'https://cdn.pixabay.com/photo/2016/01/05/13/58/apple-1122537_1280.jpg',
            description: 'Fresh organic apples from local farms. Perfect for snacks or baking.'
          },
          { 
            id: '1-1-2', 
            name: 'Bananas', 
            price: 1.99, 
            image: 'https://cdn.pixabay.com/photo/2017/06/27/22/21/banana-2449019_1280.jpg',
            description: 'Ripe bananas, great for smoothies or as a quick energy snack.'
          },
          { 
            id: '1-1-3', 
            name: 'Strawberries', 
            price: 3.49, 
            image: 'https://cdn.pixabay.com/photo/2018/04/29/11/54/strawberries-3359755_1280.jpg',
            description: 'Sweet and juicy strawberries, perfect for desserts or fresh eating.'
          },
          { 
            id: '1-1-4', 
            name: 'Grapes', 
            price: 4.99, 
            image: 'https://cdn.pixabay.com/photo/2016/07/22/09/59/grapes-1535080_1280.jpg',
            description: 'Seedless grapes, great for snacks or fruit salads.'
          },
        ],
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
            description: 'Fresh crunchy carrots, perfect for snacking or cooking.'
          },
          { 
            id: '1-2-2', 
            name: 'Organic Broccoli', 
            price: 2.49, 
            image: 'https://cdn.pixabay.com/photo/2016/03/05/19/02/broccoli-1238250_1280.jpg',
            description: 'Organic broccoli florets, packed with nutrients.'
          },
          { 
            id: '1-2-3', 
            name: 'Bell Peppers', 
            price: 1.99, 
            image: 'https://cdn.pixabay.com/photo/2016/08/11/08/43/bell-pepper-1585363_1280.jpg',
            description: 'Colorful bell peppers, great for salads and stir-fries.'
          },
          { 
            id: '1-2-4', 
            name: 'Tomatoes', 
            price: 2.29, 
            image: 'https://cdn.pixabay.com/photo/2011/03/16/15/45/tomatoes-5392_1280.jpg',
            description: 'Vine-ripened tomatoes, perfect for salads and sauces.'
          },
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
          { 
            id: '2-1-1', 
            name: 'Organic Whole Milk', 
            price: 3.49, 
            image: 'https://cdn.pixabay.com/photo/2017/07/05/15/41/milk-2474993_1280.jpg',
            description: 'Creamy organic whole milk from grass-fed cows.'
          },
          { 
            id: '2-1-2', 
            name: 'Almond Milk', 
            price: 2.99, 
            image: 'https://cdn.pixabay.com/photo/2017/06/27/08/24/almond-milk-2446393_1280.jpg',
            description: 'Unsweetened almond milk, dairy-free alternative.'
          },
          { 
            id: '2-1-3', 
            name: 'Heavy Cream', 
            price: 2.99, 
            image: 'https://cdn.pixabay.com/photo/2017/06/27/08/24/almond-milk-2446393_1280.jpg',
            description: 'Rich heavy cream for cooking and baking.'
          },
        ],
      },
      {
        id: '2-2',
        name: 'Cheese',
        products: [
          { 
            id: '2-2-1', 
            name: 'Cheddar Cheese', 
            price: 4.99, 
            image: 'https://cdn.pixabay.com/photo/2016/01/22/02/13/cheese-1155136_1280.jpg',
            description: 'Sharp cheddar cheese, perfect for sandwiches and snacks.'
          },
          { 
            id: '2-2-2', 
            name: 'Mozzarella', 
            price: 5.49, 
            image: 'https://cdn.pixabay.com/photo/2017/05/23/17/54/cheese-2338650_1280.jpg',
            description: 'Fresh mozzarella, ideal for pizzas and caprese salads.'
          },
          { 
            id: '2-2-3', 
            name: 'Parmesan', 
            price: 6.99, 
            image: 'https://cdn.pixabay.com/photo/2015/09/05/23/18/cheese-926311_1280.jpg',
            description: 'Aged parmesan cheese, great for pasta and salads.'
          },
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
          { 
            id: '3-1-1', 
            name: 'Sourdough', 
            price: 4.49, 
            image: 'https://cdn.pixabay.com/photo/2014/07/22/09/59/bread-399286_1280.jpg',
            description: 'Artisan sourdough bread with perfect crust.'
          },
          { 
            id: '3-1-2', 
            name: 'Whole Wheat', 
            price: 3.99, 
            image: 'https://cdn.pixabay.com/photo/2014/07/22/09/59/bread-399286_1280.jpg',
            description: 'Healthy whole wheat bread, great for sandwiches.'
          },
        ],
      },
    ],
  },
];

const GrocerySection: React.FC<GrocerySectionProps> = ({ scrollY, storeId }) => {
  const { theme } = useTheme();
  const navigation = useNavigation<GroceryNavigationProp>();
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(groceryData[0]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Get all featured products
  const featuredProducts = [
    ...groceryData[0].subCategories[0].products.slice(0, 2),
    ...groceryData[0].subCategories[1].products.slice(0, 2),
  ];

  const handleSeeAllFeatured = () => {
    navigation.navigate('AllProducts', {
      title: 'Featured Products',
      products: featuredProducts,
    });
  };

  const handleSeeAllSubCategory = (subCategory: SubCategory) => {
    navigation.navigate('AllProducts', {
      title: subCategory.name,
      products: subCategory.products,
    });
  };

  const handleProductPress = (product: Product) => {
    setSelectedProduct(product);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedProduct(null);
  };

  const addToCart = () => {
    // Implement your add to cart logic here
    closeModal();
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
      marginRight: 12,
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
      width: '85%',
      backgroundColor: theme.colors.background,
      borderRadius: 12,
      padding: 20,
      elevation: 5,
    },
    productImage: {
      width: '100%',
      height: 200,
      borderRadius: 8,
      marginBottom: 16,
    },
    productName: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 8,
    },
    productPrice: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.primary,
      marginBottom: 12,
    },
    productDescription: {
      fontSize: 16,
      color: theme.colors.text,
      marginBottom: 20,
      lineHeight: 22,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    actionButton: {
      flex: 1,
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
      marginHorizontal: 4,
    },
    addToCartButton: {
      backgroundColor: theme.colors.primary,
    },
    closeButton: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.primary,
    },
    buttonText: {
      fontWeight: 'bold',
      fontSize: 16,
    },
    addToCartText: {
      color: '#fff',
    },
    closeText: {
      color: theme.colors.primary,
    },
  });

  return (
    <>
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
          <TouchableOpacity onPress={handleSeeAllFeatured}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {featuredProducts.map((product) => (
            <TouchableOpacity 
              key={product.id} 
              style={styles.featuredCard}
              onPress={() => handleProductPress(product)}
            >
              <Image source={{ uri: product.image }} style={styles.featuredImage} />
              <View style={styles.featuredOverlay}>
                <Text style={styles.featuredText}>{product.name}</Text>
                <Text style={styles.featuredSubtext}>${product.price.toFixed(2)}</Text>
              </View>
            </TouchableOpacity>
          ))}
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
                  <TouchableOpacity onPress={() => handleSeeAllSubCategory(subCategory)}>
                    <Text style={styles.seeAll}>See all</Text>
                  </TouchableOpacity>
                </View>
                <FlatList
                  data={subCategory.products}
                  renderItem={({ item }) => (
                    <ProductCard 
                      product={item} 
                      onPress={() => handleProductPress(item)} 
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

      {/* Product Detail Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedProduct && (
              <>
                <Image source={{ uri: selectedProduct.image }} style={styles.productImage} />
                <Text style={styles.productName}>{selectedProduct.name}</Text>
                <Text style={styles.productPrice}>${selectedProduct.price.toFixed(2)}</Text>
                <Text style={styles.productDescription}>
                  {selectedProduct.description}
                </Text>
                
                <View style={styles.buttonContainer}>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.addToCartButton]}
                    onPress={addToCart}
                  >
                    <Text style={[styles.buttonText, styles.addToCartText]}>Add to Cart</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.closeButton]}
                    onPress={closeModal}
                  >
                    <Text style={[styles.buttonText, styles.closeText]}>Close</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
};

export default GrocerySection;