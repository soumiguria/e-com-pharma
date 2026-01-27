import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  Linking,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/types';
import orderListService from '../../services/api/orderListService';
import * as Location from 'expo-location';
import storeService, { formatStoreAddress, createAddressFromCoordinates } from '../../services/api/storeService';
import { storeProductService } from '../../services/api/storeProductService';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCart } from '../../contexts/CartContext';

type OrderDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'OrderDetail'>;

const OrderDetailScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<OrderDetailScreenNavigationProp>();
  const route = useRoute();
  const { addToGroceryCart, addToPharmacyCart, groceryItems, pharmacyItems } = useCart();
  const params = route.params as any;
  const passedOrder = params?.order;
  const passedOrderId = params?.orderId as string | undefined;
  const scrollToBottom = params?.scrollToBottom === true;
  const highlightReorder = params?.highlightReorder === true;

  const scrollViewRef = useRef<any>(null);
  const reorderPulse = useRef(new Animated.Value(0)).current;
  const [isReorderHighlighted, setIsReorderHighlighted] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [apiOrder, setApiOrder] = useState<any>(null);
  const [storeDetails, setStoreDetails] = useState<any>(null);
  const [formattedStoreAddress, setFormattedStoreAddress] = useState<string>('');
  
  // Import orderListService to fetch order details
  const orderListService = require('../../services/api/orderListService').default;

  // Use API data if available, otherwise fallback to passed order
  const order = apiOrder || passedOrder;
  
  // Extract prescription URLs - check API response directly first, then nested data
  const prescriptionUrls = {
    signedPresciptionUrl: apiOrder?.signedPresciptionUrl || order?.signedPresciptionUrl || order?.originalOrderData?.signedPresciptionUrl,
    signedPrescriptionUrl: apiOrder?.signedPrescriptionUrl || order?.signedPrescriptionUrl || order?.originalOrderData?.signedPrescriptionUrl,
    prescriptionUrl: apiOrder?.prescriptionUrl || order?.prescriptionUrl || order?.originalOrderData?.prescriptionUrl,
  };
  
  // Final prescription URL with correct priority
  const finalPrescriptionUrl = prescriptionUrls.signedPresciptionUrl || prescriptionUrls.signedPrescriptionUrl || prescriptionUrls.prescriptionUrl;
  
  // Determine if this is a pharma order (only then show prescription section)
  const storeType = (apiOrder?.type || apiOrder?.store?.type || (order as any)?.originalOrderData?.type || order?.type || order?.store?.type || '').toString().toLowerCase();
  const isPharmaOrder = storeType === 'pharma';
  
  console.log('💊 Prescription URLs extracted:', prescriptionUrls);
  console.log('💊 Final prescription URL (PRIORITY: signedPresciptionUrl):', finalPrescriptionUrl);
  console.log('💊 Order store type for prescription section:', { storeType, isPharmaOrder });

  // Fetch order details from API when screen loads
  useEffect(() => {
    const fetchOrderData = async () => {
      // Always fetch fresh data if we have orderId
      const orderIdToFetch = passedOrderId || passedOrder?.orderId || passedOrder?.id;
      
      if (orderIdToFetch) {
        console.log('📦 ===== FETCHING ORDER DETAILS =====');
        console.log('📦 Order ID:', orderIdToFetch);
        
        try {
          setLoading(true);
          const res = await orderListService.getOrderById(orderIdToFetch);
          
          console.log('📦 ===== COMPLETE API RESPONSE =====');
          console.log(JSON.stringify(res, null, 2));
          console.log('📦 ===== END COMPLETE RESPONSE =====');
          
          if (res.success && res.data) {
            console.log('📦 ===== PRESCRIPTION FIELDS FROM API =====');
            console.log('signedPresciptionUrl:', res.data.signedPresciptionUrl);
            console.log('signedPrescriptionUrl:', res.data.signedPrescriptionUrl);
            console.log('prescriptionUrl:', res.data.prescriptionUrl);
            console.log('📦 ===== END PRESCRIPTION FIELDS =====');
            setApiOrder(res.data);
          } else {
            console.log('❌ Failed to fetch order details:', res.error);
          }
        } catch (error) {
          console.error('❌ Error fetching order details:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchOrderData();
  }, [passedOrderId, passedOrder?.orderId, passedOrder?.id]);

  // If user tapped "Re-order" from Orders list, scroll to bottom + highlight Reorder CTA
  useEffect(() => {
    if (!scrollToBottom && !highlightReorder) return;
    if (loading) return;

    if (scrollToBottom) {
      requestAnimationFrame(() => {
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd?.({ animated: true });
        }, 200);
      });
    }

    if (highlightReorder) {
      setIsReorderHighlighted(true);
      reorderPulse.setValue(0);
      Animated.sequence([
        Animated.timing(reorderPulse, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.timing(reorderPulse, { toValue: 0, duration: 220, useNativeDriver: true }),
        Animated.timing(reorderPulse, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.timing(reorderPulse, { toValue: 0, duration: 220, useNativeDriver: true }),
      ]).start(() => {
        setIsReorderHighlighted(false);
      });
    }

    navigation.setParams({ scrollToBottom: undefined, highlightReorder: undefined } as any);
  }, [scrollToBottom, highlightReorder, loading, navigation, reorderPulse]);

  // Fetch store details for store address display
  useEffect(() => {
    const fetchStoreDetails = async () => {
      const currentOrder = apiOrder || passedOrder;
      if (currentOrder?.storeId && !storeDetails) {
        console.log('🏪 Fetching store details for store ID:', currentOrder.storeId);
        try {
          const response = await storeService.getStoreDetailsById(currentOrder.storeId);
          if (response.success && response.data) {
            console.log('🏪 Store details fetched successfully:', response.data);
            const storeData = (response.data as any).data || response.data;
            setStoreDetails(storeData);

            // Format address using API fields + reverse geocoding if needed
            const coordinates = storeData.location?.coordinates as [number, number] | undefined;
            const apiAddress =
              storeData.address ||
              storeData.config?.address ||
              null;

            let finalAddress: string | undefined;

            // Check if API has any non-empty address fields
            const hasAnyAddressField =
              !!apiAddress &&
              [
                apiAddress.address1,
                apiAddress.address2,
                apiAddress.city,
                apiAddress.state,
                apiAddress.pincode,
                apiAddress.country,
              ].some((part: any) => typeof part === 'string' && part.trim().length > 0);

            // 1) Prefer nicely formatted API address if present
            if (hasAnyAddressField) {
              finalAddress = formatStoreAddress(apiAddress, coordinates);
            }
            // 2) If API address empty but coordinates present → reverse geocode
            else if (coordinates && coordinates.length === 2) {
              try {
                const [latitude, longitude] = coordinates;
                console.log('🗺️ OrderDetail reverse geocoding store coords:', {
                  storeId: currentOrder.storeId,
                  latitude,
                  longitude,
                });

                const results = await Location.reverseGeocodeAsync({
                  latitude,
                  longitude,
                });

                if (results && results.length > 0) {
                  const r = results[0];
                  const parts = [
                    r.name,
                    r.street,
                    r.city || r.subregion,
                    r.region,
                    r.postalCode,
                    r.country,
                  ].filter(Boolean);

                  if (parts.length > 0) {
                    finalAddress = parts.join(', ');
                  } else {
                    finalAddress = createAddressFromCoordinates(latitude, longitude);
                  }
                } else {
                  finalAddress = createAddressFromCoordinates(latitude, longitude);
                }
              } catch (geoErr) {
                console.warn('⚠️ OrderDetail reverse geocoding failed:', geoErr);
                if (coordinates && coordinates.length === 2) {
                  const [lat, lng] = coordinates;
                  finalAddress = createAddressFromCoordinates(lat, lng);
                }
              }
            }

            if (finalAddress) {
              console.log('🏪 OrderDetail store address resolved:', finalAddress);
              setFormattedStoreAddress(finalAddress);
            }
          } else {
            console.log('⚠️ Failed to fetch store details:', response.error);
          }
        } catch (error) {
          console.error('❌ Error fetching store details:', error);
        }
      }
    };

    fetchStoreDetails();
  }, [apiOrder, passedOrder, storeDetails]);

    // Add default values to prevent undefined errors
  // Normalize payment status/mode for consistent UI
  const backendPayment = order?.payment || (order as any)?.paymentData || null;
  const backendPaymentStatus = (backendPayment?.status || order?.paymentStatus || order?.status || '').toString().toLowerCase();
  const paymentIdPresent = !!(order?.paymentId || backendPayment?.paymentId);
  let normalizedPaymentStatus: 'paid' | 'pending' | 'cancelled' | 'failed' | 'unknown' = 'unknown';
  if (['completed', 'success', 'paid'].includes(backendPaymentStatus)) normalizedPaymentStatus = 'paid';
  else if (['pending', 'processing', 'initiated'].includes(backendPaymentStatus)) normalizedPaymentStatus = 'pending';
  else if (['cancelled', 'canceled'].includes(backendPaymentStatus)) normalizedPaymentStatus = 'cancelled';
  else if (['failed', 'failure', 'error'].includes(backendPaymentStatus)) normalizedPaymentStatus = 'failed';
  if (normalizedPaymentStatus === 'unknown' && paymentIdPresent) normalizedPaymentStatus = 'pending';

  const normalizedPaymentMode: 'online' | 'offline' | 'unknown' =
    backendPayment?.mode === 'online' || order?.paymentMethod === 'online' ? 'online'
      : backendPayment?.mode === 'offline' ? 'offline' : 'unknown';

  // Helper function to format address object into string
  const formatAddressString = (address: any): string => {
    if (!address) return 'Store Pickup';
    
    // If it's already a string, return it
    if (typeof address === 'string') return address;
    
    // If it's an object, format it
    if (typeof address === 'object') {
      const parts = [
        address.line1,
        address.line2,
        address.city,
        address.state,
        address.pincode,
        address.country,
      ].filter(Boolean); // Remove empty/null/undefined values
      
      return parts.length > 0 ? parts.join(', ') : 'Store Pickup';
    }
    
    return 'Store Pickup';
  };

  // Format shipping address - prioritize string from OrderConfirmation, then API object
  const shippingAddress = order?.shippingAddress;
  let formattedShippingAddress: string = 'Store Pickup';
  
  // Extract individual address fields for display
  let addressLine1: string = '';
  let addressCity: string = '';
  let addressState: string = '';
  let addressPincode: string = '';
  let addressCountry: string = '';
  
  // Priority 1: If shippingAddress is already a string (from OrderConfirmation)
  if (typeof shippingAddress === 'string' && shippingAddress.trim().length > 0) {
    formattedShippingAddress = shippingAddress;
    // Try to parse the string to extract fields (format: "Name, Line1, City, State - Pincode, Country")
    const parts = shippingAddress.split(',');
    if (parts.length >= 3) {
      addressLine1 = parts[1]?.trim() || '';
      addressCity = parts[2]?.trim() || '';
      // State might be in format "State - Pincode"
      const statePart = parts[3]?.trim() || '';
      const statePincodeParts = statePart.split('-');
      addressState = statePincodeParts[0]?.trim() || '';
      addressPincode = statePincodeParts[1]?.trim() || '';
      addressCountry = parts[4]?.trim() || '';
    }
  }
  // Priority 2: If shippingAddress is an object with an address property (from API)
  else if (shippingAddress && typeof shippingAddress === 'object' && shippingAddress.address) {
    formattedShippingAddress = typeof shippingAddress.address === 'string' 
      ? shippingAddress.address 
      : formatAddressString(shippingAddress.address);
    // Extract from object if available
    if (shippingAddress.line1) addressLine1 = shippingAddress.line1;
    if (shippingAddress.city) addressCity = shippingAddress.city;
    if (shippingAddress.state) addressState = shippingAddress.state;
    if (shippingAddress.pincode) addressPincode = shippingAddress.pincode;
    if (shippingAddress.country) addressCountry = shippingAddress.country;
  }
  // Priority 3: If shippingAddress is an object without address property, format it
  else if (shippingAddress && typeof shippingAddress === 'object') {
    formattedShippingAddress = formatAddressString(shippingAddress);
    // Extract individual fields from object
    if (shippingAddress.line1) addressLine1 = shippingAddress.line1;
    if (shippingAddress.city) addressCity = shippingAddress.city;
    if (shippingAddress.state) addressState = shippingAddress.state;
    if (shippingAddress.pincode) addressPincode = shippingAddress.pincode;
    if (shippingAddress.country) addressCountry = shippingAddress.country;
  }
  
  // Create comma-separated address string
  const addressParts = [
    addressLine1,
    addressCity,
    addressState,
    addressPincode,
    addressCountry,
  ].filter(Boolean); // Remove empty values
  const fullAddressString = addressParts.length > 0 ? addressParts.join(', ') : formattedShippingAddress;

  const orderData = {
    id: order?.orderNo || order?.orderNumber || order?.id || 'N/A',
    orderId: order?.orderId || order?.id,
    orderNumber: order?.orderNo || order?.orderNumber || order?.id || 'N/A',
    items: (order?.orderItems || order?.items || order?.products || []).map((it: any) => {
      // Try multiple possible product ID fields from different API response structures
      const productId = it.productId || it.product_id || it.id || it._id || it.productERPId || it.productNumber || `product_${Math.random().toString(36).substr(2, 9)}`;
      const name = it.fullName || it.name || it.productName || it.product_name || 'Product';
      const price = Number(it.actual ?? it.price ?? it.sp ?? it.selling_price ?? 0); // Rate
      const quantity = Number(it.quantity ?? 1); // Qty
      const amount = price * quantity; // Amount = Rate × Qty
      
      return {
        id: productId,
        productId: productId, // Store actual product ID for reordering
        name: name, // Item Name
        price: price, // Rate
        originalPrice: Number(it.mrp ?? it.original_price ?? 0),
        quantity: quantity, // Qty
        amount: amount, // Amount = Rate × Qty
        image: it.images?.primary || it.signedImages?.primary || it.image || 'https://i.ibb.co/vCkbyTDX/Whats-App-Image-2026-01-24-at-11-14-54-PM.jpg',
        // Additional fields if available
        variant: it.variant,
        packing: it.packing || it.variant?.unit || '',
        discount: Number(it.discount || it.discountAmount || 0),
        tax: Number(it.tax || it.taxAmount || 0),
      };
    }),
    itemTotal: Number(order?.subtotalAmount || order?.itemTotal || order?.total || 0),
    deliveryFee: Number(order?.shippingAmount || order?.deliveryFee || 0),
    discount: Number(order?.storeDiscount || order?.discount || 0),
    grandTotal: Number(order?.totalAmount || order?.grandTotal || order?.total || 0),
    paymentMode: normalizedPaymentMode === 'online' ? 'Online' : normalizedPaymentMode === 'offline' ? 'Offline' : 'Unknown',
    paymentStatus: normalizedPaymentStatus,
    orderType: order?.deliveryMethod === 'store' || order?.deliveryMethod === 'store_pickup' ? 'Store Pickup' : 'Home Delivery',
    address: formattedShippingAddress || formatAddressString(order?.address) || 'Store Pickup',
    orderDate: order?.createdAt ? new Date(order.createdAt).toLocaleDateString() : order?.date ? new Date(order.date).toLocaleDateString() : order?.orderDate || new Date().toLocaleDateString(),
    status: order?.status || 'Processing',
  };

  // Debug logging
  console.log('📦 Order data for rendering:', JSON.stringify(orderData, null, 2));
  console.log('📦 Raw order object:', JSON.stringify(order, null, 2));
  console.log('📦 Order items structure:', JSON.stringify(order?.orderItems || order?.items, null, 2));
  console.log('📦 First item structure:', JSON.stringify((order?.orderItems || order?.items)?.[0], null, 2));

  const handleDownloadInvoice = () => {
    if (!order) {
      Alert.alert('Error', 'Order data not available');
      return;
    }
    
    // Ensure all details are properly passed to invoice preview
    const itemsWithAmount = orderData.items.map((item: any) => {
      const price = item.price || 0;
      const quantity = item.quantity || 1;
      const amount = item.amount || (price * quantity);
      return {
        ...item,
        // Ensure amount is calculated if not present
        amount: amount,
        // Ensure all fields are present
        name: item.name || 'Unknown Product',
        quantity: quantity,
        price: price,
        discount: item.discount || 0,
        tax: item.tax || 0,
        taxAmount: item.tax || 0,
        discountAmount: item.discount || 0,
      };
    });
    
    // Calculate total from items if orderData.grandTotal is 0 or missing
    const calculatedTotal = itemsWithAmount.reduce((sum: number, item: any) => sum + (item.amount || 0), 0);
    const orderTotal = orderData.grandTotal || 0;
    const finalTotal = orderTotal > 0 ? orderTotal : calculatedTotal;
    
    // Convert orderDate to ISO format if it's in DD/MM/YYYY format
    let orderDateISO = orderData.orderDate;
    if (orderData.orderDate && typeof orderData.orderDate === 'string' && orderData.orderDate.includes('/')) {
      // Parse DD/MM/YYYY format
      const [day, month, year] = orderData.orderDate.split('/');
      if (day && month && year) {
        orderDateISO = new Date(`${year}-${month}-${day}`).toISOString();
      }
    } else if (order?.createdAt) {
      orderDateISO = order.createdAt;
    } else if (orderData.orderDate) {
      // Try to parse as is
      const parsed = new Date(orderData.orderDate);
      orderDateISO = isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
    } else {
      orderDateISO = new Date().toISOString();
    }
    
    const invoiceData = {
      ...orderData,
      items: itemsWithAmount,
      total: finalTotal, // Ensure total is set correctly
      grandTotal: finalTotal, // Also set grandTotal for consistency
      orderDate: orderDateISO, // Ensure orderDate is in ISO format
      storeName: storeDetails?.name || order?.store?.name || 'Store', // Include store name
      storeId: order?.storeId || 'N/A', // Include store ID
      deliveryMethod: orderData.orderType || 'Home Delivery',
      deliveryAddress: orderData.address || order.shippingAddress?.address || 'Store Pickup',
    };
    
    console.log('📄 Navigating to InvoicePreview with data:', JSON.stringify(invoiceData, null, 2));
    // Navigate to invoice preview screen
    navigation.navigate('InvoicePreview', { orderData: invoiceData } as any);
  };

  const handleCallStore = async () => {
    try {
      const storeId = order?.storeId || (order as any)?.originalOrderData?.storeId;
      if (!storeId) {
        Alert.alert('Store Info', 'Store information not available');
        return;
      }

      // Fetch store details to get phone number
      const response = await storeService.getStoreDetailsById(storeId);
      if (response.success && response.data) {
        const storeData = (response.data as any).data || response.data;
        const phoneNumber = storeData.mobile || storeData.phone;
        
        if (phoneNumber) {
          const { Linking } = require('react-native');
          Alert.alert(
            'Call Store',
            `Call ${storeData.name || 'store'} at ${phoneNumber}?`,
            [
              { text: 'Cancel', style: 'cancel' },
              { 
                text: 'Call', 
                onPress: () => {
                  Linking.openURL(`tel:${phoneNumber}`).catch((err: any) => {
                    console.error('Error opening phone dialer:', err);
                    Alert.alert('Error', 'Unable to open phone dialer');
                  });
                }
              }
            ]
          );
        } else {
          Alert.alert('Contact Info', 'Store phone number not available');
        }
      } else {
        Alert.alert('Error', 'Failed to fetch store details');
      }
    } catch (error) {
      console.error('Error calling store:', error);
      Alert.alert('Error', 'Failed to initiate call');
    }
  };

  const handleReorder = async () => {
    console.log('🔄 ===== REORDER FUNCTION CALLED =====');
    console.log('🔄 Order object:', order);
    console.log('🔄 API Order data:', apiOrder);
    
    try {
      // Use API order data if available, otherwise fallback to order
      const sourceOrder = apiOrder || order;
      const sourceItems = sourceOrder?.orderItems || sourceOrder?.items || [];
      
      console.log('🔄 Using source order:', sourceOrder ? 'Available' : 'None');
      console.log('🔄 Source items:', sourceItems);
      
      if (!sourceItems || sourceItems.length === 0) {
        console.error('❌ No items found to reorder');
        Alert.alert('Error', 'No items found to reorder.');
        return;
      }
      
      // Get store ID for fetching current product details
      const storeId = sourceOrder?.storeId || order?.storeId || storeDetails?.id;
      if (!storeId) {
        Alert.alert('Error', 'Store information not found. Cannot reorder items.');
        return;
      }
      
      // Determine store type
      const storeType = sourceOrder?.type || sourceOrder?.store?.type || 'grocery';
      const isPharmacyStore = storeType === 'pharma';
      
      console.log('🔄 Store type:', storeType);
      console.log('🔄 Is pharmacy store:', isPharmacyStore);
      console.log('🔄 Store ID:', storeId);
      
      // Process each item - fetch current details and validate
      const validItems: any[] = [];
      const invalidItems: string[] = [];
      
      for (const item of sourceItems) {
        try {
          console.log(`🔄 Processing item:`, item);
          
          // Get product ID - try multiple fields
          const productId = item.productId || item.productMasterId || item.id || item._id;
          
          if (!productId) {
            console.error('❌ No product ID found for item');
            invalidItems.push(item.productName || item.name || 'Unknown Product');
            continue;
          }
          
          console.log('🔍 Fetching current product details for:', productId);
          
          // Fetch current product details from API
          const productResponse = isPharmacyStore
            ? await storeProductService.getPharmaProductDetails(storeId, productId)
            : await storeProductService.getGroceryProductDetails(storeId, productId);
          
          if (!productResponse.success || !productResponse.data) {
            console.error('❌ Product not found or API error:', productId);
            invalidItems.push(item.productName || item.name || 'Unknown Product');
            continue;
          }
          
          const currentProduct = productResponse.data;
          const requestedQuantity = item.quantity || 1;
          
          // Validate product availability and quantity
          const availableQty = currentProduct.availableQty || 0;
          const isAvailable = currentProduct.isAvailable !== false && availableQty > 0;
          
          if (!isAvailable || availableQty < requestedQuantity) {
            console.error('❌ Product not available or insufficient quantity:', {
              productId,
              requestedQuantity,
              availableQty,
              isAvailable
            });
            invalidItems.push(
              `${item.productName || item.name || 'Unknown Product'} (Requested: ${requestedQuantity}, Available: ${availableQty})`
            );
            continue;
          }
          
          // Get current price - use actual current price, not old price
          const currentPrice = currentProduct.price || 0;
          
          if (!currentPrice || currentPrice <= 0) {
            console.error('❌ Invalid price for product:', productId);
            invalidItems.push(item.productName || item.name || 'Unknown Product');
            continue;
          }
          
          // Prepare product data with current details
          const productData = {
            id: productId,
            name: currentProduct.name || item.productName || item.name || 'Unknown Product',
            price: currentPrice, // Use current price
            originalPrice: currentProduct.originalPrice || currentPrice,
            image: currentProduct.image || currentProduct.images?.[0] || item.productImage || item.image || 'https://via.placeholder.com/150',
            description: currentProduct.description || item.productDescription || item.description || '',
            unit: currentProduct.unit || item.unit || 'piece',
            mrp: currentProduct.originalPrice || currentPrice,
            discount: currentProduct.discountPercentage || item.discountAmount || item.discount || 0,
            category: currentProduct.category || (isPharmacyStore ? 'pharma' : 'grocery'),
            brand: currentProduct.brand || item.brand || '',
            weight: currentProduct.weight || item.weight || '',
            expiryDate: currentProduct.expiryDate || item.expiryDate || '',
            // manufacturer: currentProduct.manufacturer || item.manufacturer || '',
            productId: productId,
            availableQty: availableQty // Store available quantity
          };
          
          console.log('✅ Valid product with current details:', productData);
          
          // Add to valid items list with quantity
          validItems.push({
            productData,
            quantity: requestedQuantity
          });
          
        } catch (error) {
          console.error('❌ Error processing item:', error);
          invalidItems.push(item.productName || item.name || 'Unknown Product');
        }
      }
      
      // Check if any items are valid
      if (validItems.length === 0) {
        const errorMsg = invalidItems.length > 0
          ? `None of the items are available:\n${invalidItems.map((name, idx) => `${idx + 1}. ${name}`).join('\n')}`
          : 'No items could be added to cart. Please check product availability.';
        
        Alert.alert('Cannot Reorder', errorMsg);
        return;
      }
      
      // Add valid items to cart with correct quantity
      for (const { productData, quantity } of validItems) {
        for (let i = 0; i < quantity; i++) {
          if (isPharmacyStore) {
            console.log('🔄 Adding to pharmacy cart:', productData.name);
            addToPharmacyCart(productData);
          } else {
            console.log('🔄 Adding to grocery cart:', productData.name);
            addToGroceryCart(productData);
          }
        }
      }
      
      console.log('✅ Valid items added to cart successfully');
      
      // Show success message with details
      let successMsg = `${validItems.length} item(s) added to cart with current prices.`;
      if (invalidItems.length > 0) {
        successMsg += `\n\n${invalidItems.length} item(s) could not be added:\n${invalidItems.map((name, idx) => `${idx + 1}. ${name}`).join('\n')}`;
      }
      
      Alert.alert('Success', successMsg, [{ text: 'OK' }]);
      
    } catch (error) {
      console.error('❌ Error in reorder:', error);
      Alert.alert('Error', 'Failed to reorder items. Please try again.');
    }
  };

  const handlePayNow = () => {
    // Get the correct orderNo - prioritize orderNumber field from OrdersScreen
    const orderNo = order?.orderNumber || (order as any)?.originalOrderData?.orderNo || orderData.id;
    
    console.log('💳 Pay Now pressed for order:', orderNo);
    console.log('📋 Order object:', order);
    console.log('🔍 OrderNo sources check:', {
      'order.orderNumber': order?.orderNumber,
      'originalData.orderNo': (order as any)?.originalOrderData?.orderNo,
      'orderData.id': orderData.id,
      'finalOrderNo': orderNo
    });
    console.log('💰 Amount breakdown:', {
      subtotalAmount: order?.subtotalAmount,
      storeDiscount: order?.storeDiscount,
      couponDiscount: order?.couponDiscount,
      shippingAmount: order?.shippingAmount,
      taxAmount: order?.taxAmount,
      totalAmount: order?.totalAmount,
      grandTotal: orderData.grandTotal
    });
    
    // Navigate to Razorpay checkout with order details
    navigation.navigate('RazorpayCheckout' as any, {
      amount: orderData.grandTotal, // Use calculated grandTotal from backend amounts
      currency: 'INR',
      name: 'Order Payment',
      description: `Payment for Order ${orderNo}`,
      cartType: 'pharma', // Default, can be determined from order
      deliveryMethod: orderData.orderType === 'Store Pickup' ? 'Store Pickup' : 'Home Delivery',
      orderId: orderNo, // Use the actual orderNo from backend
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
        console.log('📦 ===== FETCHING ORDER DETAILS =====');
        console.log('📦 Order ID:', passedOrderId);
        const res = await orderListService.getOrderById(passedOrderId);
        
        console.log('📦 ===== COMPLETE API RESPONSE =====');
        console.log(JSON.stringify(res, null, 2));
        console.log('📦 ===== END COMPLETE RESPONSE =====');
        
        if (res.success && res.data) {
          console.log('📦 ===== PRESCRIPTION FIELDS FROM API =====');
          console.log('signedPresciptionUrl:', res.data.signedPresciptionUrl);
          console.log('signedPrescriptionUrl:', res.data.signedPrescriptionUrl);
          console.log('prescriptionUrl:', res.data.prescriptionUrl);
          console.log('📦 ===== END PRESCRIPTION FIELDS =====');
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
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      marginHorizontal: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
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
    addressRow: {
      marginBottom: 8,
    },
    addressValue: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
      marginTop: 4,
      lineHeight: 20,
      flexWrap: 'wrap',
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
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
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
  prescriptionCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  prescriptionContainer: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 12,
  },
  prescriptionImage: {
    width: 200,
    height: 150,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  pdfContainer: {
    width: 200,
    height: 150,
    borderRadius: 12,
  },
  prescriptionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  prescriptionOverlayText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  prescriptionText: {
    fontSize: 14,
    textAlign: 'center',
  },
  uploadPrescriptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginVertical: 8,
  },
  uploadPrescriptionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
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
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
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
            <Text style={{ fontSize: 16, fontWeight: '600', textAlign: 'center', color: theme.colors.text }}>
              Loading your orders...
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
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
            <Text style={styles.downloadButtonText} numberOfLines={1} ellipsizeMode="tail">Preview Invoice</Text>
          </TouchableOpacity>
        </View>

        <ScrollView ref={scrollViewRef} style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Order Info */}
          <View style={[styles.orderInfoCard, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.orderInfoRow}>
              <Text style={[styles.orderInfoLabel, { color: theme.colors.text }]}>
                {orderData.paymentStatus === 'pending' ? 'Order Number:' : 'Order Number:'}
              </Text>
              <Text style={[styles.orderInfoValue, { color: theme.colors.primary }]}>
                {orderData.paymentStatus === 'pending' ? orderData.id : orderData.id}
              </Text>
            </View>
            
            <View style={styles.orderInfoRow}>
              <Text style={[styles.orderInfoLabel, { color: theme.colors.text }]}>
                Order Date:
              </Text>
              <Text style={[styles.orderInfoValue, { color: theme.colors.text }]}>
                {orderData.orderDate}
              </Text>
            </View>
            
            <View style={styles.orderInfoRow}>
              <Text style={[styles.orderInfoLabel, { color: theme.colors.text }]}>
                Status:
              </Text>
              <Text style={[styles.orderInfoValue, { color: orderData.paymentStatus === 'paid' ? '#4CAF50' : orderData.paymentStatus === 'pending' ? '#FF9800' : orderData.paymentStatus === 'failed' ? '#F44336' : theme.colors.secondary }]}>
                {orderData.paymentStatus ? orderData.paymentStatus.charAt(0).toUpperCase() + orderData.paymentStatus.slice(1) : 'Unknown'}
              </Text>
            </View>
          </View>

          {/* Items */}
          <View style={[styles.itemsCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Items ({orderData.items.length})
            </Text>
            
            {orderData.items.map((item: any, index: number) => (
              <View key={item.id || index} style={styles.itemRow}>
                {/* <Image
                  source={{ uri: item.image || '' }}
                  style={styles.itemImage}
                /> */}
                {/* take the image from the signedImage field if available, otherwise use the image field */}
                <Image
                  source={{ uri: item.signedImage || item.image || 'https://i.ibb.co/vCkbyTDX/Whats-App-Image-2026-01-24-at-11-14-54-PM.jpg' }}
                  style={styles.itemImage}
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

          {/* Delivery / Store Info with decoded coordinates */}
          <View style={[styles.deliveryCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              {orderData.orderType === 'Store Pickup' ? 'Store Information' : 'Delivery Information'}
            </Text>
            
            <View style={styles.deliveryRow}>
              <MaterialCommunityIcons name={orderData.orderType === 'Store Pickup' ? 'store' : 'truck-delivery'} size={20} color={theme.colors.primary} />
              <Text style={[styles.deliveryText, { color: theme.colors.text }]}>{orderData.orderType}</Text>
            </View>
            
            {orderData.orderType === 'Home Delivery' ? (
              <>
                {fullAddressString && fullAddressString !== 'Store Pickup' ? (
                  <View style={styles.deliveryRow}>
                    <MaterialIcons name="location-on" size={20} color={theme.colors.secondary} />
                    <Text style={[styles.deliveryAddress, { color: theme.colors.text }]}>
                      {fullAddressString}
                    </Text>
                  </View>
                ) : (formattedStoreAddress || orderData.address) && (
                  <View style={styles.deliveryRow}>
                    <MaterialIcons name="location-on" size={20} color={theme.colors.secondary} />
                    <Text style={[styles.deliveryAddress, { color: theme.colors.text }]}>
                      {formattedStoreAddress || orderData.address}
                    </Text>
                  </View>
                )}
              </>
            ) : (
              (formattedStoreAddress || orderData.address) && (
                <View style={styles.deliveryRow}>
                  <MaterialIcons name="location-on" size={20} color={theme.colors.secondary} />
                  <Text style={[styles.deliveryAddress, { color: theme.colors.text }]}>
                    {formattedStoreAddress || orderData.address}
                  </Text>
                </View>
              )
            )}
          </View>

          {/* Prescription Section - Render only when the order is placed from a pharmacy store */}
          {isPharmaOrder && (
          <View style={[styles.prescriptionCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Prescription
            </Text>
            
            {(() => {
              console.log('🖼️ OrderDetail - Displaying prescription:', {
                'finalPrescriptionUrl': finalPrescriptionUrl,
                'hasPrescription': !!finalPrescriptionUrl,
                'orderId': order?.orderId || order?.id
              });
              
              return finalPrescriptionUrl ? (
                <>
                  {(() => {
                    // Check if the file is a PDF
                    const isPdf = finalPrescriptionUrl.toLowerCase().includes('.pdf') || 
                                 finalPrescriptionUrl.toLowerCase().includes('application/pdf');
                    
                    if (isPdf) {
                      // For PDFs, show a PDF icon button instead of trying to render as image
                      return (
                        <TouchableOpacity
                          style={styles.prescriptionContainer}
                          onPress={async () => {
                            try {
                              console.log('📄 Opening PDF prescription:', finalPrescriptionUrl);
                              const canOpen = await Linking.canOpenURL(finalPrescriptionUrl);
                              if (canOpen) {
                                await Linking.openURL(finalPrescriptionUrl);
                              } else {
                                Alert.alert('Error', 'Cannot open PDF. Please check the file URL.');
                              }
                            } catch (error) {
                              console.error('📄 Error opening PDF:', error);
                              Alert.alert('Error', 'Failed to open PDF. Please try again.');
                            }
                          }}
                        >
                          <View style={[styles.prescriptionImage, styles.pdfContainer, { backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' }]}>
                            <MaterialIcons name="picture-as-pdf" size={64} color="#dc3545" />
                            <Text style={[styles.prescriptionOverlayText, { color: theme.colors.text, marginTop: 8 }]}>
                              PDF Document
                            </Text>
                          </View>
                          <View style={styles.prescriptionOverlay}>
                            <MaterialIcons name="open-in-new" size={24} color="#fff" />
                            <Text style={styles.prescriptionOverlayText}>Tap to open PDF</Text>
                          </View>
                        </TouchableOpacity>
                      );
                    } else {
                      // For images, show the image preview
                      return (
                        <TouchableOpacity
                          style={styles.prescriptionContainer}
                          onPress={() => {
                            console.log('🖼️ Opening prescription image:', finalPrescriptionUrl);
                            navigation.navigate('ImageViewer', { 
                              imageUrl: finalPrescriptionUrl, 
                              title: 'Prescription' 
                            });
                          }}
                        >
                          <Image
                            source={{ uri: finalPrescriptionUrl }}
                            style={styles.prescriptionImage}
                            resizeMode="cover"
                            onError={(error) => {
                              console.error('🖼️ Prescription image load error:', error.nativeEvent.error);
                            }}
                            onLoad={() => {
                              console.log('🖼️ Prescription image loaded successfully for:', finalPrescriptionUrl);
                            }}
                          />
                          <View style={styles.prescriptionOverlay}>
                            <MaterialIcons name="zoom-in" size={24} color="#fff" />
                            <Text style={styles.prescriptionOverlayText}>Tap to view full size</Text>
                          </View>
                        </TouchableOpacity>
                      );
                    }
                  })()}
                  
                  <Text style={[styles.prescriptionText, { color: '#4CAF50' }]}>
                    ✓ Prescription uploaded successfully
                  </Text>
                </>
              ) : (
                <TouchableOpacity
                  style={[styles.uploadPrescriptionButton, { backgroundColor: theme.colors.primary }]}
                  onPress={() => {
                    const orderIdToUse = passedOrderId || order?.orderId || order?.id;
                    const storeIdToUse = order?.storeId || (order as any)?.originalOrderData?.storeId;
                    console.log('📤 Navigating to upload prescription for order:', orderIdToUse);
                    navigation.navigate('UploadPrescription', { orderId: orderIdToUse, storeId: storeIdToUse } as any);
                  }}
                >
                  <MaterialIcons name="upload" size={20} color="#fff" />
                  <Text style={styles.uploadPrescriptionButtonText}>Upload Prescription</Text>
                </TouchableOpacity>
              );
            })()}
          </View>
          )}

          {/* Payment Status - API driven (paid/pending/cancelled/failed) */}
          <View style={[styles.totalCard, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: theme.colors.text }]}>Payment Status:</Text>
              <Text style={[styles.totalAmount, { color: orderData.paymentStatus === 'paid' ? '#4CAF50' : orderData.paymentStatus === 'pending' ? '#FF9800' : orderData.paymentStatus === 'failed' ? '#F44336' : theme.colors.secondary }]}>
                {orderData.paymentStatus ? orderData.paymentStatus.toUpperCase() : 'UNKNOWN'}
              </Text>
            </View>
          </View>

          {/* Total */}
          <View style={[styles.totalCard, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: theme.colors.text }]}>
                Total Amount:
              </Text>
              <Text style={[styles.totalAmount, { color: theme.colors.primary }]}>
                ₹{(orderData.grandTotal || 0).toFixed(2)}
              </Text>
            </View>
          </View>

          {/* Help Section */}
          <View style={[styles.helpSection, { marginBottom: 48 }]}>
            <Text style={styles.helpTitle}>Need Help With Your Order?</Text>
            <View style={styles.helpButtonsContainer}>
              <TouchableOpacity
                onPress={handleCallStore}
                style={styles.helpButton}
              >
                <MaterialCommunityIcons name="phone" size={20} color="#fff" />
                <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600', marginLeft: 8 }}>Call Store</Text>
              </TouchableOpacity>
              <Animated.View
                style={{
                  flex: 1,
                  marginHorizontal: 4,
                  transform: [
                    {
                      scale: reorderPulse.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.06],
                      }),
                    },
                  ],
                }}
              >
                <TouchableOpacity
                  onPress={handleReorder}
                  style={[
                    styles.helpButton,
                    isReorderHighlighted
                      ? {
                          borderWidth: 2,
                          borderColor: '#FFD700',
                          shadowColor: '#FFD700',
                          shadowOpacity: 0.35,
                          shadowRadius: 10,
                          shadowOffset: { width: 0, height: 0 },
                          elevation: 10,
                        }
                      : null,
                  ]}
                >
                  <MaterialCommunityIcons name="refresh" size={20} color="#fff" />
                  <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600', marginLeft: 8 }}>Reorder</Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default OrderDetailScreen; 