import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

const ProfileDrawer = ({ onClose }: { onClose: () => void }) => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    drawer: {
      position: 'absolute',
      top: 0,
      right: 0,
      width: 280,
      height: '100%',
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.lg,
      ...theme.shadows.large,
    },
    closeBtn: {
      marginBottom: theme.spacing.xl,
      alignSelf: 'flex-end',
    },
    profileHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.xl,
    },
    profileText: {
      ...theme.typography.h2,
      color: theme.colors.text,
      marginLeft: theme.spacing.md,
    },
    optionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
    },
    optionText: {
      ...theme.typography.body1,
      color: theme.colors.text,
      marginLeft: theme.spacing.md,
    },
  });

  const options = [
    { id: '1', name: 'Edit Profile', icon: 'person-outline' as const },
    { id: '2', name: 'My Addresses', icon: 'location-outline' as const },
    { id: '3', name: 'Payment Methods', icon: 'card-outline' as const },
    { id: '4', name: 'Help Center', icon: 'help-circle-outline' as const },
    { id: '5', name: 'Logout', icon: 'log-out-outline' as const },
  ];

  return (
    <View style={styles.drawer}>
      <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
        <Ionicons name="close" size={28} color={theme.colors.text} />
      </TouchableOpacity>
      <View style={styles.profileHeader}>
        <Ionicons name="person-circle-outline" size={48} color={theme.colors.primary} />
        <Text style={styles.profileText}>My Profile</Text>
      </View>
      {options.map((option) => (
        <TouchableOpacity key={option.id} style={styles.optionItem}>
          <Ionicons name={option.icon} size={24} color={theme.colors.text} />
          <Text style={styles.optionText}>{option.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default ProfileDrawer;
