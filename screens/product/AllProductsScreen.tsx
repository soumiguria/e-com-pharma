// screens/AllProductsScreen.tsx
import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList, 
  Text, 
  TouchableOpacity, 
  Image,
  SafeAreaView,
  Dimensions
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ProductDetailModal from '../../components/product/ProductDetailModal';
import { MaterialIcons } from '@expo/vector-icons';
import { useCart } from '../../contexts/CartContext';
import Toast from 'react-native-toast-message';

type AllProductsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AllProducts'>;

const { width } = Dimensions.get('window');
const itemWidth = (width - 48) / 2; // 48 = padding * 2 + margin * 2

const AllProductsScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<AllProductsScreenNavigationProp>();
  const route = useRoute();
  const { title, products } = route.params as { title: string; products: any[] };
  const { addToGroceryCart } = useCart();
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleProductPress = (product: any) => {
    setSelectedProduct(product);
    setModalVisible(true);
  };

  const handleAddToCart = (e: any, product: any) => {
    e.stopPropagation();
    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image
    };
    addToGroceryCart(cartItem);
    Toast.show({
      type: 'success',
      text1: 'Added to Cart',
      text2: `${product.name} has been added to your cart`,
      position: 'bottom',
      visibilityTime: 2000,
    });
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedProduct(null);
  };

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    container: {
      flex: 1,
      paddingHorizontal: 16,
      paddingTop: 16,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 24,
    },
    backButton: {
      padding: 8,
      borderRadius: 20,
      backgroundColor: theme.colors.surface,
      marginRight: 16,
      elevation: 2,
    },
    titleContainer: {
      flex: 1,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    subtitle: {
      fontSize: 14,
      color: theme.colors.secondary,
      marginTop: 4,
    },
    gridContainer: {
      paddingBottom: 16,
    },
    itemContainer: {
      width: itemWidth,
      marginBottom: 16,
      borderRadius: 12,
      backgroundColor: theme.colors.surface,
      overflow: 'hidden',
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    itemImageContainer: {
      position: 'relative',
    },
    itemImage: {
      width: '100%',
      height: itemWidth * 0.9, // Maintain aspect ratio
      resizeMode: 'cover',
    },
    itemDetails: {
      padding: 12,
    },
    itemName: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 4,
    },
    itemPriceContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    itemPrice: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.primary,
    },
    addToCartButton: {
      padding: 4,
      borderRadius: 8,
      backgroundColor: theme.colors.primary,
    },
    productCount: {
      fontSize: 12,
      color: theme.colors.secondary,
      marginTop: 4,
    },
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <MaterialIcons 
              name="arrow-back" 
              size={24} 
              color={theme.colors.primary} 
            />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{products.length} products available</Text>
          </View>
        </View>

        <FlatList
          data={products}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.itemContainer}
              onPress={() => {
                setSelectedProduct(item);
                setModalVisible(true);
              }}
              activeOpacity={0.8}
            >
              <View style={styles.itemImageContainer}>
                <Image 
                  source={{ uri: item.image }} 
                  style={styles.itemImage} 
                />
              </View>
              <View style={styles.itemDetails}>
                <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                <View style={styles.itemPriceContainer}>
                  <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
                  <TouchableOpacity 
                    style={styles.addToCartButton}
                    onPress={(e) => handleAddToCart(e, item)}
                  >
                    <MaterialIcons 
                      name="add-shopping-cart" 
                      size={18} 
                      color={theme.colors.primary} 
                    />
                  </TouchableOpacity>
                </View>
                <Text style={styles.productCount}>In stock: 10+</Text>
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          contentContainerStyle={styles.gridContainer}
          showsVerticalScrollIndicator={false}
        />

        <ProductDetailModal
          visible={modalVisible}
          product={selectedProduct}
          onClose={closeModal}
        />
      </View>
    </SafeAreaView>
  );
};

export default AllProductsScreen;