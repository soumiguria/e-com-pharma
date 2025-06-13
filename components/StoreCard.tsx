// components/StoreCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const StoreCard = ({ store, onPress, style}: { store: any, onPress: () => void, style?: any}) => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      marginBottom: theme.spacing.md,
      overflow: 'hidden',
      ...theme.shadows.medium,
    },
    image: {
      width: '100%',
      height: 150,
    },
    content: {
      padding: theme.spacing.md,
    },
    name: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    details: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    detailText: {
      color: theme.colors.secondary,
      fontSize: 14,
    },
    rating: {
      flexDirection: 'row',
      alignItems: 'center',
    },
  });

  return (
    <TouchableOpacity style={[styles.card, style]} onPress={onPress}>
      <Image source={store.image} style={styles.image} resizeMode="cover" />
      <View style={styles.content}>
        <Text style={styles.name}>{store.name}</Text>
        <View style={styles.details}>
          <Text style={styles.detailText}>{store.distance}</Text>
          <View style={styles.rating}>
            <MaterialCommunityIcons 
              name="star" 
              size={16} 
              color={theme.colors.primary} 
            />
            <Text style={[styles.detailText, { marginLeft: 4 }]}>
              {store.rating}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default StoreCard;