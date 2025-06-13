import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ThemedButton from '../components/ThemedButton';
import { useTheme } from '../contexts/ThemeContext';

const addresses = [
  { id: '1', address: '123 Main St' },
  { id: '2', address: '456 Oak St' },
];

const MyAddressesScreen = () => {
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
    addressItem: {
      padding: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.surface,
    },
    addressText: {
      fontSize: 16,
      color: theme.colors.text,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>My Addresses</Text>
      <FlatList
        data={addresses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.addressItem}>
            <Text style={styles.addressText}>{item.address}</Text>
          </View>
        )}
      />
      <ThemedButton title="Add New Address" onPress={() => {}} />
    </SafeAreaView>
  );
};

export default MyAddressesScreen; 