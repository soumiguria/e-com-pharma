import React, { useState } from 'react';
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
import { getRazorpayKeys, RAZORPAY_CONFIG } from '../../services/api/razorpayConfig';

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
  const cartType = hasPharmacyItems ? 'pharmacy' : 'grocery';

  // Get Razorpay keys
  const { keyId } = getRazorpayKeys();


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

  const handlePlaceOrder = () => {
    if (!isAuthenticated) {
      // User is not logged in, go to phone auth
      navigation.navigate('PhoneAuth', { cartType });
      return;
    }

    // User is logged in, check payment method
    if (selectedPaymentMethod === 'online') {
      // Online payment - open Razorpay checkout
      openRazorpayCheckout();
    } else {
      // Offline payment - directly place order
      placeOfflineOrder();
    }
  };

  const placeOfflineOrder = () => {
    setIsLoading(true);
    
    // Simulate offline order processing
    setTimeout(() => {
      setIsLoading(false);
      
      // Clear cart and navigate to confirmation
      clearCart();
      (navigation as any).navigate('OrderConfirmation');
      
      // No popup for offline payments - direct navigation
    }, 1500);
  };

  const openRazorpayCheckout = () => {
    // Use calculated total from bill details
    const totalAmount = billDetails.total;
    
    // Generate order ID
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log('💳 Opening Razorpay Checkout...');
    console.log('💰 Amount:', totalAmount, '₹');
    console.log('🆔 Order ID:', orderId);
    
    // Navigate to RazorpayCheckoutScreen
    (navigation as any).navigate('RazorpayCheckout', {
      amount: totalAmount,
      currency: 'INR',
      name: RAZORPAY_CONFIG.APP_NAME,
      description: `${cartType === 'pharmacy' ? 'Pharmacy' : 'Grocery'} Order`,
      prefill: {
        name: user ? `${user.firstName} ${user.lastName}` : 'User Name',
        email: user?.email || 'user@example.com',
        contact: user?.mobile || '9999999999',
      },
      orderId: orderId,
      cartType: cartType,
      deliveryMethod: selectedDeliveryMethod === '1' ? 'Store Pickup' : 'Home Delivery',
    });
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
  });


  return (
    <>
      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
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
        visible={isLoading} 
        message={selectedPaymentMethod === 'online' ? "Opening Razorpay..." : "Placing order..."} 
      />
    </>
  );
};

export default PaymentMethodsScreen; 