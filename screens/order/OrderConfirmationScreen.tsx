import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useCart } from '../../contexts/CartContext';
import storeService, { formatStoreAddress } from '../../services/api/storeService';
import orderListService from '../../services/api/orderListService';

type OrderConfirmationNavigationProp = NativeStackNavigationProp<RootStackParamList, 'OrderConfirmation'>;
type OrderConfirmationRouteProp = RouteProp<RootStackParamList, 'OrderConfirmation'>;

const OrderConfirmationScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<OrderConfirmationRouteProp>();
  const { clearCart } = useCart();
  const [buttonPressed, setButtonPressed] = useState<string | null>(null);
  const [storeDetails, setStoreDetails] = useState<any>(null);
  const [formattedStoreAddress, setFormattedStoreAddress] = useState<string>('');
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

  // Get order details from route params or use defaults
  const routeParams: any = route.params || {};
  const { paymentData, orderId: routeOrderId, amount: routeAmount, orderData: routeOrderData, prescriptionRequired: routePrescriptionRequired } = routeParams;
  const routeStoreId = routeParams.storeId;
  const orderId = routeOrderId || `ORD${Date.now().toString().slice(-8)}`;
  const totalAmount = routeAmount || 460;
  
  // Check prescriptionRequired from route params or orderData
  const prescriptionRequiredFromRoute = routePrescriptionRequired || (routeOrderData as any)?.prescriptionRequired || false;
  
  // State to track prescriptionRequired (can be updated from API)
  const [prescriptionRequired, setPrescriptionRequired] = useState<boolean>(prescriptionRequiredFromRoute);

  // Use real order data if available, otherwise fallback to mock data
  const orderDetails = routeOrderData ? {
    orderId,
    totalAmount: routeOrderData.grandTotal || totalAmount,
    items: routeOrderData.items || [],
    shippingAddress: routeOrderData.shippingAddress || 'Address not available',
    deliveryMethod: routeOrderData.deliveryMethod || 'Home Delivery',
    deliveryFee: routeOrderData.deliveryFee || 0,
    discount: routeOrderData.discount || 0,
    itemTotal: routeOrderData.itemTotal || 0,
    paymentData: paymentData,
  } : {
    // Fallback mock data
    orderId,
    totalAmount,
    items: [
      { id: '1', name: 'Sample Product 1', price: 200, quantity: 2, image: 'https://via.placeholder.com/50' },
      { id: '2', name: 'Sample Product 2', price: 150, quantity: 1, image: 'https://via.placeholder.com/50' },
    ],
    shippingAddress: '123 Main St, City, State - 12345',
    deliveryMethod: 'Home Delivery',
    deliveryFee: 50,
    discount: 20,
    itemTotal: 400,
    paymentData: paymentData,
  };

  // Update prescriptionRequired when route params change
  useEffect(() => {
    setPrescriptionRequired(prescriptionRequiredFromRoute);
  }, [prescriptionRequiredFromRoute]);

  // Fetch order details from API to check prescriptionRequired
  useEffect(() => {
    const fetchOrderDetails = async () => {
      // Always try to fetch from API if orderId exists and doesn't look like a mock ID
      if (orderId && !orderId.startsWith('ORD')) {
        try {
          console.log('📋 Fetching order details for prescription check:', orderId);
          console.log('📋 Current prescriptionRequired from route/orderData:', prescriptionRequiredFromRoute);
          const response = await orderListService.getOrderById(orderId);
          if (response.success && response.data) {
            const orderData = response.data;
            // Check prescriptionRequired field from API response
            const prescriptionRequiredValue = orderData.prescriptionRequired === true;
            console.log('📋 Order prescriptionRequired from API:', prescriptionRequiredValue);
            console.log('📋 Full order data prescriptionRequired field:', orderData.prescriptionRequired);
            setPrescriptionRequired(prescriptionRequiredValue);
          } else {
            // If API fetch fails, use the value from route/orderData
            console.log('📋 API fetch failed, using prescriptionRequired from route/orderData:', prescriptionRequiredFromRoute);
            setPrescriptionRequired(prescriptionRequiredFromRoute);
          }
        } catch (error) {
          console.error('❌ Error fetching order details:', error);
          // If API fetch fails, use the value from route/orderData
          console.log('📋 API error, using prescriptionRequired from route/orderData:', prescriptionRequiredFromRoute);
          setPrescriptionRequired(prescriptionRequiredFromRoute);
        }
      } else {
        // For mock orders or when orderId starts with "ORD", use prescriptionRequired from route/orderData
        console.log('📋 Using prescriptionRequired from route/orderData for mock order:', prescriptionRequiredFromRoute);
        setPrescriptionRequired(prescriptionRequiredFromRoute);
      }
    };

    fetchOrderDetails();
  }, [orderId, prescriptionRequiredFromRoute]);

  // Fetch store details for store address display
  useEffect(() => {
    const fetchStoreDetails = async () => {
      // Try to get store ID from order data or route params
      const storeId = (routeOrderData as any)?.storeId || routeStoreId;
      if (storeId && !storeDetails && orderDetails.deliveryMethod === 'Store Pickup') {
        console.log('🏪 Fetching store details for confirmation screen, store ID:', storeId);
             try {
               const response = await storeService.getStoreDetailsById(storeId);
               if (response.success && response.data) {
                 console.log('🏪 Store details fetched successfully for confirmation:', response.data);
                 const storeData = (response.data as any).data || response.data;
                 setStoreDetails(storeData);
                 
                 // Format the address with coordinates if available
                 const coordinates = storeData.location?.coordinates;
                 if (storeData.address || coordinates) {
                   const formattedAddress = formatStoreAddress(storeData.address || {}, coordinates);
                   setFormattedStoreAddress(formattedAddress);
                 }
               } else {
            console.log('⚠️ Failed to fetch store details for confirmation:', response.error);
          }
        } catch (error) {
          console.error('❌ Error fetching store details for confirmation:', error);
        }
      }
    };

    fetchStoreDetails();
  }, [routeOrderData, routeStoreId, storeDetails, orderDetails.deliveryMethod]);

  // Debug logging
  console.log('🎉 OrderConfirmation route params:', { paymentData, routeOrderId, routeAmount, routeOrderData });
  console.log('🎉 OrderConfirmation orderDetails:', orderDetails);
  console.log('🎯 Current prescriptionRequired state:', prescriptionRequired);
  console.log('🎯 prescriptionRequiredFromRoute:', prescriptionRequiredFromRoute);

  useEffect(() => {
    // Clear cart on successful order
    const clearCartAsync = async () => {
      await clearCart();
    };
    clearCartAsync();
    
    // Animate logo on mount
    Animated.parallel([
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []); // Remove clearCart from dependencies to prevent infinite loop

  const handleContinueShopping = () => {
    console.log('Continue Shopping pressed');
    setButtonPressed('continue');
    
    // Add a small delay for visual feedback
    setTimeout(() => {
      try {
        // Navigate to the main home screen
        navigation.reset({
          index: 0,
          routes: [{ 
            name: 'Main',
            params: {
              screen: 'Home',
              params: {
                screen: 'HomeRoot'
              }
            }
          }],
        });
      } catch (error) {
        console.error('Error navigating to Main:', error);
        // Fallback navigation
        navigation.navigate('Main' as any);
      }
    }, 200);
  };

  const handleViewOrderDetails = () => {
    console.log('View Order Details pressed');
    setButtonPressed('details');
    
    // Add a small delay for visual feedback
    setTimeout(() => {
      try {
        const orderData = { 
          id: orderId, 
          ...orderDetails,
          orderNumber: orderId,
          status: 'confirmed',
          orderDate: new Date().toISOString(),
          paymentStatus: paymentData ? 'paid' : 'pending'
        };
        navigation.navigate('OrderDetail', { order: orderData });
      } catch (error) {
        console.error('Error navigating to OrderDetail:', error);
        Alert.alert('Error', 'Unable to view order details. Please try again.');
      }
    }, 200);
  };

  const handleViewMyOrders = () => {
    console.log('View My Orders pressed');
    setButtonPressed('orders');
    
    // Add a small delay for visual feedback
    setTimeout(() => {
      try {
        // Navigate to orders screen
        navigation.navigate('Orders' as any);
      } catch (error) {
        console.error('Navigation error:', error);
        Alert.alert('Error', 'Unable to navigate to orders');
      } finally {
        setButtonPressed(null);
      }
    }, 500);
  };

  const handleClose = () => {
    console.log('Close pressed');
    try {
      // Navigate to the main home screen
      navigation.reset({
        index: 0,
        routes: [{ 
          name: 'Main',
          params: {
            screen: 'Home',
            params: {
              screen: 'HomeRoot'
            }
          }
        }],
      });
    } catch (error) {
      console.error('Error closing:', error);
      // Fallback navigation
      navigation.navigate('Main' as any);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      padding: 16,
      paddingTop: 20, // Add more top padding to bring close icon down
    },
    closeButton: {
      padding: 8,
      marginTop: 10, // Add margin to push button down further
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
    },
    thanksSection: {
      alignItems: 'center',
      marginBottom: 30,
    },
    thanksText: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: 20,
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: 20,
    },
    logo: {
      width: 80,
      height: 80,
      borderRadius: 40,
    },
    orderIdSection: {
      alignItems: 'center',
      marginBottom: 30,
    },
    orderIdLabel: {
      fontSize: 16,
      color: theme.colors.secondary,
      marginBottom: 8,
    },
    orderId: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.primary,
    },
    prescriptionSection: {
      alignItems: 'center',
      marginBottom: 20,
      paddingHorizontal: 20,
    },
    prescriptionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
      marginBottom: 8,
    },
    prescriptionButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 8,
    },
    prescriptionNote: {
      fontSize: 14,
      color: theme.colors.secondary,
      textAlign: 'center',
      fontStyle: 'italic',
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginVertical: 20,
    },
    section: {
      marginBottom: 25,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 15,
    },
    billRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    billLabel: {
      fontSize: 16,
      color: theme.colors.text,
    },
    billValue: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 10,
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    totalLabel: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    totalValue: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.primary,
    },
    addressSection: {
      backgroundColor: theme.colors.surface,
      padding: 15,
      borderRadius: 8,
      marginBottom: 20,
    },
    addressLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 8,
    },
    addressText: {
      fontSize: 14,
      color: theme.colors.text,
      lineHeight: 20,
    },
    actionButtons: {
      flexDirection: 'column',
      gap: 12,
      marginTop: 20,
    },
    actionButton: {
      flex: 1,
      paddingVertical: 15,
      borderRadius: 8,
      alignItems: 'center',
      marginHorizontal: 8,
      minHeight: 50,
      justifyContent: 'center',
    },
    primaryButton: {
      backgroundColor: theme.colors.primary,
    },
    secondaryButton: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.primary,
    },
    tertiaryButton: {
      backgroundColor: theme.colors.secondary,
      borderWidth: 1,
      borderColor: theme.colors.secondary,
    },
    primaryButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    secondaryButtonText: {
      color: theme.colors.primary,
      fontSize: 16,
      fontWeight: '600',
    },
    tertiaryButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Close Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <MaterialIcons name="close" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Thanks Section */}
        <View style={styles.thanksSection}>
          <Text style={styles.thanksText}>
            {paymentData ? 'Thank You! 🎉' : 'Order Placed! 📦'}
          </Text>
          <Text style={[styles.thanksText, { fontSize: 16, marginTop: 10, opacity: 0.7 }]}>
            {paymentData 
              ? 'Your order has been placed and payment completed successfully' 
              : 'Your order has been placed successfully (Payment pending)'
            }
          </Text>
          {/* Removed auto-redirect text per requirement */}
          
          <View style={styles.logoContainer}>
            <Animated.View
              style={{
                transform: [{ scale: logoScale }],
                opacity: logoOpacity,
              }}
            >
              <Image
                source={require('../../assets/logo.jpeg')}
                style={styles.logo}
                resizeMode="contain"
              />
            </Animated.View>
          </View>
        </View>

        {/* Order ID Section */}
        <View style={styles.orderIdSection}>
          <Text style={styles.orderIdLabel}>
            {paymentData ? 'Order Number' : 'Order ID'}
          </Text>
          <Text style={styles.orderId}>{orderDetails.orderId}</Text>
        </View>

        {/* Prescription Upload Section - Show only if prescriptionRequired is true */}
        {prescriptionRequired && (
          <View style={styles.prescriptionSection}>
            <TouchableOpacity
              style={styles.prescriptionButton}
              onPress={() => {
                const storeId = (routeOrderData as any)?.storeId || routeStoreId || (routeOrderData as any)?.store?.storeId;
                console.log('📤 Navigating to UploadPrescription with orderId:', orderDetails.orderId, 'storeId:', storeId);
                navigation.navigate('UploadPrescription', { 
                  orderId: orderDetails.orderId,
                  storeId: storeId
                });
              }}
            >
              <MaterialIcons name="upload-file" size={24} color="#fff" />
              <Text style={styles.prescriptionButtonText}>Upload Prescription</Text>
            </TouchableOpacity>
            <Text style={styles.prescriptionNote}>
              Please upload your prescription to complete the order
            </Text>
          </View>
        )}

        <View style={styles.divider} />

        {/* Bill Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bill Details</Text>
          
          {/* Item Total */}
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Item Total</Text>
            <Text style={styles.billValue}>₹{orderDetails.itemTotal.toFixed(2)}</Text>
          </View>
          
          {/* Individual Items */}
          {orderDetails.items.map((item: any, index: number) => (
            <View key={index} style={[styles.billRow, { marginLeft: 16, marginBottom: 4 }]}>
              <Text style={[styles.billLabel, { fontSize: 14, color: theme.colors.secondary }]}>
                {item.name} x{item.quantity}
              </Text>
              <Text style={[styles.billValue, { fontSize: 14 }]}>
                ₹{(item.price * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}
          
          {/* Delivery Charges */}
          {orderDetails.deliveryFee > 0 && (
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Delivery Charges</Text>
              <Text style={styles.billValue}>₹{orderDetails.deliveryFee.toFixed(2)}</Text>
            </View>
          )}
          
          {/* Discount */}
          {orderDetails.discount > 0 && (
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Discount</Text>
              <Text style={[styles.billValue, { color: '#4CAF50' }]}>
                -₹{orderDetails.discount.toFixed(2)}
              </Text>
            </View>
          )}
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>₹{orderDetails.totalAmount.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Delivery Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {orderDetails.deliveryMethod === 'Store Pickup' ? 'Pickup Information' : 'Delivery Information'}
          </Text>
          
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Delivery Method</Text>
            <Text style={styles.billValue}>{orderDetails.deliveryMethod}</Text>
          </View>
          
          {orderDetails.deliveryMethod === 'Store Pickup' ? (
            <View style={styles.addressSection}>
              <Text style={styles.addressLabel}>Store Pickup</Text>
           <Text style={styles.addressText}>
             {formattedStoreAddress || 'Please visit the store to collect your order. Order ID: ' + orderDetails.orderId}
           </Text>
            </View>
          ) : (
            <View style={styles.addressSection}>
              <Text style={styles.addressLabel}>Delivery Address</Text>
              <Text style={styles.addressText}>
                {typeof orderDetails.shippingAddress === 'string' 
                  ? orderDetails.shippingAddress 
                  : 'Address not available'}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.divider} />

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[
              styles.actionButton, 
              styles.secondaryButton,
              buttonPressed === 'continue' && { opacity: 0.6 }
            ]}
            onPress={handleContinueShopping}
            activeOpacity={0.7}
            disabled={buttonPressed !== null}
          >
            <Text style={styles.secondaryButtonText}>
              {buttonPressed === 'continue' ? 'Loading...' : 'Continue Shopping'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.actionButton, 
              styles.tertiaryButton,
              buttonPressed === 'orders' && { opacity: 0.6 }
            ]}
            onPress={handleViewMyOrders}
            activeOpacity={0.7}
            disabled={buttonPressed !== null}
          >
            <Text style={styles.tertiaryButtonText}>
              {buttonPressed === 'orders' ? 'Loading...' : 'View My Orders'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.actionButton, 
              styles.primaryButton,
              buttonPressed === 'details' && { opacity: 0.6 }
            ]}
            onPress={handleViewOrderDetails}
            activeOpacity={0.7}
            disabled={buttonPressed !== null}
          >
            <Text style={styles.primaryButtonText}>
              {buttonPressed === 'details' ? 'Loading...' : 'View Order Details'}
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Bottom spacing */}
        <View style={{ height: 56 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default OrderConfirmationScreen; 