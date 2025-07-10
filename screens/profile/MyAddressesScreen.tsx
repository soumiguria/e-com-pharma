import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/types';
import { StackNavigationProp } from '@react-navigation/stack';
import { MaterialIcons } from '@expo/vector-icons';

type MyAddressesScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MyAddresses'>;

interface Address {
  id: string;
  type: 'home' | 'work' | 'friends' | 'other';
  name: string;
  houseNumber: string;
  apartment: string;
  directions: string;
  voiceDirections?: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
}

const MyAddressesScreen = React.memo(() => {
  const { theme } = useTheme();
  const navigation = useNavigation<MyAddressesScreenNavigationProp>();
  
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: '1',
      type: 'home',
      name: 'Home',
      houseNumber: '123',
      apartment: 'Apartment 4B, Green Park Colony',
      directions: 'Near the red gate, ring the bell',
      location: {
        latitude: 28.6139,
        longitude: 77.2090,
        address: 'Green Park Colony, New Delhi, Delhi 110016'
      }
    },
    {
      id: '2',
      type: 'work',
      name: 'Work',
      houseNumber: '456',
      apartment: 'Office Building, Connaught Place',
      directions: '3rd floor, elevator on the right',
      location: {
        latitude: 28.6289,
        longitude: 77.2065,
        address: 'Connaught Place, New Delhi, Delhi 110001'
      }
    }
  ]);

  const [defaultAddressId, setDefaultAddressId] = useState(addresses[0]?.id);

  const getTypeIcon = useCallback((type: string) => {
    switch (type) {
      case 'home':
        return 'home';
      case 'work':
        return 'work';
      case 'friends':
        return 'people';
      case 'other':
        return 'location-on';
      default:
        return 'location-on';
    }
  }, []);

  const getTypeColor = useCallback((type: string) => {
    switch (type) {
      case 'home':
        return '#4CAF50';
      case 'work':
        return '#2196F3';
      case 'friends':
        return '#FF9800';
      case 'other':
        return '#9C27B0';
      default:
        return theme.colors.primary;
    }
  }, [theme.colors.primary]);

  const handleAddAddress = useCallback(() => {
    navigation.navigate('LocationPicker');
  }, [navigation]);

  const handleDeleteAddress = useCallback((id: string) => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setAddresses(prev => prev.filter(addr => addr.id !== id));
          }
        }
      ]
    );
  }, []);

  const renderAddressItem = useCallback(({ item }: { item: Address }) => (
    <View style={styles.addressItem}>
      <View style={styles.addressHeader}>
        <View style={[styles.typeIcon, { backgroundColor: getTypeColor(item.type) }]}>
          <MaterialIcons 
            name={getTypeIcon(item.type) as any} 
            size={20} 
            color={theme.colors.surface} 
          />
        </View>
        <View style={styles.addressInfo}>
          <Text style={styles.addressName}>{item.name}</Text>
          <Text style={styles.addressText}>{item.location.address}</Text>
        </View>
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteAddress(item.id)}>
            <MaterialIcons name="delete" size={24} color={theme.colors.error} />
          </TouchableOpacity>
          <TouchableOpacity style={{ marginTop: 6 }} onPress={() => navigation.navigate('AddAddress', { location: item.location })}>
            <MaterialIcons name="edit" size={22} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.addressText}>
        {item.houseNumber}, {item.apartment}
      </Text>
      {item.directions && (
        <Text style={styles.addressText}>
          Directions: {item.directions}
        </Text>
      )}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
        <TouchableOpacity onPress={() => setDefaultAddressId(item.id)} style={{ marginRight: 12 }}>
          <MaterialIcons name={defaultAddressId === item.id ? 'radio-button-checked' : 'radio-button-unchecked'} size={22} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={{ color: theme.colors.primary, fontWeight: 'bold', marginRight: 16 }}>{defaultAddressId === item.id ? 'Default' : 'Set as default'}</Text>
      </View>
    </View>
  ), [getTypeColor, getTypeIcon, theme.colors.surface, theme.colors.error, handleDeleteAddress, defaultAddressId, navigation]);

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
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    backButton: {
      padding: 8,
      borderRadius: 20,
      backgroundColor: theme.colors.background,
      marginRight: 16,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    content: {
      flex: 1,
      padding: 16,
    },
    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primary,
      paddingVertical: 16,
      borderRadius: 12,
      marginBottom: 24,
    },
    addButtonText: {
      color: theme.colors.surface,
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 8,
    },
    addressItem: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    addressHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    typeIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    addressInfo: {
      flex: 1,
    },
    addressName: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 4,
    },
    addressText: {
      fontSize: 14,
      color: theme.colors.secondary,
      lineHeight: 20,
    },
    deleteButton: {
      padding: 8,
    },
    emptyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 32,
    },
    emptyStateText: {
      fontSize: 16,
      color: theme.colors.secondary,
      textAlign: 'center',
      marginTop: 16,
    },
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <MaterialIcons name="arrow-back" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Addresses</Text>
        </View>

        <View style={styles.content}>
          <TouchableOpacity style={styles.addButton} onPress={handleAddAddress}>
            <MaterialIcons name="add-location" size={22} color={theme.colors.surface} />
            <Text style={styles.addButtonText}>Add New Address</Text>
          </TouchableOpacity>

          {addresses.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="location-off" size={64} color={theme.colors.secondary} />
              <Text style={styles.emptyStateText}>
                No addresses saved yet. Add your first address to get started.
              </Text>
            </View>
          ) : (
            <FlatList
              data={addresses}
              keyExtractor={(item) => item.id}
              renderItem={renderAddressItem}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
});

export default MyAddressesScreen; 