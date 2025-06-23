import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';

const mockOrders = [
  {
    id: '1',
    status: 'Delivered',
    storeName: 'Fresh Grocery Store',
    storeType: 'grocery',
    image: 'https://cdn.pixabay.com/photo/2017/10/09/19/29/eat-2834549_1280.jpg',
    totalAmount: 460,
    totalItems: 3,
    items: [
      { id: 'a', name: 'Organic Apples', qty: 1, price: 120 },
      { id: 'b', name: 'Bananas', qty: 2, price: 80 },
      { id: 'c', name: 'Milk 1L', qty: 1, price: 260 },
    ],
  },
  {
    id: '2',
    status: 'Processing',
    storeName: 'City Pharmacy',
    storeType: 'pharmacy',
    image: 'https://cdn.pixabay.com/photo/2016/03/05/19/02/broccoli-1238250_1280.jpg',
    totalAmount: 320,
    totalItems: 2,
    items: [
      { id: 'd', name: 'Paracetamol', qty: 1, price: 120 },
      { id: 'e', name: 'Cough Syrup', qty: 1, price: 200 },
    ],
  },
  {
    id: '3',
    status: 'Delivered',
    storeName: 'Super Grocery',
    storeType: 'grocery',
    image: 'https://cdn.pixabay.com/photo/2017/06/27/22/21/banana-2449019_1280.jpg',
    totalAmount: 150,
    totalItems: 1,
    items: [
      { id: 'f', name: 'Bread', qty: 2, price: 150 },
    ],
  },
];

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'grocery', label: 'Grocery' },
  { key: 'pharmacy', label: 'Pharmacy' },
];

const OrdersScreen = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('all');

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    appBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    appBarTitle: {
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
    orderHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    storeImage: {
      width: 56,
      height: 56,
      borderRadius: 8,
      marginRight: 12,
    },
    orderInfo: {
      flex: 1,
    },
    orderStatus: {
      fontSize: 15,
      fontWeight: 'bold',
      color: theme.colors.primary,
    },
    orderId: {
      fontSize: 13,
      color: theme.colors.secondary,
      marginTop: 2,
    },
    storeName: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    orderDetailsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 8,
    },
    orderDetail: {
      fontSize: 14,
      color: theme.colors.text,
    },
    itemsList: {
      marginTop: 10,
      marginBottom: 10,
    },
    itemRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    itemName: {
      fontSize: 14,
      color: theme.colors.text,
    },
    itemQty: {
      fontSize: 14,
      color: theme.colors.secondary,
    },
    actionsRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: 10,
    },
    actionBtn: {
      backgroundColor: theme.colors.primary,
      borderRadius: 8,
      paddingHorizontal: 14,
      paddingVertical: 8,
      marginLeft: 10,
    },
    actionBtnText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 14,
    },
    emptyText: {
      textAlign: 'center',
      color: theme.colors.secondary,
      marginTop: 40,
      fontSize: 16,
    },
  });

  const filteredOrders =
    activeTab === 'all'
      ? mockOrders
      : mockOrders.filter((o) => o.storeType === activeTab);

  const renderOrder = ({ item }: { item: typeof mockOrders[0] }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Image source={{ uri: item.image }} style={styles.storeImage} />
        <View style={styles.orderInfo}>
          <Text style={styles.storeName}>{item.storeName}</Text>
          <Text style={styles.orderStatus}>{item.status}</Text>
          <Text style={styles.orderId}>Order ID: {item.id}</Text>
        </View>
      </View>
      <View style={styles.orderDetailsRow}>
        <Text style={styles.orderDetail}>Total: ₹{item.totalAmount}</Text>
        <Text style={styles.orderDetail}>Items: {item.totalItems}</Text>
      </View>
      <View style={styles.itemsList}>
        {item.items.map((itm) => (
          <View key={itm.id} style={styles.itemRow}>
            <Text style={styles.itemName}>{itm.name}</Text>
            <Text style={styles.itemQty}>x{itm.qty} - ₹{itm.price}</Text>
          </View>
        ))}
      </View>
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionBtn}>
          <Text style={styles.actionBtnText}>Rate Order</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Text style={styles.actionBtnText}>Reorder</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.appBar}>
        <Text style={styles.appBarTitle}>My Orders</Text>
      </View>
      <View style={styles.tabsRow}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabBtn}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {filteredOrders.length === 0 ? (
        <Text style={styles.emptyText}>No orders found.</Text>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id}
          renderItem={renderOrder}
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      )}
    </SafeAreaView>
  );
};

export default OrdersScreen; 