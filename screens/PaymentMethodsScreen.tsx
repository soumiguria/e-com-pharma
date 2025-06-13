import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ThemedButton from '../components/ThemedButton';
import { useTheme } from '../contexts/ThemeContext';

const paymentMethods = [
  { id: '1', method: 'Credit Card' },
  { id: '2', method: 'Debit Card' },
];

const PaymentMethodsScreen = () => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      padding: theme.spacing.md,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: theme.spacing.lg,
    },
    paymentItem: {
      padding: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.surface,
    },
    paymentText: {
      fontSize: 16,
      color: theme.colors.text,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Payment Methods</Text>
      <FlatList
        data={paymentMethods}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.paymentItem}>
            <Text style={styles.paymentText}>{item.method}</Text>
          </View>
        )}
      />
      <ThemedButton title="Add New Payment Method" onPress={() => {}} />
    </SafeAreaView>
  );
};

export default PaymentMethodsScreen; 