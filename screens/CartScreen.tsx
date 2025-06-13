// screens/CartScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useCart } from '../contexts/CartContext';
import { MaterialIcons } from '@expo/vector-icons';

const CartScreen = () => {
  const { theme } = useTheme();
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    cartTotal,
    cartCount,
  } = useCart();

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    container: {
      flex: 1,
      padding: 16,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 24,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    cartCount: {
      fontSize: 16,
      color: theme.colors.secondary,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyText: {
      fontSize: 18,
      color: theme.colors.secondary,
      marginTop: 16,
    },
    listContainer: {
      flex: 1,
    },
    itemContainer: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 12,
      marginBottom: 16,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    itemImage: {
      width: 80,
      height: 80,
      borderRadius: 8,
      marginRight: 12,
    },
    itemDetails: {
      flex: 1,
      justifyContent: 'space-between',
    },
    itemName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 4,
    },
    itemPrice: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.primary,
      marginBottom: 8,
    },
    quantityContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    quantityButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    quantityText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginHorizontal: 12,
      minWidth: 20,
      textAlign: 'center',
    },
    removeButton: {
      position: 'absolute',
      top: 8,
      right: 8,
      padding: 4,
    },
    footer: {
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      paddingTop: 16,
      paddingBottom: 32,
    },
    totalContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 24,
    },
    totalText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    totalAmount: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.primary,
    },
    checkoutButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 8,
      padding: 16,
      alignItems: 'center',
    },
    checkoutText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
  });

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.itemContainer}>
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      <View style={styles.itemDetails}>
        <View>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
        </View>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => updateQuantity(item.id, item.quantity - 1)}
          >
            <MaterialIcons name="remove" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{item.quantity}</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => updateQuantity(item.id, item.quantity + 1)}
          >
            <MaterialIcons name="add" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeFromCart(item.id)}
      >
        <MaterialIcons name="close" size={20} color={theme.colors.secondary} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Your Cart</Text>
          <Text style={styles.cartCount}>{cartCount} items</Text>
        </View>

        {cartItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons
              name="remove-shopping-cart"
              size={64}
              color={theme.colors.secondary}
            />
            <Text style={styles.emptyText}>Your cart is empty</Text>
          </View>
        ) : (
          <>
            <FlatList
              data={cartItems}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
            />
            <View style={styles.footer}>
              <View style={styles.totalContainer}>
                <Text style={styles.totalText}>Total</Text>
                <Text style={styles.totalAmount}>${cartTotal.toFixed(2)}</Text>
              </View>
              <TouchableOpacity style={styles.checkoutButton}>
                <Text style={styles.checkoutText}>Proceed to Checkout</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

export default CartScreen;