import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ThemedButton from '../../components/ui/ThemedButton';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useCart } from '../../contexts/CartContext';
import LoadingOverlay from '../../components/ui/LoadingOverlay';
import { orderService } from '../../services/api';
import { PlaceOrderRequest } from '../../services/api/orderService';
import { Ionicons } from '@expo/vector-icons';

const deliveryMethods = [
  { id: '1', label: 'Store Pickup' },
  { id: '2', label: 'Home Delivery' },
];

const paymentMethods = [
  { id: 'offline', label: 'Offline Payment', description: 'Pay at store or delivery' },
  { id: 'online', label: 'Online Payment', description: 'Pay now with Razorpay' },
];

const PaymentMethodsScreen = () => {
  const { theme } = useTheme();
  const { isAuthenticated, user } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { clearCart, groceryItems, pharmacyItems, groceryTotal, pharmacyTotal } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDeliveryMethod, setSelectedDeliveryMethod] = React.useState('1');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = React.useState('offline');

  // Determine cart type based on items
  const hasPharmacyItems = pharmacyItems.length > 0;
  const cartType = hasPharmacyItems ? 'pharma' : 'grocery';

  // Payment processing state
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Address state
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [addresses, setAddresses] = useState<any[]>([]);

  // Load addresses on component mount
  useEffect(() => {
    loadAddresses();
  }, []);

  // Handle address selection from MyAddressesScreen
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Check if we have a selected address from MyAddressesScreen
      const state = navigation.getState();
      const currentRoute = state.routes[state.index];
      if (currentRoute.name === 'PaymentMethods' && (currentRoute.params as any)?.selectedAddress) {
        setSelectedAddress((currentRoute.params as any).selectedAddress);
        // Clear the selected address from route params to avoid re-selection
        navigation.setParams({ selectedAddress: undefined });
      }
    });

    return unsubscribe;
  }, [navigation]);

  const loadAddresses = () => {
    // Mock addresses - in real app, fetch from API
    const mockAddresses = [
      {
        id: '1',
        name: user ? `${user.firstName} ${user.lastName}` : 'User Name',
        mobile: user?.mobile || '9999999999',
        email: user?.email || 'user@example.com',
        line1: '123 Main Street',
        line2: 'Apt 4B',
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110001',
        country: 'India',
        isDefault: true,
      },
      {
        id: '2',
        name: user ? `${user.firstName} ${user.lastName}` : 'User Name',
        mobile: user?.mobile || '9999999999',
        email: user?.email || 'user@example.com',
        line1: '456 Oak Avenue',
        line2: 'Floor 2',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        country: 'India',
        isDefault: false,
      },
    ];
    
    setAddresses(mockAddresses);
    // Set default address as selected only if no address is already selected
    if (!selectedAddress) {
      const defaultAddress = mockAddresses.find(addr => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddress(defaultAddress);
      }
    }
  };

  // Calculate bill details dynamically
  const subtotal = groceryTotal + pharmacyTotal;
  const productDiscount = Math.round(subtotal * 0.1); // 10% discount
  const shipping = 0; // No shipping fee for now
  const couponDiscount = 20; // Fixed coupon discount
  const total = subtotal - productDiscount + shipping - couponDiscount;

  const billDetails = {
    mrp: subtotal,
    productDiscount,
    shipping,
    couponDiscount,
    total: Math.max(0, total), // Ensure total is not negative
  };

  const handlePlaceOrder = async () => {
    if (!isAuthenticated) {
      // User is not logged in, go to phone auth
      navigation.navigate('PhoneAuth', { cartType });
      return;
    }

    // User is logged in, check payment method
    if (selectedPaymentMethod === 'online') {
      // Online payment - open Razorpay checkout
      await openRazorpayCheckout();
    } else {
      // Offline payment - directly place order
      await placeOfflineOrder();
    }
  };

  const placeOfflineOrder = async () => {
    try {
      setIsLoading(true);
      setIsProcessingPayment(true);
      
      console.log('🛒 Placing offline order...');
      
      // Prepare order data based on delivery method
      const isStoreDelivery = selectedDeliveryMethod === '1';
      const orderData: PlaceOrderRequest = {
        products: getCartItems(),
        deliveryMethod: isStoreDelivery ? 'store' : 'home_delivery',
        paymentMethod: 'offline' as const,
        // Only include address and billing details for home delivery
        ...(isStoreDelivery ? {} : {
          shippingAddress: selectedAddress || getShippingAddress(),
          billingSameAsShipping: true,
          billingAddress: null,
          storeDiscount: billDetails.productDiscount,
          couponDiscount: billDetails.couponDiscount,
          shippingAmount: billDetails.shipping,
          taxAmount: 0,
          subtotalAmount: billDetails.mrp,
          totalAmount: billDetails.total,
          expressDelivery: false,
          timeslot: undefined,
        }),
      };

      const response = await orderService.placeOrder(orderData);
      
      if (response.success && response.data) {
        console.log('✅ Offline order placed successfully:', response.data.orderNo);
        
        // Clear cart
        await clearCart();
        
        // Navigate to order confirmation
        navigation.navigate('OrderConfirmation', {
          orderId: response.data.orderId.toString(),
          amount: billDetails.total,
        });
      } else {
        throw new Error(response.error || 'Failed to place order');
      }
    } catch (error: any) {
      console.error('❌ Error placing offline order:', error);
      Alert.alert('Order Failed', error.message || 'Failed to place order. Please try again.');
    } finally {
      setIsLoading(false);
      setIsProcessingPayment(false);
    }
  };

  const openRazorpayCheckout = async () => {
    try {
      setIsProcessingPayment(true);
      
      // Use calculated total from bill details
      const totalAmount = billDetails.total;
      
      console.log('💳 Opening Razorpay Checkout...');
      console.log('💰 Amount:', totalAmount, '₹');
      
      // Navigate to RazorpayCheckoutScreen
      navigation.navigate('RazorpayCheckout', {
        amount: totalAmount,
        currency: 'INR',
        name: 'E-Commerce App',
        description: `${cartType === 'pharma' ? 'Pharmacy' : 'Grocery'} Order`,
        prefill: {
          name: user ? `${user.firstName} ${user.lastName}` : 'User Name',
          email: user?.email || 'user@example.com',
          contact: user?.mobile || '9999999999',
        },
        orderId: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        cartType: cartType,
        deliveryMethod: selectedDeliveryMethod === '1' ? 'Store Pickup' : 'Home Delivery',
      });
    } catch (error: any) {
      console.error('❌ Error opening Razorpay checkout:', error);
      Alert.alert('Payment Error', 'Failed to open payment gateway. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const getCartItems = () => {
    const items = cartType === 'grocery' ? groceryItems : pharmacyItems;
    return items.map(item => ({
      productId: item.id,
      quantity: item.quantity,
      price: item.price,
      name: item.name,
    }));
  };

  const getShippingAddress = () => {
    // Return selected address or default
    return selectedAddress || {
      name: user?.firstName + ' ' + user?.lastName || 'User',
      mobile: user?.mobile || '',
      email: user?.email || '',
      line1: '123 Main Street',
      line2: 'Apt 4B',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110001',
      country: 'India',
    };
  };

  const handleAddressChange = () => {
    // Navigate to address selection screen
    navigation.navigate('MyAddresses' as any, { fromPaymentMethods: true });
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      padding: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginTop: 18,
      marginBottom: 8,
      color: theme.colors.text,
    },
    row: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: 8,
    },
    chip: {
      backgroundColor: theme.colors.surface,
      borderRadius: 18,
      paddingHorizontal: 16,
      paddingVertical: 8,
      marginRight: 10,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    chipSelected: {
      backgroundColor: theme.colors.primary + '22',
      borderColor: theme.colors.primary,
      borderWidth: 1,
    },
    chipText: {
      color: theme.colors.text,
      fontSize: 15,
    },
    chipTextSelected: {
      color: theme.colors.primary,
      fontWeight: 'bold',
    },
    billRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 4,
      fontSize: 16,
      color: theme.colors.text,
    },
    paymentMethodContainer: {
      marginBottom: 20,
    },
    paymentMethodCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 2,
      borderColor: theme.colors.border,
    },
    paymentMethodSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary + '10',
    },
    paymentMethodHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    radioButton: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: theme.colors.border,
      marginRight: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    radioButtonSelected: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: theme.colors.primary,
    },
    paymentMethodLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
    },
    paymentMethodLabelSelected: {
      color: theme.colors.primary,
    },
    paymentMethodDescription: {
      fontSize: 14,
      color: theme.colors.secondary,
      marginLeft: 32,
    },
    paymentMethodDescriptionSelected: {
      color: theme.colors.primary + 'CC',
    },
    addressCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    addressHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    addressName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
    },
    changeAddressButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: theme.colors.primary + '20',
      borderRadius: 6,
    },
    changeAddressText: {
      color: theme.colors.primary,
      fontSize: 14,
      fontWeight: '500',
    },
    addressText: {
      fontSize: 14,
      color: theme.colors.text,
      marginBottom: 2,
    },
    addressContact: {
      fontSize: 14,
      color: theme.colors.secondary,
      marginTop: 4,
    },
  });


  return (
    <>
      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
        {/* Delivery Address */}
        {selectedDeliveryMethod === '2' && (
          <>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
            <View style={styles.addressCard}>
              <View style={styles.addressHeader}>
                <Text style={styles.addressName}>
                  {selectedAddress?.firstName ? `${selectedAddress.firstName} ${selectedAddress.lastName}` : selectedAddress?.name || 'User Name'}
                </Text>
                <TouchableOpacity onPress={handleAddressChange} style={styles.changeAddressButton}>
                  <Text style={styles.changeAddressText}>Change</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.addressText}>{selectedAddress?.line1 || '123 Main Street'}</Text>
              {selectedAddress?.line2 && (
                <Text style={styles.addressText}>{selectedAddress.line2}</Text>
              )}
              <Text style={styles.addressText}>
                {selectedAddress?.city || 'Delhi'}, {selectedAddress?.state || 'Delhi'} - {selectedAddress?.pincode || '110001'}
              </Text>
              <Text style={styles.addressText}>{selectedAddress?.country || 'India'}</Text>
              <Text style={styles.addressContact}>
                📞 {selectedAddress?.mobile || user?.mobile || '9999999999'}
              </Text>
              {selectedAddress?.isDefault && (
                <Text style={[styles.addressText, { color: theme.colors.primary, fontWeight: 'bold', marginTop: 4 }]}>
                  ✓ Default Address
                </Text>
              )}
            </View>
          </>
        )}

        {/* Delivery Method */}
        <Text style={styles.sectionTitle}>Delivery Method</Text>
        <View style={styles.row}>
          {deliveryMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[styles.chip, selectedDeliveryMethod === method.id && styles.chipSelected]}
              onPress={() => setSelectedDeliveryMethod(method.id)}
            >
              <Text style={[styles.chipText, selectedDeliveryMethod === method.id && styles.chipTextSelected]}>{method.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Payment Method */}
        <Text style={styles.sectionTitle}>Payment Method</Text>
        <View style={styles.paymentMethodContainer}>
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.paymentMethodCard,
                selectedPaymentMethod === method.id && styles.paymentMethodSelected
              ]}
              onPress={() => setSelectedPaymentMethod(method.id)}
            >
              <View style={styles.paymentMethodHeader}>
                <View style={styles.radioButton}>
                  {selectedPaymentMethod === method.id && <View style={styles.radioButtonSelected} />}
                </View>
                <Text style={[
                  styles.paymentMethodLabel,
                  selectedPaymentMethod === method.id && styles.paymentMethodLabelSelected
                ]}>
                  {method.label}
                </Text>
        </View>
              <Text style={[
                styles.paymentMethodDescription,
                selectedPaymentMethod === method.id && styles.paymentMethodDescriptionSelected
              ]}>
                {method.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Bill Details */}
        <Text style={styles.sectionTitle}>Bill Details</Text>
        <View style={styles.billRow}><Text>MRP Total</Text><Text>₹{billDetails.mrp}</Text></View>
        <View style={styles.billRow}><Text>Product Discount</Text><Text>-₹{billDetails.productDiscount}</Text></View>
        <View style={styles.billRow}><Text>Shipping</Text><Text>₹{billDetails.shipping}</Text></View>
        <View style={styles.billRow}><Text>Coupon Discount</Text><Text>-₹{billDetails.couponDiscount}</Text></View>
        <View style={[styles.billRow, { borderTopWidth: 1, borderTopColor: theme.colors.surface, marginTop: 8, paddingTop: 8 }]}>
          <Text style={{ fontWeight: 'bold' }}>Total</Text>
          <Text style={{ fontWeight: 'bold' }}>₹{billDetails.total}</Text>
        </View>


        {/* Place Order Button */}
        <ThemedButton title="Place Order" onPress={handlePlaceOrder} style={{ marginTop: 24 }} />
              </ScrollView>
      </SafeAreaView>

      <LoadingOverlay 
        visible={isLoading || isProcessingPayment} 
        message={isProcessingPayment ? "Processing payment..." : (selectedPaymentMethod === 'online' ? "Opening Razorpay..." : "Placing order...")} 
      />
    </>
  );
};

export default PaymentMethodsScreen; 