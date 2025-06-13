import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

const ProfileScreen = () => {
  const { theme } = useTheme();
  const options = [
    { id: '1', name: 'Edit Profile', icon: 'person' as const },
    { id: '2', name: 'My Addresses', icon: 'location' as const },
    { id: '3', name: 'Payment Methods', icon: 'card' as const },
    { id: '4', name: 'Help Center', icon: 'help-circle' as const },
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      padding: theme.spacing.md,
    },
    optionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      marginBottom: theme.spacing.md,
      ...theme.shadows.small,
    },
    optionText: {
      flex: 1,
      fontSize: 16,
      marginLeft: theme.spacing.md,
      color: theme.colors.text,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      {options.map((option) => (
        <TouchableOpacity key={option.id} style={styles.optionItem}>
          <Ionicons name={option.icon} size={24} color={theme.colors.primary} />
          <Text style={styles.optionText}>{option.name}</Text>
          <Ionicons name="chevron-forward" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      ))}
    </SafeAreaView>
  );
};

export default ProfileScreen; 