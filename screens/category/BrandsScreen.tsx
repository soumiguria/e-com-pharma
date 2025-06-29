import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, SafeAreaView, Alert } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

const brands = [
  { id: '1', name: 'Amul', image: 'https://seeklogo.com/images/A/amul-logo-7E6B2B7B2B-seeklogo.com.png' },
  { id: '2', name: 'Mother Dairy', image: 'https://seeklogo.com/images/M/mother-dairy-logo-6B7B2B7B2B-seeklogo.com.png' },
  { id: '3', name: 'Britannia', image: 'https://seeklogo.com/images/B/britannia-logo-7E6B2B7B2B-seeklogo.com.png' },
  { id: '4', name: 'Nestle', image: 'https://seeklogo.com/images/N/nestle-logo-7E6B2B7B2B-seeklogo.com.png' },
  { id: '5', name: 'Cadbury', image: 'https://seeklogo.com/images/C/cadbury-logo-7E6B2B7B2B-seeklogo.com.png' },
  { id: '6', name: 'Haldiram', image: 'https://seeklogo.com/images/H/haldiram-logo-7E6B2B7B2B-seeklogo.com.png' },
  { id: '7', name: 'Parle', image: 'https://seeklogo.com/images/P/parle-logo-7E6B2B7B2B-seeklogo.com.png' },
  { id: '8', name: 'Pepsi', image: 'https://seeklogo.com/images/P/pepsi-logo-7E6B2B7B2B-seeklogo.com.png' },
  { id: '9', name: 'Coca-Cola', image: 'https://seeklogo.com/images/C/coca-cola-logo-7E6B2B7B2B-seeklogo.com.png' },
  { id: '10', name: 'Tropicana', image: 'https://seeklogo.com/images/T/tropicana-logo-7E6B2B7B2B-seeklogo.com.png' },
];

const BrandsScreen = () => {
  const { theme } = useTheme();
  const renderItem = ({ item }: { item: typeof brands[0] }) => (
    <TouchableOpacity
      style={[styles.card, {backgroundColor: theme.colors.surface, borderColor: theme.colors.border}]}
      onPress={() => Alert.alert('Brand', item.name)}
      activeOpacity={0.8}
    >
      <Image source={{ uri: item.image }} style={styles.image} />
      <Text style={[styles.name, { color: theme.colors.text }]} numberOfLines={2}>{item.name}</Text>
    </TouchableOpacity>
  );
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: theme.colors.text }]}>All Brands</Text>
      </View>
      <FlatList
        data={brands}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        numColumns={3}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.gridContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  headerRow: { padding: 18, paddingBottom: 8, backgroundColor: 'transparent' },
  title: { fontSize: 22, fontWeight: 'bold', letterSpacing: 0.2 },
  row: { flex: 1, justifyContent: 'space-around', marginBottom: 18 },
  gridContent: { paddingHorizontal: 12, paddingBottom: 24 },
  card: { width: '30%', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 8, marginHorizontal: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 1 },
  image: { width: 60, height: 60, borderRadius: 30, marginBottom: 10, backgroundColor: '#f0f0f0' },
  name: { textAlign: 'center', fontSize: 13, fontWeight: '600', marginTop: 2 },
});
export default BrandsScreen; 