import React, { useState, useEffect, useCallback } from 'react';
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
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { Card, Chip, Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import orderListService from '../../services/api/orderListService';
import orderService from '../../services/api/orderService';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    type: 'grocery' | 'pharma';
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
        { name: 'Paracetamol', quantity: 1, price: 15, type: 'pharma' },
        { name: 'Vitamin C', quantity: 1, price: 200, type: 'pharma' },
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

  // Refresh orders when screen comes into focus (e.g., after payment completion)
  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [])
  );

  const checkPaymentStatus = async (orderNo: string) => {
    try {
      console.log('🔍 Checking payment status for order:', orderNo);
      const response = await orderService.getPaymentStatus(orderNo);
      
      if (response.success && response.data) {
        console.log('✅ Payment status for', orderNo, ':', response.data.status);
        return response.data.status;
      } else {
        console.log('⚠️ Could not get payment status for', orderNo);
        return 'pending';
      }
    } catch (error) {
      console.error('❌ Error checking payment status for', orderNo, ':', error);
      return 'pending';
    }
  };

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      // No local payment tracking - use backend status only

      const response = await orderListService.getOrders();
      if (response.success && response.data) {
        // First, get all orders and check payment status for those with paymentId
        const ordersWithPaymentStatus = await Promise.all(
          (response.data || []).map(async (order: any) => {
            // Only check payment status for orders with paymentId (likely online payments)
            if (order.paymentId && order.paymentId !== '22' && order.paymentId !== 'offline') {
              const actualPaymentStatus = await checkPaymentStatus(order.orderNo);
              return { ...order, actualPaymentStatus };
            }
            return { ...order, actualPaymentStatus: 'pending' };
          })
        );
        
        // Transform API data to match UI format safely
        const transformedOrders = ordersWithPaymentStatus.map((order: any) => {
          const itemsArray = Array.isArray(order.orderItems)
            ? order.orderItems
            : Array.isArray(order.products)
              ? order.products
              : [];

          const mappedItems = itemsArray.map((item: any) => ({
            name: item.name || item.productName || 'Item',
            quantity: Number(item.quantity) || 1,
            price: Number(item.actual ?? item.price ?? item.sp ?? 0),
            type: 'grocery' as const,
          }));

          // Use actual payment status if available, otherwise fallback to payment object status
          const paymentStatus = (order.actualPaymentStatus || order.payment?.status || '').toLowerCase();
          console.log('🔍 Order payment status:', order.orderNo, paymentStatus, order.payment);
          
          // Determine payment method based on what user actually selected
          // Check the paymentData field first, then fallback to other methods
          let paymentMethod: 'online' | 'offline';
          
          // First, check if payment object exists with mode
          if (order.payment?.mode) {
            paymentMethod = order.payment.mode === 'online' ? 'online' : 'offline';
          } 
          // Check paymentData field for the original payment method
          else if (order.paymentData?.paymentMethod) {
            paymentMethod = order.paymentData.paymentMethod === 'online' ? 'online' : 'offline';
          }
          // Check if deliveryMethod is 'store' (usually offline) vs 'home' (usually online)
          else if (order.deliveryMethod === 'store') {
            paymentMethod = 'offline'; // Store pickup is typically offline
          }
          // Fallback: check paymentId patterns
          else if (order.paymentId === '22' || order.paymentId === 'offline' || !order.paymentId) {
            paymentMethod = 'offline';
          } else {
            // Has a real paymentId but no other indicators = likely online
            paymentMethod = 'online';
          }
          
          // Determine UI status based on payment completion
          let uiStatus: 'pending' | 'paid' | 'completed' | 'cancelled';
          
          // Check if payment was verified successfully
          if (paymentStatus === 'success' || paymentStatus === 'completed' || paymentStatus === 'paid' || paymentStatus === 'verified') {
            uiStatus = 'paid'; // Payment verified successfully
          } else if (paymentStatus === 'cancelled' || paymentStatus === 'failed' || paymentStatus === 'rejected') {
            uiStatus = 'cancelled'; // Payment failed or cancelled
          } else {
            // Since backend is not returning payment.status, we need to infer from other indicators
            // Check if we have paymentId and it's not the default offline paymentId
            if (order.paymentId && order.paymentId !== '22' && order.paymentId !== 'offline') {
              // Has a real paymentId - this could be a completed payment
              // For now, assume it's pending until we can verify with backend
              uiStatus = 'pending';
              console.log('⚠️ Has paymentId but no status from backend, defaulting to pending for:', order.orderNo);
            } else {
              // No paymentId or default offline paymentId
              uiStatus = 'pending';
              console.log('⚠️ No paymentId or default offline paymentId, defaulting to pending for:', order.orderNo);
            }
          }
                
          console.log('🔍 Mapped UI status:', order.orderNo, uiStatus, 'backend status:', paymentStatus);
                
          console.log('🔍 Payment method detection for', order.orderNo, ':', {
            'payment.mode': order.payment?.mode,
            'paymentData.paymentMethod': order.paymentData?.paymentMethod,
            'deliveryMethod': order.deliveryMethod,
            'paymentId': order.paymentId,
            'detectedMethod': paymentMethod,
            'payment.status': order.payment?.status,
            'actualPaymentStatus': order.actualPaymentStatus,
            'payment.object': order.payment,
            'finalUIStatus': uiStatus
          });

          return {
            id: String(order.orderId || order._id || order.orderNo),
            orderNumber: order.orderNo || String(order.orderId || ''),
            date: order.createdAt || new Date().toISOString(),
            total: Number(order.totalAmount ?? 0),
            status: uiStatus,
            paymentMethod,
            items: mappedItems,
            deliveryMethod: (order.deliveryMethod === 'store' ? 'store_pickup' : 'home_delivery') as 'store_pickup' | 'home_delivery',
            address: order.shippingAddress?.address || 'Store Pickup',
          } as Order;
        });
        setOrders(transformedOrders);
      } else {
        // Fallback to mock data
        setOrders(mockOrders);
      }
    } catch (error) {
      console.log('Error fetching orders:', error);
      // Fallback to mock data
      setOrders(mockOrders);
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
    navigation.navigate('OrderDetail', { order: order });
  };

  const handlePayNow = (order: Order) => {
    if (order.status === 'pending' && order.paymentMethod === 'online') {
      // Navigate to payment screen
      navigation.navigate('PaymentMethods' as any);
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
            onPress={() => navigation.navigate('PhoneAuth' as any, { cartType: 'grocery' })}
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