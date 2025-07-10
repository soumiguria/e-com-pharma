// components/StoreCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const StoreCard = ({ store, onPress, style}: { store: any, onPress: () => void, style?: any}) => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    card: {
      backgroundColor: theme.dark ? '#4B3F1D' : '#FFF9E5',
      borderRadius: theme.borderRadius.md,
      marginBottom: theme.spacing.md,
      overflow: 'hidden',
      shadowColor: theme.dark ? '#000' : '#FFD700',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
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
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      marginRight: theme.spacing.md,
      backgroundColor: '#fff',
      borderWidth: 1,
      borderColor: theme.colors.border,
      overflow: 'hidden',
      alignItems: 'center',
      justifyContent: 'center',
    },
    nameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.xs,
    },
  });

  return (
    <TouchableOpacity style={[styles.card, style]} onPress={onPress}>
      <Image source={store.image} style={styles.image} resizeMode="cover" />
      <View style={styles.content}>
        <View style={styles.nameRow}>
          <View style={styles.avatar}>
            <Image source={store.image} style={{ width: 44, height: 44, borderRadius: 22 }} resizeMode="cover" />
          </View>
          <Text style={styles.name}>{store.name.replace(/Grocery|Pharmacy/gi, '').trim()}</Text>
        </View>
        <View style={styles.details}>
          <Text style={styles.detailText}>{store.distance}</Text>
          <View style={styles.rating}>
            <MaterialCommunityIcons 
              name="star" 
              size={16} 
              color={theme.colors.primary} 
            />
            <Text style={[styles.detailText, { marginLeft: 4 }]}> {store.rating}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default StoreCard;