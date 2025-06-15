// screens/CartScreen.tsx
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Button, Card, useTheme } from 'react-native-paper';
import { useCart } from '../contexts/CartContext';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useNavigation } from '@react-navigation/native';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Cart'>;

const CartScreen = () => {
  const { groceryItems, pharmacyItems, removeFromCart, updateQuantity, groceryTotal, pharmacyTotal } = useCart();
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const [activeTab, setActiveTab] = useState<'grocery' | 'pharmacy'>('grocery');

  const handleCheckout = (type: 'grocery' | 'pharmacy') => {
    // Navigate to phone authentication first
    navigation.navigate('PhoneAuth', { cartType: type });
  };

  const renderTabContent = (items: any[], category: 'grocery' | 'pharmacy') => {
    if (items.length === 0) {
      return (
        <View style={styles.emptyCart}>
          <Text>Your cart is empty</Text>
        </View>
      );
    }

    return (
      <ScrollView style={styles.cartList}>
        {items.map((item) => (
          <Card key={item.id} style={styles.cartItem}>
            <Card.Content>
              <View style={styles.itemHeader}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>₹{item.price}</Text>
              </View>
              {item.variant && (
                <Text style={styles.variantText}>
                  {item.variant.name}: {item.variant.value}
                </Text>
              )}
              <View style={styles.quantityContainer}>
                <Button
                  mode="outlined"
                  onPress={() => updateQuantity(item.id, Math.max(1, item.quantity - 1), category)}
                  style={styles.quantityButton}
                >
                  -
                </Button>
                <Text style={styles.quantityText}>{item.quantity}</Text>
                <Button
                  mode="outlined"
                  onPress={() => updateQuantity(item.id, item.quantity + 1, category)}
                  style={styles.quantityButton}
                >
                  +
                </Button>
                <Button
                  mode="outlined"
                  onPress={() => removeFromCart(item.id, category)}
                  style={styles.removeButton}
                >
                  Remove
                </Button>
              </View>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'grocery' && styles.activeTab,
          ]}
          onPress={() => setActiveTab('grocery')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'grocery' && styles.activeTabText
          ]}>Grocery</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'pharmacy' && styles.activeTab,
          ]}
          onPress={() => setActiveTab('pharmacy')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'pharmacy' && styles.activeTabText
          ]}>Pharmacy</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'grocery' ? (
        <>
          {renderTabContent(groceryItems, 'grocery')}
          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>Total: ₹{groceryTotal}</Text>
            <Button
              mode="contained"
              onPress={() => handleCheckout('grocery')}
              disabled={groceryItems.length === 0}
            >
              Proceed to Checkout
            </Button>
          </View>
        </>
      ) : (
        <>
          {renderTabContent(pharmacyItems, 'pharmacy')}
          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>Total: ₹{pharmacyTotal}</Text>
            <Button
              mode="contained"
              onPress={() => handleCheckout('pharmacy')}
              disabled={pharmacyItems.length === 0}
            >
              Proceed to Checkout
            </Button>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#6200ee',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#6200ee',
    fontWeight: 'bold',
  },
  cartList: {
    flex: 1,
    padding: 16,
  },
  cartItem: {
    marginBottom: 16,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemPrice: {
    fontSize: 16,
    color: '#6200ee',
  },
  variantText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  quantityButton: {
    marginHorizontal: 4,
  },
  quantityText: {
    fontSize: 16,
    marginHorizontal: 8,
  },
  removeButton: {
    marginLeft: 'auto',
  },
  totalContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
});

export default CartScreen;