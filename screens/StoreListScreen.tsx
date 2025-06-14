import React from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Text, Button, Chip } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '../contexts/ThemeContext';
import { RootStackParamList } from '../navigation/types';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type NavigationProp = StackNavigationProp<RootStackParamList, 'StoreList'>;
type StoreListRouteProp = RouteProp<RootStackParamList, 'StoreList'>;

interface Store {
  id: string;
  name: string;
  type: 'grocery' | 'pharmacy';
  address: string;
  distance: string;
  rating: number;
  image?: string;
}

const mockedStores: Store[] = [
  {
    id: '1',
    name: 'Fresh Grocery Store',
    type: 'grocery',
    address: '123 Main Street, City Center',
    distance: '0.5 km',
    rating: 4.5,
  },
  {
    id: '2',
    name: 'Quick Pharmacy',
    type: 'pharmacy',
    address: '456 Park Avenue, Downtown',
    distance: '1.2 km',
    rating: 4.2,
  },
  {
    id: '3',
    name: 'Neighborhood Market',
    type: 'grocery',
    address: '789 Oak Road, Westside',
    distance: '2.0 km',
    rating: 4.0,
  },
];

const StoreListScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<StoreListRouteProp>();
  const { theme } = useTheme();
  const { colors, typography, spacing, borderRadius, shadows } = theme;
  const { pincode } = route.params;

  const handleStoreSelect = (store: Store) => {
    navigation.navigate('Home', { 
      storeId: store.id,
      storeType: store.type,
      pincode: pincode 
    });
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    gradient: {
      flex: 1,
    },
    content: {
      padding: spacing.lg,
    },
    header: {
      marginBottom: spacing.xl,
    },
    title: {
      ...typography.h1,
      color: colors.text,
      marginBottom: spacing.xs,
    },
    subtitle: {
      ...typography.body1,
      color: colors.text,
      opacity: 0.7,
    },
    card: {
      marginBottom: spacing.md,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      ...Platform.select({
        ios: {
          shadowColor: colors.text,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        android: {
          elevation: 4,
        },
      }),
    },
    cardContent: {
      padding: spacing.lg,
    },
    storeHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    storeName: {
      ...typography.h2,
      color: colors.text,
      flex: 1,
    },
    storeType: {
      marginLeft: spacing.sm,
    },
    storeAddress: {
      ...typography.body1,
      color: colors.text,
      opacity: 0.7,
      marginBottom: spacing.sm,
    },
    storeInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    storeDistance: {
      ...typography.body2,
      color: colors.primary,
      marginRight: spacing.md,
    },
    storeRating: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    button: {
      marginTop: spacing.sm,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <ScrollView style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Stores Near You</Text>
            <Text style={styles.subtitle}>Pincode: {pincode}</Text>
          </View>
          
          {mockedStores.map((store) => (
            <Card key={store.id} style={styles.card}>
              <Card.Content style={styles.cardContent}>
                <View style={styles.storeHeader}>
                  <Text style={styles.storeName}>{store.name}</Text>
                  <Chip
                    style={styles.storeType}
                    mode="outlined"
                    textStyle={{
                      color: store.type === 'grocery' ? colors.grocery.primary : colors.pharmacy.primary,
                    }}
                  >
                    {store.type === 'grocery' ? 'Grocery' : 'Pharmacy'}
                  </Chip>
                </View>
                
                <Text style={styles.storeAddress}>{store.address}</Text>
                
                <View style={styles.storeInfo}>
                  <Text style={styles.storeDistance}>{store.distance}</Text>
                  <View style={styles.storeRating}>
                    <MaterialCommunityIcons
                      name="star"
                      size={16}
                      color={colors.accent}
                    />
                    <Text style={{ marginLeft: 4 }}>{store.rating}</Text>
                  </View>
                </View>

                <Button
                  mode="contained"
                  onPress={() => handleStoreSelect(store)}
                  style={styles.button}
                  theme={{
                    roundness: borderRadius.md,
                    colors: {
                      primary: store.type === 'grocery' ? colors.grocery.primary : colors.pharmacy.primary,
                    },
                  }}
                >
                  Select Store
                </Button>
              </Card.Content>
            </Card>
          ))}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default StoreListScreen; 