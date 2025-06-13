import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ProductCard from '../components/ProductCard';
import { PharmacyStackParamList } from '../navigation/types';
import { useTheme } from '../contexts/ThemeContext';

type NavigationProp = NativeStackNavigationProp<PharmacyStackParamList, 'PharmacyHome'>;

const medicines = [
  { id: '1', name: 'Medicine 1', price: 15 },
  { id: '2', name: 'Medicine 2', price: 25 },
  { id: '3', name: 'Medicine 3', price: 35 },
];

const PharmacyHomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();

  const handleMedicinePress = (medicine: { id: string; name: string; price: number }) => {
    navigation.navigate('MedicineDetail', { medicine });
  };

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
      marginBottom: theme.spacing.md,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Pharmacy Products</Text>
      <FlatList
        data={medicines}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProductCard product={item} onPress={() => handleMedicinePress(item)} />
        )}
      />
    </SafeAreaView>
  );
};

export default PharmacyHomeScreen; 