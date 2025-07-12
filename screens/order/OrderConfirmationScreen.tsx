import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';

type OrderConfirmationNavigationProp = NativeStackNavigationProp<RootStackParamList, 'OrderConfirmation'>;

const OrderConfirmationScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<OrderConfirmationNavigationProp>();
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

  // Generate random order ID
  const orderId = `ORD${Date.now().toString().slice(-8)}`;

  // Mock order details
  const orderDetails = {
    orderId,
    totalAmount: 460,
    items: [
      { name: 'Organic Apples', quantity: 2, price: 120 },
      { name: 'Fresh Milk', quantity: 1, price: 65 },
      { name: 'Whole Grain Bread', quantity: 1, price: 45 },
    ],
    deliveryAddress: '123 Main Street, Apartment 4B, New Delhi, Delhi 110001',
    deliveryMethod: 'Home Delivery',
    estimatedDelivery: '2-3 days',
  };

  useEffect(() => {
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
  }, []);

  const handleContinueShopping = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main' as any }],
    });
  };

  const handleViewOrderDetails = () => {
    navigation.navigate('OrderDetail', { order: { id: orderId, ...orderDetails } });
  };

  const handleClose = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main' as any }],
    });
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
    },
    closeButton: {
      padding: 8,
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
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 20,
    },
    actionButton: {
      flex: 1,
      paddingVertical: 15,
      borderRadius: 8,
      alignItems: 'center',
      marginHorizontal: 8,
    },
    primaryButton: {
      backgroundColor: theme.colors.primary,
    },
    secondaryButton: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.primary,
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
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Close Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <MaterialIcons name="close" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Thanks Section */}
        <View style={styles.thanksSection}>
          <Text style={styles.thanksText}>Thanks for shopping with Pass ki Dukaan!</Text>
          
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
          <Text style={styles.orderIdLabel}>Order ID</Text>
          <Text style={styles.orderId}>{orderDetails.orderId}</Text>
        </View>

        <View style={styles.divider} />

        {/* Bill Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bill Details</Text>
          {orderDetails.items.map((item, index) => (
            <View key={index} style={styles.billRow}>
              <Text style={styles.billLabel}>
                {item.name} x{item.quantity}
              </Text>
              <Text style={styles.billValue}>₹{item.price}</Text>
            </View>
          ))}
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Delivery Charges</Text>
            <Text style={styles.billValue}>₹30</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>₹{orderDetails.totalAmount}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Delivery Address Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <View style={styles.addressSection}>
            <Text style={styles.addressText}>{orderDetails.deliveryAddress}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Delivery Method</Text>
            <Text style={styles.billValue}>{orderDetails.deliveryMethod}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Estimated Delivery</Text>
            <Text style={styles.billValue}>{orderDetails.estimatedDelivery}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={handleContinueShopping}
          >
            <Text style={styles.secondaryButtonText}>Continue Shopping</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton]}
            onPress={handleViewOrderDetails}
          >
            <Text style={styles.primaryButtonText}>View Order Details</Text>
          </TouchableOpacity>
        </View>
        
        {/* Bottom spacing */}
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default OrderConfirmationScreen; 