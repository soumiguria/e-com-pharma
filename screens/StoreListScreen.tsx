import React from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Text, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '../contexts/ThemeContext';
import { RootStackParamList } from '../navigation/types';
import { LinearGradient } from 'expo-linear-gradient';

type NavigationProp = StackNavigationProp<RootStackParamList, 'StoreList'>;

interface Store {
  id: string;
  name: string;
  address: string;
  distance: string;
}

const mockedStores: Store[] = [
  {
    id: '1',
    name: 'Fresh Grocery Store',
    address: '123 Main Street, City Center',
    distance: '0.5 km',
  },
  {
    id: '2',
    name: 'Quick Mart',
    address: '456 Park Avenue, Downtown',
    distance: '1.2 km',
  },
  {
    id: '3',
    name: 'Neighborhood Market',
    address: '789 Oak Road, Westside',
    distance: '2.0 km',
  },
];

const StoreListScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const { colors, typography, spacing, borderRadius, shadows } = theme;

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
    title: {
      ...typography.h1,
      color: colors.text,
      marginBottom: spacing.xl,
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
    storeName: {
      ...typography.h2,
      color: colors.text,
      marginBottom: spacing.xs,
    },
    storeAddress: {
      ...typography.body1,
      color: colors.text,
      opacity: 0.7,
      marginBottom: spacing.sm,
    },
    storeDistance: {
      ...typography.body2,
      color: colors.primary,
      marginBottom: spacing.md,
    },
    button: {
      marginTop: spacing.sm,
    },
  });

  const handleStoreSelect = (store: Store) => {
  navigation.navigate('GroceryHome', { storeId: store.id });
};

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <ScrollView style={styles.content}>
          <Text style={styles.title}>Select a Store</Text>
          {mockedStores.map((store) => (
            <Card key={store.id} style={styles.card}>
              <Card.Content style={styles.cardContent}>
                <Text style={styles.storeName}>{store.name}</Text>
                <Text style={styles.storeAddress}>{store.address}</Text>
                <Text style={styles.storeDistance}>{store.distance}</Text>
                <Button
                  mode="contained"
                  onPress={() => handleStoreSelect(store)}
                  style={styles.button}
                  theme={{ roundness: borderRadius.md }}
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