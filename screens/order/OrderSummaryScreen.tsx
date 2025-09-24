import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useAppContext } from '../../contexts/AppContext';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import ThemedButton from '../../components/ui/ThemedButton';
import LoadingOverlay from '../../components/ui/LoadingOverlay';
import { usePayment } from '../../hooks/usePayment';
import storeService from '../../services/api/storeService';

type OrderSummaryRouteProp = RouteProp<RootStackParamList, 'OrderSummary'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  productId?: string;
}

interface OrderSummary {
  orderId: string;
  orderNumber: string;
  items: OrderItem[];
  total: number;
  deliveryMethod: string;
  deliveryAddress?: string;
  orderDate: string;
  status: string;
  storeId?: string;
  type?: 'grocery' | 'pharma';
}

const OrderSummaryScreen = () => {
  const route = useRoute<OrderSummaryRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const { isAuthenticated } = useAuth();
  const { selectedStore } = useAppContext();
  
  const [orderSummary, setOrderSummary] = useState<OrderSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { reorderProducts, isProcessing } = usePayment({
    onSuccess: (orderData) => {
      console.log('✅ Reorder successful:', orderData);
      Alert.alert(
        'Reorder Successful!',
        'Your order has been placed successfully.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    },
    onError: (error) => {
      console.error('❌ Reorder failed:', error);
      Alert.alert('Reorder Failed', error);
    },
  });

  useEffect(() => {
    loadOrderSummary();
  }, []);

  const loadOrderSummary = async () => {
    try {
      setIsLoading(true);
      const orderData = route.params?.orderData;
      
      if (orderData) {
        // Transform order data to summary format
        const summary: OrderSummary = {
          orderId: orderData.orderId || orderData.id,
          orderNumber: orderData.orderNo || orderData.orderNumber || `#${orderData.orderId}`,
          items: orderData.items || orderData.products || [],
          total: orderData.totalAmount || orderData.total || 0,
          deliveryMethod: orderData.deliveryMethod || 'Store Pickup',
          deliveryAddress: orderData.deliveryAddress || orderData.shippingAddress,
          orderDate: orderData.createdAt || orderData.orderDate || new Date().toISOString(),
          status: orderData.status || 'completed',
          storeId: orderData.storeId || selectedStore?.id,
          type: orderData.type || selectedStore?.type || 'grocery',
        };
        
        setOrderSummary(summary);
      } else {
        // If no order data provided, show error
        Alert.alert('Error', 'No order data available');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error loading order summary:', error);
      Alert.alert('Error', 'Failed to load order summary');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const handleReorder = async () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Login Required',
        'Please login to reorder items.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Login',
            onPress: () => navigation.navigate('PhoneAuth'),
          },
        ]
      );
      return;
    }

    if (!orderSummary) return;

    Alert.alert(
      'Reorder Items',
      `Do you want to reorder ${orderSummary.items.length} items for ₹${orderSummary.total.toFixed(2)}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reorder',
          onPress: async () => {
            try {
              await reorderProducts(orderSummary.items, orderSummary.type || 'grocery');
            } catch (error) {
              console.error('Reorder error:', error);
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return 'N/A';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return '#4CAF50';
      case 'pending':
        return '#FF9800';
      case 'cancelled':
        return '#F44336';
      default:
        return theme.colors.text;
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <LoadingOverlay visible={true} message="Loading order details..." />
      </SafeAreaView>
    );
  }

  if (!orderSummary) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={64} color={theme.colors.text} />
          <Text style={[styles.errorText, { color: theme.colors.text }]}>
            Order not found
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Order Summary
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order Info */}
        <View style={[styles.orderInfoCard, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.orderInfoRow}>
            <Text style={[styles.orderInfoLabel, { color: theme.colors.text }]}>
              {orderSummary.status === 'pending' ? 'Order ID:' : 'Order Number:'}
            </Text>
            <Text style={[styles.orderInfoValue, { color: theme.colors.primary }]}>
              {orderSummary.status === 'pending' ? orderSummary.orderId : orderSummary.orderNumber}
            </Text>
          </View>
          
          <View style={styles.orderInfoRow}>
            <Text style={[styles.orderInfoLabel, { color: theme.colors.text }]}>
              Order Date:
            </Text>
            <Text style={[styles.orderInfoValue, { color: theme.colors.text }]}>
              {formatDate(orderSummary.orderDate)}
            </Text>
          </View>
          
          <View style={styles.orderInfoRow}>
            <Text style={[styles.orderInfoLabel, { color: theme.colors.text }]}>
              Status:
            </Text>
            <Text style={[styles.orderInfoValue, { color: getStatusColor(orderSummary.status) }]}>
              {orderSummary.status.charAt(0).toUpperCase() + orderSummary.status.slice(1)}
            </Text>
          </View>
        </View>

        {/* Items */}
        <View style={[styles.itemsCard, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Items ({orderSummary.items.length})
          </Text>
          
          {orderSummary.items.map((item, index) => (
            <View key={item.id || index} style={styles.itemRow}>
              <Image
                source={{ uri: item.image || 'https://via.placeholder.com/60' }}
                style={styles.itemImage}
                defaultSource={{ uri: 'https://via.placeholder.com/60' }}
              />
              
              <View style={styles.itemDetails}>
                <Text style={[styles.itemName, { color: theme.colors.text }]} numberOfLines={2}>
                  {item.name}
                </Text>
                <Text style={[styles.itemQuantity, { color: theme.colors.secondary }]}>
                  Qty: {item.quantity}
                </Text>
              </View>
              
              <Text style={[styles.itemPrice, { color: theme.colors.text }]}>
                ₹{(item.price * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        {/* Delivery Info */}
        <View style={[styles.deliveryCard, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Delivery Information
          </Text>
          
          <View style={styles.deliveryRow}>
            <MaterialCommunityIcons
              name={orderSummary.deliveryMethod === 'Store Pickup' ? 'store' : 'truck-delivery'}
              size={20}
              color={theme.colors.primary}
            />
            <Text style={[styles.deliveryText, { color: theme.colors.text }]}>
              {orderSummary.deliveryMethod}
            </Text>
          </View>
          
          {orderSummary.deliveryAddress && (
            <View style={styles.deliveryRow}>
              <MaterialIcons name="location-on" size={20} color={theme.colors.secondary} />
              <Text style={[styles.deliveryAddress, { color: theme.colors.text }]}>
                {orderSummary.deliveryAddress}
              </Text>
            </View>
          )}
        </View>

        {/* Total */}
        <View style={[styles.totalCard, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: theme.colors.text }]}>
              Total Amount:
            </Text>
            <Text style={[styles.totalAmount, { color: theme.colors.primary }]}>
              ₹{orderSummary.total.toFixed(2)}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Reorder Button */}
      <View style={[styles.bottomContainer, { backgroundColor: theme.colors.surface }]}>
        <ThemedButton
          title="Reorder Items"
          onPress={handleReorder}
          disabled={isProcessing}
          style={styles.reorderButton}
        />
      </View>

      <LoadingOverlay
        visible={isProcessing}
        message="Placing reorder..."
      />
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  orderInfoCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  orderInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderInfoLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  orderInfoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  itemsCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
    marginRight: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 12,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
  },
  deliveryCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  deliveryText: {
    fontSize: 14,
    marginLeft: 8,
  },
  deliveryAddress: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  totalCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '700',
  },
  bottomContainer: {
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  reorderButton: {
    width: '100%',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    marginTop: 16,
  },
});

export default OrderSummaryScreen;
