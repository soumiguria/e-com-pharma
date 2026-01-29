import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Image,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { Card } from 'native-base';
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
    image?: string;
  }>;
  deliveryMethod: 'store_pickup' | 'home_delivery';
  address?: string;
  storeName?: string; // Added store name property
  storeType?: 'pharma' | 'grocery'; // Added store type from API response
  prescriptionRequired?: boolean;
  // Amount breakdown from backend
  subtotalAmount?: number;
  storeDiscount?: number;
  shippingAmount?: number;
  taxAmount?: number;
  totalAmount?: number;
}

const OrdersScreen = () => {
  const { theme } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);        // initial / full refresh
  const [isLoadingMore, setIsLoadingMore] = useState(false); // pagination
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'ALL' | 'Grocery' | 'Pharmacy'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    // Initial load
    fetchOrdersForCurrentTab(1, false);
  }, []);

  // Refresh orders when screen comes into focus (e.g., after payment completion)
  useFocusEffect(
    useCallback(() => {
      // When screen refocuses, refresh first page for current tab
      fetchOrdersForCurrentTab(1, false);
    }, [activeTab])
  );

  const checkPaymentStatus = async (orderNo: string) => {
    try {
      console.log('🔍 Checking payment status for order:', orderNo);
      const response = await orderService.getPaymentStatus(orderNo);
      
      if (response.success && response.data) {
        console.log(' Payment status for', orderNo, ':', response.data.status);
        return response.data.status;
      } else {
        console.log('⚠️ Could not get payment status for', orderNo);
        return 'pending';
      }
    } catch (error) {
      console.error('  Error checking payment status for', orderNo, ':', error);
      return 'pending';
    }
  };

  const fetchOrders = async (
    filterType: 'pharma' | 'grocery' | undefined,
    page: number,
    append: boolean
  ) => {
    if (append) {
      // Loading more
      if (isLoadingMore || !hasMore) return;
      setIsLoadingMore(true);
    } else {
      // Fresh load / refresh
      setIsLoading(true);
      setHasMore(true);
      setCurrentPage(page);
      if (page === 1) {
        setOrders([]);
      }
    }
    try {
      // No local payment tracking - use backend status only

      const response = await orderListService.getOrders(filterType, page, 10);
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

          // Use the order type from API response to determine item types
          const orderType = order.type || 'grocery'; // Default to grocery if type not specified
          
          const mappedItems = itemsArray.map((item: any) => ({
            name: item.name || item.productName || 'Item',
            quantity: Number(item.quantity) || 1,
            price: Number(item.actual ?? item.price ?? item.sp ?? 0),
            type: orderType as 'grocery' | 'pharma',
            image: item.images?.primary || item.signedImages?.primary || item.image,
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

          console.log('💰 Amount breakdown for', order.orderNo, ':', {
            'subtotalAmount': order.subtotalAmount,
            'storeDiscount': order.storeDiscount,
            'shippingAmount': order.shippingAmount,
            'taxAmount': order.taxAmount,
            'totalAmount': order.totalAmount,
            'calculatedTotal': Number(order.subtotalAmount ?? 0) - Number(order.storeDiscount ?? 0) + Number(order.shippingAmount ?? 0) + Number(order.taxAmount ?? 0)
          });

          console.log('📋 Original order data for', order.orderNo, ':', {
            'orderNo': order.orderNo,
            'orderId': order.orderId,
            '_id': order._id,
            'originalOrderData.orderNo': order.orderNo,
            'originalOrderData.orderId': order.orderId
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
            storeName: order.storeName || order.store?.name,
            storeType: order.type || 'grocery', // Use order type from API response
            prescriptionRequired: order.prescriptionRequired,
            // Amount breakdown from backend - no dummy data
            subtotalAmount: Number(order.subtotalAmount ?? 0),
            storeDiscount: Number(order.storeDiscount ?? 0),
            shippingAmount: Number(order.shippingAmount ?? 0),
            taxAmount: Number(order.taxAmount ?? 0),
            totalAmount: Number(order.totalAmount ?? 0),
            // Store original backend data for payment processing
            originalOrderData: order,
          } as Order & { originalOrderData: any };
        });

        // Determine if there are more pages
        const pageSize = 10;
        if (transformedOrders.length < pageSize) {
          setHasMore(false);
        } else {
          setHasMore(true);
          setCurrentPage(page);
        }

        // Append or replace orders
        if (append) {
          setOrders(prev => {
            // Avoid duplicate IDs when reloading pages
            const existingIds = new Set(prev.map(o => o.id));
            const newOnes = transformedOrders.filter(o => !existingIds.has(o.id));
            return [...prev, ...newOnes];
          });
        } else {
          setOrders(transformedOrders);
        }
      } else {
        // Fallback to empty array if no data
        setOrders([]);
      }
    } catch (error) {
      console.log('Error fetching orders:', error);
      // Fallback to empty array if error
      setOrders([]);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrdersForCurrentTab(1, false);
    setRefreshing(false);
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return '#fff';
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

  // Handle tab change and fetch orders with filter
  const getFilterTypeForTab = (tabName: 'ALL' | 'Grocery' | 'Pharmacy'): 'pharma' | 'grocery' | undefined => {
    if (tabName === 'Grocery') return 'grocery';
    if (tabName === 'Pharmacy') return 'pharma';
    return undefined;
  };

  const fetchOrdersForCurrentTab = async (page: number, append: boolean) => {
    const filterType = getFilterTypeForTab(activeTab);
    await fetchOrders(filterType, page, append);
  };

  const handleTabChange = async (tabName: 'ALL' | 'Grocery' | 'Pharmacy') => {
    setActiveTab(tabName);
    // Reset pagination when tab changes
    setCurrentPage(1);
    setHasMore(true);
    await fetchOrdersForCurrentTab(1, false);
  };

  // Filter orders based on active tab (fallback for local filtering)
  const getFilteredOrders = () => {
    if (activeTab === 'ALL') {
      return orders;
    }
    
    return orders.filter(order => {
      // Use the order type from API response for filtering
      if (activeTab === 'Grocery') {
        return order.storeType === 'grocery' || order.items.some(item => item.type === 'grocery');
      } else if (activeTab === 'Pharmacy') {
        return order.storeType === 'pharma' || order.items.some(item => item.type === 'pharma');
      }
      return true;
    });
  };

  const renderTabButton = (tabName: 'ALL' | 'Grocery' | 'Pharmacy') => (
    <TouchableOpacity
      key={tabName}
      style={[
        styles.tabButton,
        {
          backgroundColor: activeTab === tabName ? theme.colors.primary : 'transparent',
          borderColor: theme.colors.primary,
        }
      ]}
      onPress={() => handleTabChange(tabName)}
    >
      <Text
        style={[
          styles.tabButtonText,
          {
            color: activeTab === tabName ? '#fff' : theme.colors.primary,
          }
        ]}
      >
        {tabName}
      </Text>
    </TouchableOpacity>
  );

  const handleOrderPress = (order: Order) => {
    navigation.navigate('OrderDetail', { order: order });
  };

  const handleReorderPress = (order: Order) => {
    navigation.navigate('OrderDetail', {
      order,
      scrollToBottom: true,
      highlightReorder: true,
    });
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
          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => navigation.navigate('PhoneAuth' as any, { cartType: 'grocery' })}
          >
            <Text style={styles.loginButtonText}>Login / Sign Up</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const filteredOrders = getFilteredOrders();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Your Orders</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Tab Navigation */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabContainer}
        contentContainerStyle={styles.tabContentContainer}
      >
        {renderTabButton('ALL')}
        {renderTabButton('Grocery')}
        {renderTabButton('Pharmacy')}
      </ScrollView>

      {isLoading ? (
        <View style={styles.centerContent}>
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Loading your orders...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          onEndReachedThreshold={0.4}
          onEndReached={() => {
            if (!isLoading && !isLoadingMore && hasMore && filteredOrders.length > 0) {
              fetchOrdersForCurrentTab(currentPage + 1, true);
            }
          }}
          ListFooterComponent={
            isLoadingMore ? (
              <View style={{ paddingVertical: 16, alignItems: 'center' }}>
                <Text style={[styles.loadingText, { color: theme.colors.secondary }]}>
                  Loading more orders...
                </Text>
              </View>
            ) : null
          }
          ListEmptyComponent={() => (
            <View style={styles.centerContent}>
              <Ionicons name="receipt-outline" size={64} color={theme.colors.secondary} />
              <Text style={[styles.emptyText, { color: theme.colors.text }]}>
                No orders found
              </Text>
              <Text style={[styles.emptySubtext, { color: theme.colors.secondary }]}>
                Your orders will appear here
              </Text>
            </View>
          )}
          renderItem={({ item: order }) => (
          <Card key={order.id} style={[styles.orderCard, { backgroundColor: theme.colors.surface }]}>
            <TouchableOpacity onPress={() => handleOrderPress(order)}>
              <View style={styles.cardContent}>
                {/* Status Row - Moved to top */}
                {/* In the same row as of the status show another tag if prescriptionRequired field is true */}
                {order.status === 'pending' && (
                  <View style={styles.statusRowTop}>
                    <View
                      style={[
                        styles.statusChip,
                        {
                          backgroundColor: getStatusColor(order.status) + '22',
                          borderWidth: 1.5,
                          borderColor: getStatusColor(order.status),
                          paddingHorizontal: 14,
                          paddingVertical: 8,
                          borderRadius: 18,
                          alignSelf: 'flex-start',
                          justifyContent: 'center',
                          alignItems: 'center',
                        },
                      ]}
                    >
                      <Text style={{ color: getStatusColor(order.status), fontSize: 13, fontWeight: '700' }}>
                        {getStatusText(order.status)}
                      </Text>
                    </View>
                    // Add some space between the two tags
                    {order.prescriptionRequired && (
                      <View
                        style={[
                          styles.statusChip,
                          {
                            backgroundColor: '#fff',
                            borderWidth: 1.5,
                            borderColor: '#dc3545',
                            paddingHorizontal: 14,
                            paddingVertical: 8,
                            borderRadius: 18,
                            alignSelf: 'flex-start',
                            justifyContent: 'center',
                            alignItems: 'center',
                            // marginLeft: 8,
                          },
                        ]}
                      >
                        <Text style={{ color: '#dc3545', fontSize: 13, fontWeight: '700' }}>
                          Prescription Required
                        </Text>
                      </View>
                    )}
                  </View>
                )}
                {/* Item Images Row */}
                <View style={styles.orderTopRow}>
                  <View style={styles.itemImagesContainer}>
                    {order.items.slice(0, 3).map((item, index) => (
                      <Image
                        key={index}
                        source={{ uri: item.image || 'https://i.ibb.co/vCkbyTDX/Whats-App-Image-2026-01-24-at-11-14-54-PM.jpg' }}
                        style={styles.itemImage}
                      />
                    ))}
                    {order.items.length > 3 && (
                      <View style={[styles.itemImage, styles.moreItemsContainer]}>
                        <Text style={styles.moreItemsText}>+{order.items.length - 3}</Text>
                      </View>
                    )}
                  </View>
                  {order.status !== 'pending' && (
                    <View style={styles.statusRowTop}>
                      <View
                        style={[
                          styles.statusChip,
                          {
                            backgroundColor: getStatusColor(order.status) + '22',
                            borderWidth: 1.5,
                            borderColor: getStatusColor(order.status),
                            paddingHorizontal: 14,
                            paddingVertical: 8,
                            borderRadius: 18,
                            alignSelf: 'flex-start',
                            justifyContent: 'center',
                            alignItems: 'center',
                          },
                        ]}
                      >
                        <Text style={{ color: getStatusColor(order.status), fontSize: 13, fontWeight: '700' }}>
                          {getStatusText(order.status)}
                        </Text>
                      </View>
                      {order.prescriptionRequired && (
                        <View
                          style={[
                            styles.statusChip,
                            {
                              backgroundColor: '#dc3545' + '22',
                              borderWidth: 1.5,
                              borderColor: '#dc3545',
                              paddingHorizontal: 14,
                              paddingVertical: 8,
                              borderRadius: 18,
                              alignSelf: 'flex-start',
                              justifyContent: 'center',
                              alignItems: 'center',
                              marginLeft: 8,
                            },
                          ]}
                        >
                          <Text style={{ color: '#dc3545', fontSize: 13, fontWeight: '700' }}>
                            Prescription Required
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>

                {/* Order Details */}
                <View style={styles.orderIdContainer}>
                  <Text style={[styles.detailLabel, { color: theme.colors.primary }]}>
                    {order.status === 'pending' ? 'Order ID' : 'Order Number'}
                  </Text>
                  <Text style={[styles.orderIdValue, { color: theme.colors.primary }]} numberOfLines={2}>
                    {order.status === 'pending' ? order.id : order.orderNumber}
                  </Text>
                </View>

                <View style={styles.orderDetails}>
                  <Text style={[styles.detailLabel, { color: theme.colors.primary }]}>Total Amt</Text>
                  <Text style={[styles.detailValue, { color: theme.colors.primary }]}>₹{Number(order.total).toFixed(2)}</Text>
                </View>

                <View style={styles.orderDetails}>
                  <Text style={[styles.detailLabel, { color: theme.colors.primary }]}>Total Items</Text>
                  <Text style={[styles.detailValue, { color: theme.colors.primary }]}>{order.items.reduce((sum, item) => sum + item.quantity, 0)}</Text>
                </View>

                      <TouchableOpacity 
                        style={styles.storeNameContainer}
                        onPress={() => {
                          const storeId = (order as any).originalOrderData?.storeId;
                          if (storeId) {
                            navigation.navigate('AboutStore' as any, { storeId });
                          } else {
                            Alert.alert('Store Info', 'Store information not available');
                          }
                        }}
                      >
                        <Text style={[styles.detailLabel, { color: theme.colors.primary }]}>Store Name</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Text style={[styles.storeNameValue, { color: theme.colors.primary, flex: 1 }]} numberOfLines={2}>
                            {order.storeName || (order.items.some(item => item.type === 'pharma') ? 'Pharmacy Store' : 'Grocery Store')}
                          </Text>
                          <Ionicons name="chevron-forward" size={20} color={theme.colors.primary} />
                        </View>
                      </TouchableOpacity>

                {/* Action Buttons */}
                <View style={styles.actionButtonsContainer}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.reorderButton, { borderColor: theme.colors.primary }]}
                    onPress={() => handleReorderPress(order)}
                  >
                    <Text style={[styles.actionButtonText, { color: theme.colors.primary }]}>Re-order</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.actionButton, styles.rateButton, { backgroundColor: theme.colors.primary }]}
                    onPress={() => Alert.alert('Rate Order', 'Rating feature coming soon!')}
                  >
                    <Text style={[styles.actionButtonText, { color: '#fff' }]}>Rate order</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          </Card>
        )}
        />
      )}
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
    // Tab styles
    tabContainer: {
      maxHeight: 50,
      borderBottomWidth: 1,
      borderBottomColor: '#E0E0E0',
    },
    tabContentContainer: {
      paddingHorizontal: 16,
      alignItems: 'center',
    },
    tabButton: {
      paddingHorizontal: 20,
      paddingVertical: 8,
      marginHorizontal: 4,
      borderRadius: 20,
      borderWidth: 1,
    },
    tabButtonText: {
      fontSize: 14,
      fontWeight: '600',
    },
    // List styles
    listContainer: {
      padding: 16,
      flexGrow: 1,
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
      paddingHorizontal: 32,
      paddingVertical: 12,
      borderRadius: 8,
    },
    loginButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
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
    loadingText: {
      fontSize: 16,
      fontWeight: '600',
      marginTop: 16,
      textAlign: 'center',
    },
    // Order card styles
    orderCard: {
      marginBottom: 20,
      marginHorizontal: 4,
      elevation: 6,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: 'rgba(0,0,0,0.08)',
    },
    cardContent: {
      paddingVertical: 24,
      paddingHorizontal: 20,
    },
    statusRowTop: {
      marginBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
    },
    orderTopRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 24,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(0,0,0,0.06)',
    },
    itemImagesContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    itemImage: {
      width: 56,
      height: 56,
      borderRadius: 16,
      marginRight: 12,
      backgroundColor: '#f8f9fa',
      borderWidth: 1.5,
      borderColor: '#e9ecef',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    moreItemsContainer: {
      backgroundColor: '#6c757d',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#6c757d',
    },
    moreItemsText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#fff',
    },
    statusChip: {
      height: 36,
      paddingHorizontal: 16,
      borderRadius: 18,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    orderDetails: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
      paddingVertical: 8,
      paddingHorizontal: 4,
      backgroundColor: 'rgba(0,0,0,0.02)',
      borderRadius: 12,
      borderLeftWidth: 3,
      borderLeftColor: 'rgba(0,0,0,0.1)',
    },
    detailLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: '#6c757d',
      letterSpacing: 0.3,
    },
    detailValue: {
      fontSize: 16,
      fontWeight: '700',
      color: '#2c3e50',
      letterSpacing: 0.2,
    },
    orderIdContainer: {
      marginBottom: 16,
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: 'rgba(0,0,0,0.03)',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: 'rgba(0,0,0,0.08)',
    },
    orderIdValue: {
      fontSize: 16,
      fontWeight: '700',
      marginTop: 6,
      lineHeight: 22,
      flexWrap: 'wrap',
      color: '#2c3e50',
      letterSpacing: 0.3,
    },
    storeNameContainer: {
      marginBottom: 16,
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: 'rgba(0,0,0,0.03)',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: 'rgba(0,0,0,0.08)',
    },
    storeNameValue: {
      fontSize: 16,
      fontWeight: '700',
      marginTop: 6,
      lineHeight: 22,
      flexWrap: 'wrap',
      color: '#2c3e50',
      letterSpacing: 0.3,
    },
    actionButtonsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 24,
      gap: 16,
    },
    actionButton: {
      flex: 1,
      paddingVertical: 16,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
    },
    reorderButton: {
      borderWidth: 2,
      backgroundColor: '#fff',
    },
    rateButton: {
      // backgroundColor will be set dynamically
    },
    actionButtonText: {
      fontSize: 16,
      fontWeight: '700',
      letterSpacing: 0.3,
    },
  });

export default OrdersScreen;