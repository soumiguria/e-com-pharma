import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/types';
import orderListService from '../../services/api/orderListService';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type OrderDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'OrderDetail'>;

const OrderDetailScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<OrderDetailScreenNavigationProp>();
  const route = useRoute();
  const params = route.params as any;
  const passedOrder = params?.order;
  const passedOrderId = params?.orderId as string | undefined;
  const [loading, setLoading] = useState<boolean>(false);
  const [apiOrder, setApiOrder] = useState<any>(null);

  // Use API data if available, otherwise fallback to passed order
  const order = apiOrder || passedOrder;

  // Add default values to prevent undefined errors
  const orderData = {
    id: order?.orderNo || order?.orderNumber || order?.id || 'N/A',
    items: (order?.orderItems || order?.items || []).map((it: any) => ({
      id: it.productId || it.id || 'unknown',
      name: it.name || it.productName || 'Product',
      price: Number(it.actual ?? it.price ?? it.sp ?? 0),
      originalPrice: Number(it.mrp ?? 0),
      quantity: Number(it.quantity ?? 1),
      image: it.images?.primary || it.signedImages?.primary || 'https://via.placeholder.com/150',
    })),
    itemTotal: Number(order?.subtotalAmount || order?.itemTotal || order?.total || 0),
    deliveryFee: Number(order?.shippingAmount || order?.deliveryFee || 0),
    discount: Number((order?.storeDiscount || 0) + (order?.couponDiscount || 0) || order?.discount || 0),
    grandTotal: Number(order?.totalAmount || order?.grandTotal || order?.total || 0),
    paymentMode: order?.payment?.mode === 'online' || order?.paymentMethod === 'online' ? 'Online' : 'Offline',
    orderType: order?.deliveryMethod === 'store' || order?.deliveryMethod === 'store_pickup' ? 'Store Pickup' : 'Home Delivery',
    address: order?.shippingAddress?.address || order?.address || order?.shippingAddress || 'Store Pickup',
    orderDate: order?.createdAt ? new Date(order.createdAt).toLocaleDateString() : order?.date ? new Date(order.date).toLocaleDateString() : order?.orderDate || new Date().toLocaleDateString(),
    status: order?.status || 'Processing',
  };

  // Debug logging
  console.log('📦 Order data for rendering:', JSON.stringify(orderData, null, 2));
  console.log('📦 Raw order object:', JSON.stringify(order, null, 2));

  const handleDownloadInvoice = () => {
    Alert.alert('Download Invoice', 'Invoice download started...');
  };

  const handleCallStore = () => {
    Alert.alert('Call Store', 'Calling store...');
  };

  const handleReorder = () => {
    Alert.alert('Reorder', 'Adding items to cart...');
  };

  const handlePayNow = () => {
    console.log('💳 Pay Now pressed for order:', orderData.id);
    
    // Navigate to Razorpay checkout with order details
    navigation.navigate('RazorpayCheckout' as any, {
      amount: orderData.grandTotal,
      currency: 'INR',
      name: 'Order Payment',
      description: `Payment for Order ${orderData.id}`,
      cartType: 'pharma', // Default, can be determined from order
      deliveryMethod: orderData.orderType === 'Store Pickup' ? 'Store Pickup' : 'Home Delivery',
      orderId: orderData.id,
      isExistingOrder: true,
    });
  };

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

  useEffect(() => {
    const fetchDetail = async () => {
      if (!passedOrderId) return;
      try {
        setLoading(true);
        console.log('📦 Fetching order details for ID:', passedOrderId);
        const res = await orderListService.getOrderById(passedOrderId);
        console.log('📦 Order detail response:', JSON.stringify(res, null, 2));
        if (res.success && res.data) {
          console.log('📦 Setting API order data:', JSON.stringify(res.data, null, 2));
          setApiOrder(res.data);
        } else {
          console.log('❌ Failed to fetch order details:', res.error);
        }
      } catch (error) {
        console.error('❌ Error fetching order details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [passedOrderId]);

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
      justifyContent: 'space-between',
      paddingHorizontal: 8,
      paddingVertical: 10,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      minWidth: 0,
      flex: 1,
    },
    backButton: {
      padding: 8,
      marginRight: 12,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    downloadButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 8,
      paddingVertical: 6,
      borderRadius: 8,
      maxWidth: '60%',
    },
    downloadButtonText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '600',
      marginLeft: 4,
    },
    content: {
      flex: 1,
      padding: 16,
    },
    orderIdRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    orderIdText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
    },
    orderId: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.primary,
    },
    section: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 12,
    },
    itemContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    itemImage: {
      width: 60,
      height: 60,
      borderRadius: 8,
      marginRight: 12,
    },
    itemDetails: {
      flex: 1,
    },
    itemName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 4,
    },
    itemPrice: {
      fontSize: 14,
      color: theme.colors.primary,
      fontWeight: '600',
    },
    itemQuantity: {
      fontSize: 14,
      color: theme.colors.secondary,
    },
    billRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    billLabel: {
      fontSize: 14,
      color: theme.colors.text,
    },
    billValue: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
    },
    grandTotalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 8,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    grandTotalLabel: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    grandTotalValue: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.primary,
    },
    payNowButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 8,
      marginVertical: 8,
    },
    payNowButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 8,
    },
    orderDetailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    orderDetailLabel: {
      fontSize: 14,
      color: theme.colors.secondary,
    },
    orderDetailValue: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
    },
    statusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 8,
    },
    statusText: {
      fontSize: 14,
      fontWeight: '600',
    },
    helpSection: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
    },
    helpTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 16,
    },
    helpButtonsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    helpButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primary,
      paddingVertical: 12,
      borderRadius: 8,
      marginHorizontal: 4,
    },
    helpButtonText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '600',
      marginLeft: 8,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      fontSize: 16,
      color: theme.colors.text,
    },
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.container, { padding: 16 }]}>
          <View style={styles.header}>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', minWidth: 0 }}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backButton}
              >
                <MaterialIcons name="arrow-back" size={24} color={theme.colors.text} />
              </TouchableOpacity>
              <Text style={[styles.headerTitle, { flexShrink: 1 }]} numberOfLines={1} ellipsizeMode="tail">Order Summary</Text>
            </View>
            <View style={{ width: 24 }} />
          </View>
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: theme.colors.text }]}>Loading order details...</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.container, { padding: 16 }]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', minWidth: 0 }}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <MaterialIcons name="arrow-back" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { flexShrink: 1 }]} numberOfLines={1} ellipsizeMode="tail">Order Summary</Text>
          </View>
          <TouchableOpacity
            onPress={handleDownloadInvoice}
            style={styles.downloadButton}
          >
            <MaterialIcons name="file-download" size={16} color="#fff" />
            <Text style={styles.downloadButtonText} numberOfLines={1} ellipsizeMode="tail">Download Invoice</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Order ID */}
          <View style={styles.orderIdRow}>
            <Text style={styles.orderIdText}>Item Details</Text>
            <Text style={styles.orderId}>{orderData.id}</Text>
          </View>

          {/* Items Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Items</Text>
            {orderData.items.map((item: any, index: number) => (
              <View key={item.id || `item-${index}`} style={styles.itemContainer}>
                <Image source={{ uri: item.image }} style={styles.itemImage} />
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemPrice}>₹{(item.price || 0).toFixed(2)}</Text>
                  {item.originalPrice && item.originalPrice > item.price ? (
                    <Text style={[styles.itemPrice, { textDecorationLine: 'line-through', color: theme.colors.secondary, marginLeft: 6 }]}>₹{(item.originalPrice || 0).toFixed(2)}</Text>
                  ) : null}
                  {item.originalPrice && item.originalPrice > item.price ? (
                    <Text style={[styles.itemPrice, { color: '#FF9800', marginLeft: 6 }]}>{Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% off</Text>
                  ) : null}
                  <Text style={styles.itemQuantity}>Quantity: {item.quantity || 1}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Bill Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bill Details</Text>
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Item Bill</Text>
              <Text style={styles.billValue}>₹{(orderData.itemTotal || 0).toFixed(2)}</Text>
            </View>
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Delivery Fee</Text>
              <Text style={styles.billValue}>₹{(orderData.deliveryFee || 0).toFixed(2)}</Text>
            </View>
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Discount</Text>
              <Text style={styles.billValue}>-₹{(orderData.discount || 0).toFixed(2)}</Text>
            </View>
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Payment Mode</Text>
              <Text style={styles.billValue}>{orderData.paymentMode || 'N/A'}</Text>
            </View>
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>Grand Total</Text>
              <Text style={styles.grandTotalValue}>₹{(orderData.grandTotal || 0).toFixed(2)}</Text>
            </View>
          </View>

          {/* Pay Now Button for Pending Orders */}
          {orderData.status === 'pending' && orderData.paymentMode === 'Online' && (
            <View style={styles.section}>
              <TouchableOpacity
                style={[styles.payNowButton, { backgroundColor: theme.colors.primary }]}
                onPress={handlePayNow}
              >
                <MaterialIcons name="payment" size={20} color="#fff" />
                <Text style={styles.payNowButtonText}>Pay Now - ₹{(orderData.grandTotal || 0).toFixed(2)}</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Order Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Details</Text>
            <View style={styles.orderDetailRow}>
              <Text style={styles.orderDetailLabel}>Order Type</Text>
              <Text style={styles.orderDetailValue}>{orderData.orderType || 'N/A'}</Text>
            </View>
            <View style={styles.orderDetailRow}>
              <Text style={styles.orderDetailLabel}>Address</Text>
              <Text style={styles.orderDetailValue} numberOfLines={2}>{orderData.address || 'N/A'}</Text>
            </View>
            <View style={styles.orderDetailRow}>
              <Text style={styles.orderDetailLabel}>Order Placed On</Text>
              <Text style={styles.orderDetailValue}>{orderData.orderDate || 'N/A'}</Text>
            </View>
            <View style={styles.statusContainer}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: getStatusColor(orderData.status) },
                ]}
              />
              <Text
                style={[
                  styles.statusText,
                  { color: getStatusColor(orderData.status) },
                ]}
              >
                {orderData.status || 'Processing'}
              </Text>
            </View>
          </View>

          {/* Help Section */}
          <View style={styles.helpSection}>
            <Text style={styles.helpTitle}>Need Help With Your Order?</Text>
            <View style={styles.helpButtonsContainer}>
              <TouchableOpacity
                onPress={handleCallStore}
                style={styles.helpButton}
              >
                <MaterialCommunityIcons name="phone" size={20} color="#fff" />
                <Text style={styles.helpButtonText}>Call Store</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleReorder}
                style={styles.helpButton}
              >
                <MaterialCommunityIcons name="refresh" size={20} color="#fff" />
                <Text style={styles.helpButtonText}>Reorder</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default OrderDetailScreen; 