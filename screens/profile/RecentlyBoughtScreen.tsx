import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, SafeAreaView, Alert } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const products = [
  { id: '1', name: 'Amul Milk 1L', image: 'https://blinkit.com/images/products/400/amul-taaza-homogenised-toned-milk.jpg', price: 65 },
  { id: '2', name: 'Britannia Cheese Slices', image: 'https://blinkit.com/images/products/400/britannia-cheese-slices.jpg', price: 120 },
  { id: '3', name: 'Mother Dairy Curd', image: 'https://blinkit.com/images/products/400/mother-dairy-dahi.jpg', price: 30 },
  { id: '4', name: 'Tropicana Juice', image: 'https://blinkit.com/images/products/400/tropicana-orange-delight.jpg', price: 90 },
  { id: '5', name: 'Cadbury Dairy Milk', image: 'https://blinkit.com/images/products/400/cadbury-dairy-milk-chocolate.jpg', price: 45 },
  { id: '6', name: 'Parle-G Biscuits', image: 'https://blinkit.com/images/products/400/parle-g-original-glucose-biscuits.jpg', price: 10 },
];

const RecentlyBoughtScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const renderItem = ({ item }: { item: typeof products[0] }) => (
    <TouchableOpacity
      style={[styles.card, {backgroundColor: theme.colors.surface, borderColor: theme.colors.border}]}
      onPress={() => Alert.alert('Product', item.name)}
      activeOpacity={0.8}
    >
      <Image source={{ uri: item.image }} style={styles.image} />
      <Text style={[styles.name, { color: theme.colors.text }]} numberOfLines={2}>{item.name}</Text>
      <Text style={[styles.price, { color: theme.colors.primary }]}>₹{item.price}</Text>
    </TouchableOpacity>
  );
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={[styles.appBar, { backgroundColor: theme.colors.surface }]}> 
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={26} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.heading, { color: theme.colors.text }]}>Recently Bought</Text>
      </View>
      <FlatList
        data={products}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.gridContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    zIndex: 10,
  },
  backButton: {
    marginRight: 10,
    padding: 4,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 0.2,
  },
  row: { flex: 1, justifyContent: 'space-around', marginBottom: 18 },
  gridContent: { paddingHorizontal: 12, paddingBottom: 24 },
  card: { width: '46%', alignItems: 'center', padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 12, marginHorizontal: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 1 },
  image: { width: 80, height: 80, borderRadius: 12, marginBottom: 10, backgroundColor: '#f0f0f0' },
  name: { textAlign: 'center', fontSize: 14, fontWeight: '600', marginTop: 2 },
  price: { fontSize: 15, fontWeight: 'bold', marginTop: 4 },
});
export default RecentlyBoughtScreen; 