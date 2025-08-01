import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ThemedButton from '../../components/ui/ThemedButton';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useCart } from '../../contexts/CartContext';
import LoadingOverlay from '../../components/ui/LoadingOverlay';

const deliveryMethods = [
  { id: '1', label: 'Store Pickup' },
  { id: '2', label: 'Home Delivery' },
];
const deliverySpeeds = [
  { id: '1', label: 'Standard', desc: '2-3 days', price: 0 },
  { id: '2', label: 'Express', desc: 'Within 2 hours', price: 49 },
];
const timeSlots = [
  '8:00 AM - 10:00 AM',
  '10:00 AM - 12:00 PM',
  '12:00 PM - 2:00 PM',
  '2:00 PM - 4:00 PM',
];
const billDetails = {
  mrp: 500,
  productDiscount: 50,
  shipping: 30,
  couponDiscount: 20,
  total: 460,
};
const mostUsedPayment = 'UPI';
const userAddresses = [
  { id: '1', address: '123 Main St, City, State' },
  { id: '2', address: '456 Oak St, City, State' },
];

const PaymentMethodsScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { clearCart } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDeliveryMethod, setSelectedDeliveryMethod] = React.useState('1');
  const [selectedAddress, setSelectedAddress] = React.useState(userAddresses[0].id);
  const [selectedSpeed, setSelectedSpeed] = React.useState('1');
  const [selectedTimeSlot, setSelectedTimeSlot] = React.useState(timeSlots[0]);
  const [addresses, setAddresses] = React.useState(userAddresses);

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
    changeAddressBtn: {
      backgroundColor: theme.colors.primary,
      borderRadius: 16,
      paddingHorizontal: 12,
      paddingVertical: 6,
      alignSelf: 'flex-start',
      marginBottom: 8,
    },
    changeAddressText: {
      color: theme.colors.surface,
      fontWeight: 'bold',
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.text + '33',
    },
    modalContent: {
      backgroundColor: theme.colors.surface,
      padding: 20,
      borderRadius: 12,
      width: '80%',
    },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 8,
      padding: 10,
      marginBottom: 12,
      color: theme.colors.text,
      backgroundColor: theme.colors.background,
    },
    modalButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 8,
      padding: 10,
      alignItems: 'center',
    },
    modalButtonText: {
      color: theme.colors.surface,
      fontWeight: 'bold',
    },
  });

  // Assume defaultAddress is passed as a prop or imported from a shared context/state
  const defaultAddress = addresses.find(addr => addr.id === selectedAddress);

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

        {/* Delivery Address - only for Home Delivery */}
        {selectedDeliveryMethod === '2' && defaultAddress && (
          <>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
            <View style={styles.row}>
              <View style={[styles.chip, styles.chipSelected]}>
                <Text style={[styles.chipText, styles.chipTextSelected]}>{defaultAddress.address}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.changeAddressBtn} onPress={() => navigation.navigate('MyAddresses')}>
              <Text style={styles.changeAddressText}>Change Address</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Delivery Speed */}
        <Text style={styles.sectionTitle}>Delivery Speed</Text>
        <View style={styles.row}>
          {deliverySpeeds.map(speed => (
            <TouchableOpacity
              key={speed.id}
              style={[styles.chip, selectedSpeed === speed.id && styles.chipSelected]}
              onPress={() => setSelectedSpeed(speed.id)}
            >
              <Text style={[styles.chipText, selectedSpeed === speed.id && styles.chipTextSelected]}>{speed.label} ({speed.desc}) {speed.price > 0 ? `+₹${speed.price}` : 'Free'}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Time Slot */}
        <Text style={styles.sectionTitle}>Select Time Slot</Text>
        <View style={styles.row}>
          {timeSlots.map(slot => (
            <TouchableOpacity
              key={slot}
              style={[styles.chip, selectedTimeSlot === slot && styles.chipSelected]}
              onPress={() => setSelectedTimeSlot(slot)}
            >
              <Text style={[styles.chipText, selectedTimeSlot === slot && styles.chipTextSelected]}>{slot}</Text>
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

        {/* Most Used Payment Method */}
        <Text style={styles.sectionTitle}>Most Used Payment Method</Text>
        <View style={styles.row}>
          <TouchableOpacity style={[styles.chip, styles.chipSelected]}>
            <Text style={[styles.chipText, styles.chipTextSelected]}>{mostUsedPayment}</Text>
          </TouchableOpacity>
        </View>

        {/* Place Order Button */}
        <ThemedButton title="Place Order" onPress={() => {
          setIsLoading(true);
          // Simulate a small delay for better UX
          setTimeout(() => {
            navigation.navigate('PhoneAuth', { cartType: 'grocery' });
            setIsLoading(false);
          }, 500);
        }} style={{ marginTop: 24 }} />
              </ScrollView>
      </SafeAreaView>

      <LoadingOverlay 
        visible={isLoading} 
        message="Processing order..." 
      />
    </>
  );
};

export default PaymentMethodsScreen; 