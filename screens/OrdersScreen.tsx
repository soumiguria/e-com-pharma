import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';

const mockOrders = [
  {
    id: '1',
    status: 'Delivered',
    items: ['Item A', 'Item B'],
    date: '2023-10-01',
    total: 50.00,
  },
  {
    id: '2',
    status: 'Processing',
    items: ['Item C', 'Item D'],
    date: '2023-10-02',
    total: 75.00,
  },
  {
    id: '3',
    status: 'Delivered',
    items: ['Item E', 'Item F'],
    date: '2023-10-03',
    total: 100.00,
  },
];

const OrdersScreen = () => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      padding: theme.spacing.md,
    },
    orderItem: {
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      marginBottom: theme.spacing.md,
      ...theme.shadows.small,
    },
    orderStatus: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.primary,
    },
    orderItems: {
      fontSize: 14,
      marginTop: theme.spacing.sm,
      color: theme.colors.text,
    },
    orderDate: {
      fontSize: 14,
      marginTop: theme.spacing.sm,
      color: theme.colors.text,
    },
    orderTotal: {
      fontSize: 16,
      fontWeight: 'bold',
      marginTop: theme.spacing.sm,
      color: theme.colors.text,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={mockOrders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.orderItem}>
            <Text style={styles.orderStatus}>Status: {item.status}</Text>
            <Text style={styles.orderItems}>Items: {item.items.join(', ')}</Text>
            <Text style={styles.orderDate}>Date: {item.date}</Text>
            <Text style={styles.orderTotal}>Total: ${item.total.toFixed(2)}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

export default OrdersScreen; 