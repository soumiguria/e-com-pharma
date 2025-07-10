import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  SafeAreaView,
  Alert,
  ScrollView,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Appbar } from 'react-native-paper';

type OrdersScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Orders'>;

// Mock order data
const mockOrders = [
  {
    id: 'ORD001',
    orderDate: '2024-01-15',
    status: 'Delivered',
    orderType: 'Home Delivery',
    address: '123 Main Street, Apartment 4B, New York, NY 10001',
    items: [
      {
        id: '1',
        name: 'Fresh Apples',
        price: 2.99,
        quantity: 2,
        image: 'https://images.pexels.com/photos/2093087/pexels-photo-2093087.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      },
      {
        id: '2',
        name: 'Organic Milk',
        price: 3.49,
        quantity: 1,
        image: 'https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      },
      {
        id: '3',
        name: 'Whole Grain Bread',
        price: 1.99,
        quantity: 1,
        image: 'https://images.pexels.com/photos/1721934/pexels-photo-1721934.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      },
      {
        id: '4',
        name: 'Bananas',
        price: 1.49,
        quantity: 3,
        image: 'https://images.pexels.com/photos/47305/bananas-banana-bunch-yellow-47305.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      },
      {
        id: '5',
        name: 'Tomatoes',
        price: 2.99,
        quantity: 2,
        image: 'https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      },
    ],
    itemTotal: 10.46,
    deliveryFee: 2.99,
    discount: 1.50,
    grandTotal: 11.95,
    paymentMode: 'Credit Card',
  },
  {
    id: 'ORD002',
    orderDate: '2024-01-10',
    status: 'In Transit',
    orderType: 'Store Pickup',
    address: '456 Oak Avenue, Suite 8, Brooklyn, NY 11201',
    items: [
      {
        id: '4',
        name: 'Fresh Vegetables',
        price: 4.99,
        quantity: 1,
        image: 'https://images.pexels.com/photos/2518893/pexels-photo-2518893.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      },
    ],
    itemTotal: 4.99,
    deliveryFee: 0,
    discount: 0,
    grandTotal: 4.99,
    paymentMode: 'Cash',
  },
  {
    id: 'ORD003',
    orderDate: '2024-01-08',
    status: 'Processing',
    orderType: 'Home Delivery',
    address: '789 Pine Street, Unit 12, Queens, NY 11375',
    items: [
      {
        id: '5',
        name: 'Chicken Breast',
        price: 8.99,
        quantity: 1,
        image: 'https://images.pexels.com/photos/3997388/pexels-photo-3997388.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      },
      {
        id: '6',
        name: 'Rice',
        price: 3.99,
        quantity: 2,
        image: 'https://images.pexels.com/photos/4110225/pexels-photo-4110225.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      },
      {
        id: '7',
        name: 'Cooking Oil',
        price: 4.99,
        quantity: 1,
        image: 'https://images.pexels.com/photos/4110225/pexels-photo-4110225.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      },
    ],
    itemTotal: 16.97,
    deliveryFee: 2.99,
    discount: 2.00,
    grandTotal: 17.96,
    paymentMode: 'Debit Card',
  },
];

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'grocery', label: 'Grocery' },
  { key: 'pharmacy', label: 'Pharmacy' },
];

const OrdersScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<OrdersScreenNavigationProp>();
  const [activeTab, setActiveTab] = useState('all');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered':
        return '#00b14f';
      case 'In Transit':
        return '#ff9500';
      case 'Processing':
        return '#007aff';
      default:
        return '#8e8e93';
    }
  };

  const handleOrderPress = (order: typeof mockOrders[0]) => {
    // Navigate to order detail screen
    navigation.navigate('OrderDetail' as any, { order });
  };

  const handleReorder = (order: typeof mockOrders[0]) => {
    // Add items to cart logic
    Alert.alert('Reorder', 'Items added to cart successfully!');
  };

  const handleRateOrder = (order: typeof mockOrders[0]) => {
    // Navigate to rating screen or show rating modal
    Alert.alert('Rate Order', 'Rating feature coming soon!');
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
      justifyContent: 'center',
      paddingVertical: 16,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    tabsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    tabBtn: {
      flex: 1,
      paddingVertical: 12,
      alignItems: 'center',
    },
    tabText: {
      fontSize: 16,
      color: theme.colors.text,
    },
    tabTextActive: {
      color: theme.colors.primary,
      fontWeight: 'bold',
      textDecorationLine: 'underline',
    },
    orderCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      margin: 16,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    itemsImagesContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    itemImage: {
      width: 56,
      height: 56,
      borderRadius: 8,
      marginRight: 12,
    },
    remainingItemsContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 4,
      marginLeft: -15,
      borderWidth: 2,
      borderColor: theme.colors.background,
    },
    remainingItemsText: {
      fontSize: 12,
      color: theme.colors.secondary,
      fontWeight: 'bold',
    },
    totalItemsContainer: {
      marginLeft: 'auto',
      backgroundColor: theme.colors.primary + '20',
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    totalItemsText: {
      fontSize: 12,
      color: theme.colors.primary,
      fontWeight: '600',
    },
    statusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    statusDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginRight: 8,
    },
    orderStatus: {
      fontSize: 15,
      fontWeight: 'bold',
      color: theme.colors.primary,
    },
    orderDetailsContainer: {
      marginBottom: 12,
    },
    orderDetailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    orderDetailLabel: {
      fontSize: 14,
      color: theme.colors.secondary,
    },
    orderDetailValue: {
      fontSize: 14,
      color: theme.colors.text,
    },
    actionButtonsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 12,
      gap: 8,
    },
    actionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 6,
      backgroundColor: '#4CAF50',
      borderWidth: 1,
      borderColor: '#4CAF50',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 1,
    },
    actionButtonText: {
      fontSize: 13,
      color: '#FFFFFF',
      fontWeight: '600',
      marginLeft: 4,
    },
    emptyText: {
      textAlign: 'center',
      color: theme.colors.secondary,
      marginTop: 40,
      fontSize: 16,
    },
  });

  const renderOrder = ({ item }: { item: typeof mockOrders[0] }) => {
    const totalItems = item.items.reduce((sum, item) => sum + item.quantity, 0);
    const displayItems = item.items.slice(0, 3); // Show only first 3 items
    const remainingItems = item.items.length - 3;

    return (
      <TouchableOpacity
        style={[
          styles.orderCard,
          {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
            borderRadius: 16,
            marginBottom: 16,
            padding: 16,
            shadowColor: theme.colors.text,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 8,
            elevation: 3,
          },
        ]}
        onPress={() => handleOrderPress(item)}
        activeOpacity={0.85}
      >
        {/* Item Images Section */}
        <View style={styles.itemsImagesContainer}>
          {displayItems.map((orderItem, index) => (
            <Image 
              key={orderItem.id}
              source={{ uri: orderItem.image }} 
              style={[
                styles.itemImage, 
                { 
                  marginLeft: index > 0 ? -15 : 0,
                  zIndex: displayItems.length - index 
                }
              ]} 
            />
          ))}
          {remainingItems > 0 && (
            <View style={styles.remainingItemsContainer}>
              <Text style={styles.remainingItemsText}>+{remainingItems}</Text>
            </View>
          )}
          <View style={styles.totalItemsContainer}>
            <Text style={styles.totalItemsText}>{totalItems} items</Text>
          </View>
        </View>

        {/* Order Status */}
        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
          <Text style={[styles.orderStatus, { color: getStatusColor(item.status) }]}>
            {item.status}
          </Text>
        </View>

        {/* Order Details */}
        <View style={styles.orderDetailsContainer}>
          <View style={styles.orderDetailRow}>
            <Text style={styles.orderDetailLabel}>Order ID:</Text>
            <Text style={styles.orderDetailValue}>{item.id}</Text>
          </View>
          <View style={styles.orderDetailRow}>
            <Text style={styles.orderDetailLabel}>Total Amount:</Text>
            <Text style={styles.orderDetailValue}>₹{item.grandTotal.toFixed(2)}</Text>
          </View>
          <View style={styles.orderDetailRow}>
            <Text style={styles.orderDetailLabel}>Total Items:</Text>
            <Text style={styles.orderDetailValue}>{totalItems}</Text>
          </View>
          <View style={styles.orderDetailRow}>
            <Text style={styles.orderDetailLabel}>Store:</Text>
            <Text style={styles.orderDetailValue}>Pass ki Dukaan</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleReorder(item)}>
            <MaterialIcons name="refresh" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.actionButtonText}>Reorder</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleRateOrder(item)}>
            <MaterialIcons name="star" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.actionButtonText}>Rate Order</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Appbar.Header style={{ backgroundColor: theme.colors.card, elevation: 0 }}>
        <Appbar.BackAction onPress={() => navigation.goBack()} color={theme.colors.text} />
        <Appbar.Content title="My Orders" titleStyle={{ color: theme.colors.text, fontWeight: 'bold', fontSize: 20 }} />
      </Appbar.Header>
      <View style={[styles.tabsRow, { backgroundColor: theme.colors.surface, borderRadius: 0, marginHorizontal: 0, paddingHorizontal: 0, elevation: 2, shadowColor: theme.colors.text, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4 }]}> 
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabBtn, activeTab === tab.key && { borderBottomWidth: 3, borderBottomColor: theme.colors.primary, backgroundColor: theme.colors.background }]} 
            onPress={() => setActiveTab(tab.key)}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, { color: activeTab === tab.key ? theme.colors.primary : theme.colors.text }]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={mockOrders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrder}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={styles.emptyText}>No orders found.</Text>}
      />
    </SafeAreaView>
  );
};

export default OrdersScreen; 