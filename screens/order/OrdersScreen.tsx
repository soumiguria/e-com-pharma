import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { Card, Chip, Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  total: number;
  status: 'pending' | 'paid' | 'completed' | 'cancelled';
  paymentMethod: 'online' | 'offline';
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    type: 'grocery' | 'pharmacy';
  }>;
  deliveryMethod: 'store_pickup' | 'home_delivery';
  address?: string;
}

const OrdersScreen = () => {
  const { theme } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Mock orders data - in real app, fetch from API
  const mockOrders: Order[] = [
    {
      id: '1',
      orderNumber: 'ORD-001',
      date: '2024-01-15',
      total: 450,
      status: 'paid',
      paymentMethod: 'online',
      items: [
        { name: 'Organic Apples', quantity: 2, price: 120, type: 'grocery' },
        { name: 'Fresh Milk', quantity: 1, price: 60, type: 'grocery' },
      ],
      deliveryMethod: 'home_delivery',
      address: '123 Main St, City',
    },
    {
      id: '2',
      orderNumber: 'ORD-002',
      date: '2024-01-14',
      total: 280,
      status: 'pending',
      paymentMethod: 'offline',
      items: [
        { name: 'Paracetamol', quantity: 1, price: 15, type: 'pharmacy' },
        { name: 'Vitamin C', quantity: 1, price: 200, type: 'pharmacy' },
      ],
      deliveryMethod: 'store_pickup',
    },
    {
      id: '3',
      orderNumber: 'ORD-003',
      date: '2024-01-13',
      total: 650,
      status: 'completed',
      paymentMethod: 'online',
      items: [
        { name: 'Rice 5kg', quantity: 1, price: 300, type: 'grocery' },
        { name: 'Cooking Oil', quantity: 2, price: 180, type: 'grocery' },
      ],
      deliveryMethod: 'home_delivery',
      address: '456 Oak Ave, City',
    },
  ];

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setOrders(mockOrders);
    } catch (error) {
      console.log('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return '#FF9800';
      case 'paid':
        return '#4CAF50';
      case 'completed':
        return '#2196F3';
      case 'cancelled':
        return '#F44336';
      default:
        return theme.colors.text;
    }
  };

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'Payment Pending';
      case 'paid':
        return 'Paid';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const getPaymentMethodText = (method: Order['paymentMethod']) => {
    return method === 'online' ? 'Online Payment' : 'Offline Payment';
  };

  const getDeliveryMethodText = (method: Order['deliveryMethod']) => {
    return method === 'store_pickup' ? 'Store Pickup' : 'Home Delivery';
  };

  const handleOrderPress = (order: Order) => {
    navigation.navigate('OrderDetail', { orderId: order.id });
  };

  const handlePayNow = (order: Order) => {
    if (order.status === 'pending' && order.paymentMethod === 'online') {
      // Navigate to payment screen
      navigation.navigate('PaymentMethods', { orderId: order.id });
    }
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>My Orders</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.centerContent}>
          <Ionicons name="log-in-outline" size={64} color={theme.colors.secondary} />
          <Text style={[styles.loginText, { color: theme.colors.text }]}>
            Please login to view your orders
          </Text>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('PhoneAuth')}
            style={styles.loginButton}
          >
            Login
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>My Orders</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {orders.length === 0 ? (
          <View style={styles.centerContent}>
            <Ionicons name="receipt-outline" size={64} color={theme.colors.secondary} />
            <Text style={[styles.emptyText, { color: theme.colors.text }]}>
              No orders found
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.colors.secondary }]}>
              Your orders will appear here
            </Text>
          </View>
        ) : (
          orders.map((order) => (
            <Card key={order.id} style={[styles.orderCard, { backgroundColor: theme.colors.surface }]}>
              <TouchableOpacity onPress={() => handleOrderPress(order)}>
                <Card.Content>
                  <View style={styles.orderHeader}>
                    <View>
                      <Text style={[styles.orderNumber, { color: theme.colors.text }]}>
                        {order.orderNumber}
                      </Text>
                      <Text style={[styles.orderDate, { color: theme.colors.secondary }]}>
                        {new Date(order.date).toLocaleDateString()}
                      </Text>
                    </View>
                    <View style={styles.orderTotal}>
                      <Text style={[styles.totalAmount, { color: theme.colors.text }]}>
                        ₹{order.total}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.orderDetails}>
                    <View style={styles.detailRow}>
                      <Ionicons name="card-outline" size={16} color={theme.colors.secondary} />
                      <Text style={[styles.detailText, { color: theme.colors.text }]}>
                        {getPaymentMethodText(order.paymentMethod)}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="car-outline" size={16} color={theme.colors.secondary} />
                      <Text style={[styles.detailText, { color: theme.colors.text }]}>
                        {getDeliveryMethodText(order.deliveryMethod)}
                      </Text>
                    </View>
                    {order.address && (
                      <View style={styles.detailRow}>
                        <Ionicons name="location-outline" size={16} color={theme.colors.secondary} />
                        <Text style={[styles.detailText, { color: theme.colors.text }]}>
                          {order.address}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.orderItems}>
                    {order.items.slice(0, 2).map((item, index) => (
                      <Text key={index} style={[styles.itemText, { color: theme.colors.secondary }]}>
                        {item.name} x{item.quantity}
                      </Text>
                    ))}
                    {order.items.length > 2 && (
                      <Text style={[styles.itemText, { color: theme.colors.secondary }]}>
                        +{order.items.length - 2} more items
                      </Text>
                    )}
                  </View>

                  <View style={styles.orderFooter}>
                    <Chip
                      style={[styles.statusChip, { backgroundColor: getStatusColor(order.status) + '20' }]}
                      textStyle={{ color: getStatusColor(order.status) }}
                    >
                      {getStatusText(order.status)}
                    </Chip>
                    
                    {order.status === 'pending' && order.paymentMethod === 'online' && (
                      <Button
                        mode="contained"
                        onPress={() => handlePayNow(order)}
                        style={styles.payButton}
                        compact
                      >
                        Pay Now
                      </Button>
                    )}
                  </View>
                </Card.Content>
              </TouchableOpacity>
            </Card>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loginText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  loginButton: {
    marginTop: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  orderCard: {
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  orderDate: {
    fontSize: 12,
    marginTop: 2,
  },
  orderTotal: {
    alignItems: 'flex-end',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  orderDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  orderItems: {
    marginBottom: 12,
  },
  itemText: {
    fontSize: 12,
    marginBottom: 2,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusChip: {
    height: 32,
  },
  payButton: {
    borderRadius: 16,
  },
});

export default OrdersScreen;