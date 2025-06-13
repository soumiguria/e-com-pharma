// import React from 'react';
// import { View, Text, FlatList, StyleSheet } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useNavigation } from '@react-navigation/native';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import { useStorage } from '../contexts/StorageContext';
// import ThemedButton from '../components/ThemedButton';
// import { RootStackParamList } from '../navigation/types';
// import { useTheme } from '../contexts/ThemeContext';

// type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'StoreSelection'>;

// const stores = [
//   { id: '1', name: 'Grocery Store 1' },
//   { id: '2', name: 'Grocery Store 2' },
//   { id: '3', name: 'Pharmacy Store 1' },
//   { id: '4', name: 'Pharmacy Store 2' },
// ];

// const StoreSelectionScreen = () => {
//   const navigation = useNavigation<NavigationProp>();
//   const { setSelectedStore } = useStorage();
//   const { theme } = useTheme();

//   const handleStoreSelect = (store: { id: string; name: string }) => {
//     setSelectedStore(store);
//     navigation.navigate('Home', { pincode: '' }); // You'll need to provide the pincode parameter;
//   };

//   const styles = StyleSheet.create({
//     container: {
//       flex: 1,
//       justifyContent: 'center',
//       alignItems: 'center',
//       backgroundColor: theme.colors.background,
//       padding: theme.spacing.md,
//     },
//     title: {
//       fontSize: 24,
//       fontWeight: 'bold',
//       color: theme.colors.text,
//       marginBottom: theme.spacing.lg,
//     },
//   });

//   return (
//     <SafeAreaView style={styles.container}>
//       <Text style={styles.title}>Select a Store</Text>
//       <FlatList
//         data={stores}
//         keyExtractor={(item) => item.id}
//         renderItem={({ item }) => (
//           <ThemedButton title={item.name} onPress={() => handleStoreSelect(item)} />
//         )}
//       />
//     </SafeAreaView>
//   );
// };

// export default StoreSelectionScreen; 


// StoreSelectionScreen.tsx
import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useStorage } from '../contexts/StorageContext';
import StoreCard from '../components/StoreCard'; // New component
import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../contexts/ThemeContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'StoreSelection'>;

const stores = [
  { 
    id: '1', 
    name: 'Fresh Grocery Mart', 
    type: 'grocery',
    distance: '0.5 km',
    rating: 4.5,
    image: require('../assets/grocery-store.jpg')
  },
  { 
    id: '2', 
    name: 'Quick Pharmacy', 
    type: 'pharmacy',
    distance: '1.2 km',
    rating: 4.2,
    image: require('../assets/pharmacy-store.jpg')
  },
  // Add more stores...
];

const StoreSelectionScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { setSelectedStore } = useStorage();
  const { theme } = useTheme();

  const handleStoreSelect = (store: any) => {
    setSelectedStore(store);
    if (store.type === 'grocery') {
      navigation.navigate('GroceryHome', { storeId: store.id });
    } else {
      navigation.navigate('PharmacyHome', { storeId: store.id });
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
      margin: theme.spacing.md,
    },
    listContainer: {
      paddingHorizontal: theme.spacing.md,
    }
  });

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Select a Store</Text>
      <FlatList
        data={stores}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <StoreCard 
            store={item} 
            onPress={() => handleStoreSelect(item)}
          />
        )}
      />
    </SafeAreaView>
  );
};

export default StoreSelectionScreen;