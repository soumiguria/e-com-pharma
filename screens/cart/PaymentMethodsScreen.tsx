import React, { useState, useEffect, useCallback, useRef } from 'react'; 
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ThemedButton from '../../components/ui/ThemedButton';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useCart } from '../../contexts/CartContext';
import LoadingOverlay from '../../components/ui/LoadingOverlay';
import { orderService } from '../../services/api';
import { addressService } from '../../services/api/addressService';
import { PlaceOrderRequest } from '../../services/api/orderService';
import { Address } from '../../services/api/addressService';
import storeService from '../../services/api/storeService';
import { useAppContext } from '../../contexts/AppContext';
import { validateCartItemsForStore } from '../../utils/orderValidation';
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
  const { selectedStore } = useAppContext();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { clearCart, groceryItems, pharmacyItems, groceryTotal, pharmacyTotal } = useCart();
  
  // Check if this is a reorder
  const reorderItems = (route.params as any)?.reorderItems;
  const reorderTotal = (route.params as any)?.reorderTotal;
  const isReorder = (route.params as any)?.isReorder;
  
  // Remove payment hook - use original working logic
  
  // Debug reorder data
  console.log('🔄 PaymentMethods reorder check:', { isReorder, reorderItems, reorderTotal });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDeliveryMethod, setSelectedDeliveryMethod] = React.useState('1');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = React.useState('offline');

  // Determine cart type and totals based on reorder or regular cart
  const hasPharmacyItems = pharmacyItems.filter(item => item.quantity > 0).length > 0;
  const cartType = hasPharmacyItems ? 'pharma' : 'grocery';
  
  // Use reorder totals if this is a reorder, otherwise use cart totals
  const currentItemTotal = isReorder ? (reorderItems?.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0) || 0) : (groceryTotal + pharmacyTotal);
  const currentGrandTotal = isReorder ? (reorderTotal || 0) : (groceryTotal + pharmacyTotal);

  // Payment processing state
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<null | boolean>(null);
  const [pendingOrderAmount, setPendingOrderAmount] = useState<number>(0);

  // Address state
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressLoading, setAddressLoading] = useState(true);
  const [storeDetails, setStoreDetails] = useState<any>(null);
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState<any[]>([]);
  const [availableDeliveryMethods, setAvailableDeliveryMethods] = useState<any[]>([]);

  // Check route params for selected address on mount
  useEffect(() => {
    const routeParams = (route.params as any) || {};
    const addressFromRoute = routeParams.selectedAddress;
    if (addressFromRoute) {
      console.log('📍 Setting selected address from route params on mount:', addressFromRoute);
      setSelectedAddress(addressFromRoute);
      // Clear the selected address from route params
      navigation.setParams({ selectedAddress: undefined } as any);
    }
  }, [route.params, navigation]);

  // Load addresses on component mount
  useEffect(() => {
    loadAddresses();
  }, []);

  // Load store details and payment methods
  useEffect(() => {
    const fetchStoreDetails = async () => {
      if (selectedStore?.id) {
        try {
          console.log('🏪 Fetching store details for payment methods, store ID:', selectedStore.id);
          const response = await storeService.getStoreDetailsById(selectedStore.id);
          if (response.success && response.data) {
            console.log('🏪 Store details fetched for payment methods:', response.data);
            setStoreDetails(response.data);
            
            // Set up available payment methods based on store config
            const storeConfig = response.data.config;
            const paymentMethods = [];
            const deliveryMethods = [];
            
            if (storeConfig?.paymentMethods?.online) {
              paymentMethods.push({ id: 'online', label: 'Online Payment', description: 'Pay now with Razorpay' });
            }
            
            if (storeConfig?.paymentMethods?.offline) {
              paymentMethods.push({ id: 'offline', label: 'Offline Payment', description: 'Pay at store or delivery' });
            }
            
            if (storeConfig?.deliveryMethods?.storePickup) {
              deliveryMethods.push({ id: '1', label: 'Store Pickup' });
            }
            
            if (storeConfig?.deliveryMethods?.homeDelivery) {
              deliveryMethods.push({ id: '2', label: 'Home Delivery' });
            }
            
            // Fallback to default methods if store config is not available
            if (paymentMethods.length === 0) {
              paymentMethods.push(
                { id: 'offline', label: 'Offline Payment', description: 'Pay at store or delivery' },
                { id: 'online', label: 'Online Payment', description: 'Pay now with Razorpay' }
              );
            }
            
            if (deliveryMethods.length === 0) {
              deliveryMethods.push(
                { id: '1', label: 'Store Pickup' },
                { id: '2', label: 'Home Delivery' }
              );
            }
            
            setAvailablePaymentMethods(paymentMethods);
            setAvailableDeliveryMethods(deliveryMethods);
            
            // Set default payment method - prefer offline if available
            if (paymentMethods.length > 0) {
              const offlineMethod = paymentMethods.find(m => m.id === 'offline');
              setSelectedPaymentMethod(offlineMethod ? 'offline' : paymentMethods[0].id);
            }
            
            // Set default delivery method to the first available one
            if (deliveryMethods.length > 0) {
              setSelectedDeliveryMethod(deliveryMethods[0].id);
            }
          } else {
            console.log('⚠️ Failed to fetch store details for payment methods:', response.error);
            // Use default payment methods
            setAvailablePaymentMethods(paymentMethods);
            setAvailableDeliveryMethods(deliveryMethods);
            
            // Set default payment method - prefer offline if available
            const offlineMethod = paymentMethods.find(m => m.id === 'offline');
            setSelectedPaymentMethod(offlineMethod ? 'offline' : paymentMethods[0].id);
          }
        } catch (error) {
          console.error('❌ Error fetching store details for payment methods:', error);
          // Use default payment methods
          setAvailablePaymentMethods(paymentMethods);
          setAvailableDeliveryMethods(deliveryMethods);
          
          // Set default payment method - prefer offline if available
          const offlineMethod = paymentMethods.find(m => m.id === 'offline');
          setSelectedPaymentMethod(offlineMethod ? 'offline' : paymentMethods[0].id);
        }
      } else {
        // No store selected, use default payment methods
        setAvailablePaymentMethods(paymentMethods);
        setAvailableDeliveryMethods(deliveryMethods);
        
        // Set default payment method - prefer offline if available
        const offlineMethod = paymentMethods.find(m => m.id === 'offline');
        setSelectedPaymentMethod(offlineMethod ? 'offline' : paymentMethods[0].id);
      }
    };

    fetchStoreDetails();
  }, [selectedStore?.id]);

  // Handle screen focus - reload addresses and check for selected address
  useFocusEffect(
    useCallback(() => {
      // Check if we have a selected address from MyAddressesScreen
      const routeParams = (route.params as any) || {};
      const addressFromRoute = routeParams.selectedAddress;
      
      if (addressFromRoute) {
        // Set the selected address from route params first
        console.log('📍 Setting selected address from route params on focus:', addressFromRoute);
        setSelectedAddress(addressFromRoute);
        // Clear the selected address from route params to avoid re-selection
        navigation.setParams({ selectedAddress: undefined } as any);
        // Then reload addresses (but don't reset selectedAddress)
        loadAddresses();
      } else {
        // No address from route, just reload addresses normally
        loadAddresses();
      }
    }, [route.params, navigation])
  );

  const loadAddresses = async () => {
    try {
      setAddressLoading(true);
      console.log('📍 Loading user addresses...');
      
      const response = await addressService.getAddresses();
      
      if (response.success && response.data) {
        // Handle nested response structure
        const responseData = response.data as any;
        const addressesList = responseData.data || responseData || [];
        
        console.log('📍 Loaded addresses:', addressesList);
        setAddresses(addressesList);
        
        // Set default address as selected only if no address is already selected
        // Use a callback to check the current state to avoid stale closure
        setSelectedAddress((currentSelected) => {
          if (currentSelected) {
            // Address already selected, verify it still exists in the list
            const addressStillExists = addressesList.find(
              (addr: Address) => addr.customerAddressId === currentSelected.customerAddressId || 
                                 addr._id === currentSelected._id
            );
            if (addressStillExists) {
              console.log('📍 Preserving selected address:', currentSelected);
              return currentSelected; // Keep the selected address
            } else {
              console.log('📍 Selected address no longer exists, setting default');
              // Selected address was deleted, fall through to set default
            }
          }
          
          // No address selected or selected address was deleted, set default
          const defaultAddress = addressesList.find((addr: Address) => addr.isDefault);
          if (defaultAddress) {
            console.log('📍 Set default address:', defaultAddress);
            return defaultAddress;
          } else if (addressesList.length > 0) {
            // If no default, use first address
            console.log('📍 Set first address as default:', addressesList[0]);
            return addressesList[0];
          } else {
            // No addresses available
            console.log('📍 No addresses found');
            return null;
          }
        });
      } else {
        console.log('  Failed to load addresses:', response.error);
        setAddresses([]);
        setSelectedAddress((currentSelected) => {
          // Only clear if no address was selected
          return currentSelected || null;
        });
      }
    } catch (error) {
      console.error('  Error loading addresses:', error);
      setAddresses([]);
      setSelectedAddress((currentSelected) => {
        // Only clear if no address was selected
        return currentSelected || null;
      });
    } finally {
      setAddressLoading(false);
    }
  };

  // Calculate bill details dynamically - use reorder totals if reordering
  const subtotal = isReorder ? currentItemTotal : (groceryTotal + pharmacyTotal);
  const shipping = 0; // No shipping fee for now
  const total = isReorder ? currentGrandTotal : (subtotal + shipping);

  const billDetails = {
    mrp: Math.round(subtotal * 100) / 100, // Round to 2 decimal places
    shipping: Math.round(shipping * 100) / 100, // Round to 2 decimal places
    total: Math.max(0, Math.round(total * 100) / 100), // Ensure total is not negative and rounded
  };

  const handlePlaceOrder = async () => {
    if (!isAuthenticated) {
      // User is not logged in, go to phone auth
      navigation.navigate('PhoneAuth', { cartType });
      return;
    }

    // Validate all cart items are from the selected store and available (grocery and pharmacy)
    const itemsToValidate = getCartItems().map((item: any) => ({
      productId: item.productId,
      quantity: item.quantity,
      name: item.name,
    }));
    const validation = await validateCartItemsForStore(selectedStore?.id, cartType, itemsToValidate);
    if (!validation.valid) {
      Alert.alert(
        'Items Not Available',
        validation.message || 'Some items do not belong to the selected store. Please remove them or change store.',
        [{ text: 'OK' }]
      );
      return;
    }

    // User is logged in, check payment method
    if (selectedPaymentMethod === 'online') {
      // Show Pay Now modal first
      setPendingOrderAmount(Math.round(billDetails.total * 100) / 100);
      setPaymentSuccess(null);
      setShowPaymentModal(true);
    } else {
      // Offline payment - directly place order
      await placeOfflineOrder();
    }
  };

  const placeOfflineOrder = async () => {
    try {
      setIsLoading(true);
      setIsProcessingPayment(true);

      // Validate cart items for selected store (skip for reorder; reorder validates elsewhere)
      if (!isReorder) {
        const itemsToValidate = getCartItems().map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity,
          name: item.name,
        }));
        const validation = await validateCartItemsForStore(selectedStore?.id, cartType, itemsToValidate);
        if (!validation.valid) {
          Alert.alert(
            'Items Not Available',
            validation.message || 'Some items do not belong to the selected store. Please remove them or change store.',
            [{ text: 'OK' }]
          );
          setIsLoading(false);
          setIsProcessingPayment(false);
          return;
        }
      }
      
      console.log('🛒 Placing offline order...');
      
      // Prepare order data based on delivery method
      const isStoreDelivery = selectedDeliveryMethod === '1';
      const productsToOrder = isReorder ? reorderItems : getCartItems();
      
      console.log('🔄 Order data being sent:', {
        isReorder,
        productsToOrder,
        deliveryMethod: isStoreDelivery ? 'store' : 'home',
        paymentMethod: 'offline'
      });
      
      const orderData: PlaceOrderRequest = {
        products: productsToOrder,
        deliveryMethod: isStoreDelivery ? 'store' : 'home',
        paymentMethod: 'offline' as const,
        type: cartType as 'pharma' | 'grocery', // Pass the cart type to specify order type
        storeId: selectedStore?.id, // Pass the selected store ID
        // Only include address and billing details for home delivery
        ...(isStoreDelivery ? {} : {
          shippingAddress: selectedAddress || getShippingAddress(),
          billingSameAsShipping: true,
          billingAddress: getAddressString(selectedAddress), // Convert to string format
          shippingAmount: billDetails.shipping,
          taxAmount: 0,
          subtotalAmount: billDetails.mrp,
          totalAmount: billDetails.total,
          expressDelivery: false,
          timeslot: undefined, // Can be set based on user selection
        }),
      };

      const response = await orderService.placeOrder(orderData);
      
      if (response.success && response.data) {
        console.log('✅ Offline order placed successfully:', response.data.orderNo);
        
        // Clear cart after successful order
        await clearCart();
        
        // Navigate to order confirmation screen
        const cartItems = getCartItems();
        navigation.navigate('OrderConfirmation', {
          orderId: String(response.data.orderId),
          // prescriptionRequired: response.data.prescriptionRequired || false, // Add prescriptionRequired field
          orderData: {
            items: cartItems.map((item: any) => ({
              id: item.productId || item.id,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              image: ''
            })),
            itemTotal: currentItemTotal,
            deliveryFee: 0,
            discount: 0,
            grandTotal: currentGrandTotal,
            deliveryMethod: selectedDeliveryMethod === '1' ? 'Store Pickup' : 'Home Delivery',
            shippingAddress: selectedDeliveryMethod === '2' ? getAddressString(selectedAddress) : undefined
          }
        });
      } else {
        // Show error popup with reason
        const errorMessage = response.error || 'Failed to place order. Please try again.';
        Alert.alert(
          'Order Cannot Be Placed',
          errorMessage,
          [{ text: 'OK' }]
        );
        return;
      }
    } catch (error: any) {
      console.error('❌ Error placing offline order:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Failed to place order. Please try again.';
      Alert.alert(
        'Order Cannot Be Placed',
        errorMessage,
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
      setIsProcessingPayment(false);
    }
  };

  const openRazorpayCheckout = async () => {
    try {
      setIsProcessingPayment(true);
      
      // Check if online payment is available for this store
      if (storeDetails && storeDetails.config && !storeDetails.config.paymentMethods?.online) {
        Alert.alert(
          'Online Payment Not Available',
          'Online payment is currently not available for this store. Please use offline payment (Cash on Delivery) instead.',
          [{ text: 'OK' }]
        );
        setIsProcessingPayment(false);
        return;
      }
      
      // Use calculated total from bill details
      const totalAmount = Math.round(billDetails.total * 100) / 100;
      
      console.log('💳 Opening Razorpay Checkout...');
      console.log('💰 Amount:', totalAmount, '₹');
      
      // Check if cart is empty
      if (totalAmount <= 0) {
        Alert.alert('Empty Cart', 'Your cart is empty. Please add items before placing an order.');
        setIsProcessingPayment(false);
        return;
      }
      
      // Navigate to RazorpayCheckoutScreen
      navigation.navigate('RazorpayCheckout', {
        amount: totalAmount,
        currency: 'INR',
        name: 'E-Commerce App',
        description: `${isReorder ? 'Reorder' : (cartType === 'pharma' ? 'Pharmacy' : 'Grocery')} Order`,
        prefill: {
          name: user ? `${user.firstName} ${user.lastName}` : 'User Name',
          email: user?.email || 'user@example.com',
          contact: user?.mobile || '9999999999',
        },
        orderId: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        cartType: cartType,
        deliveryMethod: selectedDeliveryMethod === '1' ? 'Store Pickup' : 'Home Delivery',
        isReorder: isReorder,
        reorderItems: reorderItems
      });
    } catch (error: any) {
      console.error('  Error opening Razorpay checkout:', error);
      Alert.alert('Payment Error', 'Failed to open payment gateway. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Listen for payment result when coming back from Razorpay screen
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      const state = navigation.getState();
      const currentRoute = state.routes[state.index];
      const params: any = currentRoute.params;
      if (currentRoute.name === 'PaymentMethods' && params?.paymentStatus) {
        const status = params.paymentStatus as 'success' | 'failed' | 'cancelled';
        if (status === 'success') {
          setPaymentSuccess(true);
        } else {
          setPaymentSuccess(false);
        }
        // Clear the flag so it doesn't re-trigger
        navigation.setParams({ paymentStatus: undefined });
      }
    });
    return unsubscribe;
  }, [navigation]);

  const getCartItems = () => {
    const items = cartType === 'grocery' ? groceryItems : pharmacyItems;
    // Only include items with quantity > 0
    return items.filter(item => item.quantity > 0).map(item => {
      // Use the stored productId if available, otherwise extract base ID from item.id
      let actualProductId = item.productId;
      
      // If no productId stored, extract base product ID from item.id
      // item.id might have variant suffix like "productId-variantId", we need just "productId"
      if (!actualProductId) {
        // Check if the item.id ends with a variant pattern like "-1", "-2", "-3"
        const variantPattern = /-\d+$/;
        if (variantPattern.test(item.id)) {
          // Remove the variant suffix (e.g., "-1", "-2", "-3")
          actualProductId = item.id.replace(variantPattern, '');
        } else {
          // No variant suffix, use the full ID
          actualProductId = item.id;
        }
      }
      
      return {
        productId: actualProductId, // Use base product ID for API (without variant suffix)
        quantity: item.quantity,
        price: item.price,
        name: item.name,
      };
    });
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

  const getAddressString = (address?: Address | null) => {
    if (address) {
      return `${address.firstName} ${address.lastName}, ${address.line1}${address.line2 ? ', ' + address.line2 : ''}, ${address.city}, ${address.state} - ${address.pincode}, ${address.country}`;
    }
    const addressObj = getShippingAddress();
    // Handle both Address type and fallback object type
    const name = 'firstName' in addressObj ? `${addressObj.firstName} ${addressObj.lastName}` : addressObj.name;
    return `${name}, ${addressObj.line1}, ${addressObj.city}, ${addressObj.state} - ${addressObj.pincode}, ${addressObj.country}`;
  };

  const handleAddressChange = () => {
    // Navigate to address selection screen
    navigation.navigate('MyAddresses' as any, { fromPaymentMethods: true });
  };

  const handleAddAddress = () => {
    navigation.navigate('LocationPicker' as any, { forAddress: true });
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
    loadingText: {
      fontSize: 14,
      color: theme.colors.secondary,
      textAlign: 'center',
      padding: 20,
    },
    noAddressCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderStyle: 'dashed',
    },
    noAddressContent: {
      alignItems: 'center',
    },
    noAddressTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 8,
    },
    noAddressText: {
      fontSize: 14,
      color: theme.colors.secondary,
      textAlign: 'center',
      marginBottom: 16,
      lineHeight: 20,
    },
    addAddressButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 8,
    },
    addAddressButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 8,
    },
  });


  return (
    <>
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false}>
        {/* Delivery Address */}
        {selectedDeliveryMethod === '2' && (
          <>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
            
            {addressLoading ? (
              <View style={styles.addressCard}>
                <Text style={styles.loadingText}>Loading addresses...</Text>
              </View>
            ) : selectedAddress ? (
              <View style={styles.addressCard}>
                <View style={styles.addressHeader}>
                  <Text style={styles.addressName}>
                    {selectedAddress?.firstName ? `${selectedAddress.firstName} ${selectedAddress.lastName}` : 'User Name'}
                  </Text>
                  <TouchableOpacity onPress={handleAddressChange} style={styles.changeAddressButton}>
                    <Text style={styles.changeAddressText}>Change</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.addressText}>
                  {[
                    selectedAddress?.line1,
                    selectedAddress?.city,
                    selectedAddress?.state,
                    selectedAddress?.pincode,
                    selectedAddress?.country,
                  ].filter(Boolean).join(', ')}
                </Text>
                <Text style={styles.addressContact}>
                  📞 {selectedAddress?.mobile || user?.mobile || ''}
                </Text>
                {selectedAddress?.isDefault && (
                  <Text style={[styles.addressText, { color: theme.colors.primary, fontWeight: 'bold', marginTop: 4 }]}>
                    ✓ Default Address
                  </Text>
                )}
              </View>
            ) : (
              <View style={styles.noAddressCard}>
                <View style={styles.noAddressContent}>
                  <Text style={styles.noAddressTitle}>No Default Address</Text>
                  <Text style={styles.noAddressText}>
                    Please add an address to continue with home delivery
                  </Text>
                  <TouchableOpacity 
                    style={[styles.addAddressButton, { backgroundColor: theme.colors.primary }]}
                    onPress={handleAddAddress}
                  >
                    <Ionicons name="add" size={20} color="#fff" />
                    <Text style={styles.addAddressButtonText}>Add Address</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </>
        )}

        {/* Delivery Method */}
        <Text style={styles.sectionTitle}>Delivery Method</Text>
        <View style={styles.row}>
          {availableDeliveryMethods.map((method) => (
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
          {availablePaymentMethods.map((method) => (
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
        <View style={styles.billRow}><Text>MRP Total</Text><Text>₹{Number(billDetails.mrp).toFixed(2)}</Text></View>
        <View style={styles.billRow}><Text>Shipping</Text><Text>₹{Number(billDetails.shipping).toFixed(2)}</Text></View>
        <View style={[styles.billRow, { borderTopWidth: 1, borderTopColor: theme.colors.surface, marginTop: 8, paddingTop: 8 }]}>
          <Text style={{ fontWeight: 'bold' }}>Total</Text>
          <Text style={{ fontWeight: 'bold' }}>₹{Number(billDetails.total).toFixed(2)}</Text>
        </View>


        {/* Place Order Button */}
        <ThemedButton 
          title={isReorder ? "Reorder Items" : "Place Order"} 
          onPress={handlePlaceOrder} 
          style={{ marginTop: 24, marginBottom: 80 }} 
        />
              </ScrollView>
      </SafeAreaView>

      <LoadingOverlay 
        visible={isLoading || isProcessingPayment} 
        message={isProcessingPayment ? "Placing Order..." : (selectedPaymentMethod === 'online' ? "Opening Razorpay..." : "Placing order...")} 
      />

      {/* Pay Now / Payment Successful Modal */}
      <Modal visible={showPaymentModal} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: '#00000066', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ width: '85%', borderRadius: 12, backgroundColor: theme.colors.surface, padding: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: theme.colors.text, marginBottom: 12 }}>
              {paymentSuccess === true ? 'Payment Successful' : paymentSuccess === false ? 'Payment Status' : 'Pay Now'}
            </Text>
            {paymentSuccess === null && (
              <>
                <Text style={{ color: theme.colors.secondary, marginBottom: 16 }}>Amount payable: ₹{Number(pendingOrderAmount).toFixed(2)}</Text>
                <ThemedButton title="Pay Now" onPress={openRazorpayCheckout} />
                <TouchableOpacity onPress={() => setShowPaymentModal(false)} style={{ marginTop: 12, alignSelf: 'center' }}>
                  <Text style={{ color: theme.colors.primary }}>Not now</Text>
                </TouchableOpacity>
              </>
            )}

            {paymentSuccess !== null && (
              <>
                <Text style={{ color: theme.colors.secondary, marginBottom: 16 }}>
                  {paymentSuccess ? 'Your payment was successful.' : 'Payment not completed. You can try again from My Orders.'}
                </Text>
                <ThemedButton
                  title="OK"
                  onPress={() => {
                    setShowPaymentModal(false);
                    if (paymentSuccess) {
                      // For pending orders, we don't have full order data, so use minimal data
                      navigation.navigate('OrderConfirmation' as any, {
                        amount: pendingOrderAmount,
                        orderData: {
                          items: [],
                          itemTotal: pendingOrderAmount,
                          deliveryFee: 0,
                          discount: 0,
                          grandTotal: pendingOrderAmount,
                          deliveryMethod: 'Payment Pending',
                          shippingAddress: 'Address not available',
                        },
                      });
                    }
                  }}
                />
              </>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
};

export default PaymentMethodsScreen; 